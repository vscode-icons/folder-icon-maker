(() => {
  const CLOSED =
    "M27.5 5.5h-9.3l-2.1 4.2H4.4v16.8h25.2v-21zm0 4.2h-8.2l1.1-2.1h7.1z";
  const OPENED =
    "M29.5 5.5H18.2l-2.1 4.2H4.3v16.8h25.2zm-2.1 18.7H6.6V11.8h20.8zm0-14.5h-8.2l1-2.1h7.1zm-1.7 4H.5l3.8 12.8h25.2z";
  const ROOT_ATTRS = [
    "fill",
    "fill-opacity",
    "fill-rule",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "clip-rule",
    "color",
    "opacity",
    "style",
    "class",
    "font-family",
    "font-size",
    "font-weight",
  ];
  // vscode-icons default_file, shown under each folder in the explorer preview
  const DEFAULT_FILE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#c5c5c5" d="M20.414,2H5V30H27V8.586ZM7,28V4H19v6h6V28Z"/></svg>';
  // vscode-icons logo
  const SAMPLE =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128"><defs><linearGradient id="a" x1="24.704" y1="32.447" x2="65.85" y2="32.447" gradientTransform="matrix(1, 0, 0, -1, -3.643, 119.837)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#007acc"/><stop offset="1" stop-opacity="0"/></linearGradient><linearGradient id="b" x1="24.704" y1="38.432" x2="65.85" y2="38.432" xlink:href="#a"/><linearGradient id="c" x1="24.704" y1="48.801" x2="65.85" y2="48.801" xlink:href="#a"/></defs><title>logo</title><path d="M49.335,100.26a12.87,12.87,0,1,1,9.1-3.77A12.87,12.87,0,0,1,49.335,100.26Z" style="fill:#062c3e;stroke-width:1.2000000476837158px;stroke:url(#a)"/><path d="M30.775,91.12a9.715,9.715,0,1,1,6.869-2.845A9.715,9.715,0,0,1,30.775,91.12Z" style="fill:#062c3e;stroke-width:1.2000000476837158px;stroke:url(#b)"/><path d="M44.118,86.16a15.124,15.124,0,1,1,10.694-4.43A15.124,15.124,0,0,1,44.118,86.16Z" style="fill:#062c3e;stroke-width:1.2000000476837158px;stroke:url(#c)"/><path d="M87.728,31.74,65.482,53.727l-12.55-9.451L38.069,49.233l15.971,15.8L38.069,80.826l14.863,4.963,12.55-9.456L87.728,98.326l19.212-8.161V39.9Zm1.018,45.293L72.44,64.988h.022L88.746,53.033Z" style="fill:#020e15"/><path d="M83.728,27.74,61.482,49.727l-12.55-9.451L34.069,45.233l15.971,15.8L34.069,76.826l14.863,4.963,12.55-9.456L83.728,94.326l19.212-8.161V35.9Zm1.018,45.293L68.44,60.988h.022L84.746,49.033Z" style="fill:#083a53"/><path d="M61.88,65.4,48.114,75.771,42.44,73.877l14-13.844-14-13.846,5.674-1.894L61.88,54.661l22.866-22.6L98.44,37.877v44.31L84.746,88.005Zm7.134-5.37L84.74,71.879V48.185Z" style="fill:#007acc"/></svg>';

  const state = {
    icons: [],
    size: 21,
    cx: 20.5,
    cy: 20.5,
    align: "br",
    zoom: false,
  };
  let uid = 0;
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => String(+(+n).toFixed(3));

  // ---------- color helpers ----------
  const hex2rgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgb2hex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  function rgb2hsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h =
        mx === r
          ? (g - b) / d + (g < b ? 6 : 0)
          : mx === g
            ? (b - r) / d + 2
            : (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hsl2hex(h, s, l) {
    const f = (n) => {
      const k = (n + h * 12) % 12,
        a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return rgb2hex(f(0) * 255, f(8) * 255, f(4) * 255);
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Folder colors derived from the icon's main color, kept far enough from it that the badge stays readable.
  const lum = (hex) => {
    const c = hex2rgb(hex).map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contrast = (a, b) => {
    const x = lum(a),
      y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  function deriveColors(hex) {
    const [h, s, l] = rgb2hsl(...hex2rgb(hex));
    const grey = s < 0.12,
      S = grey ? 0 : clamp(s * 0.6, 0.22, 0.55);
    const dir = l < 0.5 ? 1 : -1;
    const fit = (L, d) => {
      // move L away from the badge until contrast is good enough
      for (let k = 0; k < 2; k++) {
        let x = clamp(L, 0.22, 0.8);
        for (let i = 0; i < 20; i++) {
          if (contrast(hsl2hex(h, S, x), hex) >= 1.8) return hsl2hex(h, S, x);
          x += d * 0.025;
          if (x < 0.2 || x > 0.82) break;
        }
        d = -d;
        L = l + d * 0.2;
      }
      return hsl2hex(h, S, clamp(L, 0.22, 0.8));
    };
    const base = l + dir * 0.2;
    // light theme: prefer a darker folder so it holds up on a white sidebar
    // opened is always a lighter step of closed, like vscode's #5594bf -> #7bb4db
    const lighter = (hx, d) => {
      const [h2, s2, l2] = rgb2hsl(...hex2rgb(hx));
      return hsl2hex(h2, s2, clamp(l2 + d, 0, 0.88));
    };
    // keep folders visible on the editor background: dark-theme folders not too dark, light-theme ones not too pale
    const floor = (hx, lo, hi) => {
      const [h2, s2, l2] = rgb2hsl(...hex2rgb(hx));
      return hsl2hex(h2, s2, clamp(l2, lo, hi));
    };
    const dc = floor(fit(base, dir), 0.36, 0.8),
      lc = floor(fit(l - 0.27, -1), 0.2, 0.55);
    return { dc, do: lighter(dc, 0.13), lc, lo: lighter(lc, 0.1) };
  }
  // folder + opened colors for the theme this icon is made for
  function folderColors(icon) {
    const c = deriveColors(icon.main);
    return icon.light ? { c: c.lc, o: c.lo } : { c: c.dc, o: c.do };
  }

  // ---------- parsing ----------
  function slugify(name) {
    return (
      name
        .replace(/\.svg$/i, "")
        .replace(
          /^(folder_type_light_|folder_type_|file_type_light_|file_type_)/i,
          "",
        )
        .replace(/_opened$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "icon"
    );
  }
  const isLightName = (name) => /^(folder|file)_type_light_/i.test(name);

  function sanitize(root) {
    root
      .querySelectorAll("script,foreignObject,title,desc,metadata")
      .forEach((n) => n.remove());
    const walk = (el) => {
      [...el.attributes].forEach((a) => {
        if (/^on/i.test(a.name)) el.removeAttribute(a.name);
        if (/href$/i.test(a.name) && /^\s*javascript:/i.test(a.value))
          el.removeAttribute(a.name);
      });
      [...el.children].forEach(walk);
    };
    walk(root);
  }

  function prefixIds(root, prefix) {
    const map = {};
    root.querySelectorAll("[id]").forEach((el) => {
      const o = el.id,
        n = prefix + o;
      map[o] = n;
      el.id = n;
    });
    if (!Object.keys(map).length) return;
    const fix = (v) =>
      v.replace(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g, (m, id) =>
        map[id] ? `url(#${map[id]})` : m,
      );
    const all = [root, ...root.querySelectorAll("*")];
    all.forEach((el) =>
      [...el.attributes].forEach((a) => {
        if (
          /href$/i.test(a.name) &&
          a.value.startsWith("#") &&
          map[a.value.slice(1)]
        )
          a.value = "#" + map[a.value.slice(1)];
        else if (a.value.includes("url(")) a.value = fix(a.value);
      }),
    );
    root.querySelectorAll("style").forEach((s) => {
      s.textContent = fix(s.textContent);
    });
  }

  function parseSvg(text, filename) {
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const root = doc.documentElement;
    if (
      !root ||
      root.nodeName.toLowerCase() !== "svg" ||
      doc.querySelector("parsererror")
    )
      throw new Error("This file is not a valid SVG.");
    sanitize(root);
    const id = ++uid;
    prefixIds(root, "i" + id + "-");
    let vb = (root.getAttribute("viewBox") || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (vb.length !== 4 || vb.some(isNaN) || vb[2] <= 0 || vb[3] <= 0) {
      const w = parseFloat(root.getAttribute("width")) || 0,
        h = parseFloat(root.getAttribute("height")) || 0;
      vb = w && h ? [0, 0, w, h] : null;
    }
    const rootAttrs = {};
    ROOT_ATTRS.forEach((a) => {
      if (root.hasAttribute(a)) rootAttrs[a] = root.getAttribute(a);
    });
    const ser = new XMLSerializer();
    const inner = [...root.childNodes]
      .map((n) =>
        n.nodeType === 1
          ? ser.serializeToString(n)
          : n.nodeType === 3
            ? n.textContent.replace(/[<&]/g, (c) =>
                c === "<" ? "&lt;" : "&amp;",
              )
            : "",
      )
      .join("")
      .replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "");
    const usesXlink =
      /xlink:/.test(inner) ||
      Object.values(rootAttrs).some((v) => /xlink:/.test(v));
    const contentBox = measure(inner, rootAttrs, vb, usesXlink);
    if (!vb) vb = contentBox;
    if (!vb) throw new Error("Could not work out the size of this SVG.");
    const icon = {
      id,
      src: filename,
      name: slugify(filename),
      light: isLightName(filename),
      vb,
      inner,
      rootAttrs,
      usesXlink,
      contentBox,
      fit: "content",
      main: "#888888",
      colors: null,
      error: "",
    };
    return icon;
  }

  // Bounding box of what is actually drawn, limited to the visible viewBox.
  function measure(inner, rootAttrs, vb, usesXlink) {
    const NS = "http://www.w3.org/2000/svg";
    const host = document.createElementNS(NS, "svg");
    host.setAttribute("width", "200");
    host.setAttribute("height", "200");
    host.style.cssText =
      "position:absolute;left:-9999px;top:0;visibility:hidden";
    if (vb) host.setAttribute("viewBox", vb.join(" "));
    const g = document.createElementNS(NS, "g");
    Object.entries(rootAttrs).forEach(([k, v]) => {
      if (k !== "class") g.setAttribute(k, v);
    });
    g.innerHTML = inner;
    host.appendChild(g);
    document.body.appendChild(host);
    let b = null;
    try {
      const r = g.getBBox();
      if (r.width > 0 && r.height > 0) b = [r.x, r.y, r.width, r.height];
    } catch (e) {}
    host.remove();
    if (!b) return vb;
    // small pad for strokes, which getBBox leaves out
    const pad = Math.max(b[2], b[3]) * 0.015;
    let x1 = b[0] - pad,
      y1 = b[1] - pad,
      x2 = b[0] + b[2] + pad,
      y2 = b[1] + b[3] + pad;
    if (vb) {
      x1 = Math.max(x1, vb[0]);
      y1 = Math.max(y1, vb[1]);
      x2 = Math.min(x2, vb[0] + vb[2]);
      y2 = Math.min(y2, vb[1] + vb[3]);
    }
    if (x2 <= x1 || y2 <= y1) return vb;
    return [x1, y1, x2 - x1, y2 - y1];
  }

  function iconSvg(icon, size) {
    const attrs = Object.entries(icon.rootAttrs)
      .map(([k, v]) => ` ${k}="${esc(v)}"`)
      .join("");
    const sz = size ? ` width="${size}" height="${size}"` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg"${icon.usesXlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ""} viewBox="${icon.vb.map(fmt).join(" ")}"${sz}${attrs}>${icon.inner}</svg>`;
  }
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  const dataUrl = (svg) =>
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  // ---------- main color ----------
  function detectFromMarkup(icon) {
    const counts = {};
    const re =
      /(?:fill|stop-color|stroke)\s*[:=]\s*["']?\s*(#[0-9a-f]{3,6})\b/gi;
    let m;
    const all = icon.inner + JSON.stringify(icon.rootAttrs);
    while ((m = re.exec(all))) {
      const h =
        m[1].length === 4
          ? "#" +
            m[1]
              .slice(1)
              .split("")
              .map((c) => c + c)
              .join("")
          : m[1];
      counts[h.toLowerCase()] = (counts[h.toLowerCase()] || 0) + 1;
    }
    const list = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const chroma = list.find(([h]) => rgb2hsl(...hex2rgb(h))[1] >= 0.12);
    return (chroma || list[0] || ["#888888"])[0];
  }

  // Render the icon once: find its most used color and the box around the pixels that are actually visible.
  // Pixels are more reliable than getBBox, which also counts invisible shapes like transparent background rects.
  function analyze(icon) {
    return new Promise((resolve) => {
      const N = 512,
        [vx, vy, vw, vh] = icon.vb;
      const img = new Image();
      img.onload = () => {
        let main = null,
          box = null;
        try {
          const c = document.createElement("canvas");
          c.width = c.height = N;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(img, 0, 0, N, N);
          const d = x.getImageData(0, 0, N, N).data;
          const bins = {},
            grey = {};
          let chromaN = 0,
            opaque = 0,
            x0 = N,
            y0 = N,
            x1 = -1,
            y1 = -1;
          for (let p = 0, i = 0; i < d.length; i += 4, p++) {
            const a = d[i + 3];
            if (a < 10) continue;
            const px = p % N,
              py = (p / N) | 0;
            if (px < x0) x0 = px;
            if (px > x1) x1 = px;
            if (py < y0) y0 = py;
            if (py > y1) y1 = py;
            if (a < 128 || p % 3) continue;
            opaque++;
            const r = d[i],
              g = d[i + 1],
              b = d[i + 2],
              [, s, l] = rgb2hsl(r, g, b);
            const key = (r >> 4) + "," + (g >> 4) + "," + (b >> 4);
            const tgt =
              s < 0.12 || l < 0.07 || l > 0.96 ? grey : (chromaN++, bins);
            const e = tgt[key] || (tgt[key] = [0, 0, 0, 0]);
            e[0] += r;
            e[1] += g;
            e[2] += b;
            e[3]++;
          }
          const pick = (o) => Object.values(o).sort((a, b) => b[3] - a[3])[0];
          const best =
            chromaN >= opaque * 0.04 && chromaN > 0 ? pick(bins) : pick(grey);
          if (best)
            main = rgb2hex(
              best[0] / best[3],
              best[1] / best[3],
              best[2] / best[3],
            );
          if (x1 >= x0 && y1 >= y0) {
            const sc = N / Math.max(vw, vh),
              ox = (N - vw * sc) / 2,
              oy = (N - vh * sc) / 2;
            const bx0 = vx + (x0 - ox) / sc,
              by0 = vy + (y0 - oy) / sc,
              bx1 = vx + (x1 + 1 - ox) / sc,
              by1 = vy + (y1 + 1 - oy) / sc;
            box = [bx0, by0, bx1 - bx0, by1 - by0];
          }
        } catch (e) {}
        resolve({ main: main || detectFromMarkup(icon), box });
      };
      img.onerror = () => resolve({ main: detectFromMarkup(icon), box: null });
      img.src = dataUrl(iconSvg(icon, N));
    });
  }

  // ---------- flattening ----------
  // the badge's shapes are moved into folder coordinates instead of sitting in a nested <svg>
  const ID = [1, 0, 0, 1, 0, 0];
  const CONTAINERS = ["g", "a", "svg"];
  // never drawn directly, copied as they are
  const UNRENDERED = [
    "linearGradient",
    "radialGradient",
    "clipPath",
    "mask",
    "pattern",
    "filter",
    "symbol",
    "marker",
    "style",
    "defs",
  ];
  const LENGTHS = ["stroke-width", "stroke-dasharray", "stroke-dashoffset"];
  const INHERITED = [
    "fill",
    "fill-opacity",
    "fill-rule",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "clip-rule",
    "color",
    "visibility",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "paint-order",
    "marker",
    "marker-start",
    "marker-mid",
    "marker-end",
  ];
  const GEOMETRY = {
    path: ["d"],
    rect: ["x", "y", "width", "height", "rx", "ry"],
    circle: ["cx", "cy", "r"],
    ellipse: ["cx", "cy", "rx", "ry"],
    line: ["x1", "y1", "x2", "y2"],
    polyline: ["points"],
    polygon: ["points"],
  };
  // elements using these keep their transform
  const NO_BAKE = [
    "clip-path",
    "mask",
    "filter",
    "marker",
    "marker-start",
    "marker-mid",
    "marker-end",
  ];

  const mul = (m, n) => [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
  const tol = (m) =>
    1e-6 *
    (Math.abs(m[0]) + Math.abs(m[1]) + Math.abs(m[2]) + Math.abs(m[3]));
  // uniform scale and rotation only
  const similar = (m) =>
    (Math.abs(m[0] - m[3]) <= tol(m) && Math.abs(m[1] + m[2]) <= tol(m)) ||
    (Math.abs(m[0] + m[3]) <= tol(m) && Math.abs(m[1] - m[2]) <= tol(m));
  const axisAligned = (m) =>
    Math.abs(m[1]) <= tol(m) && Math.abs(m[2]) <= tol(m) && m[0] > 0 && m[3] > 0;
  const matrix = (m) =>
    `matrix(${m.map((n) => String(+n.toFixed(6))).join(" ")})`;
  const has = (v) => v != null && v.trim() !== "none";

  function parseTransform(t) {
    let m = ID;
    const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
    let r;
    while (t && (r = re.exec(t))) {
      const v = r[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
      const rad = ((v[0] || 0) * Math.PI) / 180;
      let n = ID;
      if (r[1] === "matrix" && v.length === 6) n = v;
      if (r[1] === "translate") n = [1, 0, 0, 1, v[0] || 0, v[1] || 0];
      if (r[1] === "scale") n = [v[0] ?? 1, 0, 0, v[1] ?? v[0] ?? 1, 0, 0];
      if (r[1] === "rotate") {
        const c = Math.cos(rad),
          s = Math.sin(rad),
          x = v[1] || 0,
          y = v[2] || 0;
        n = [c, s, -s, c, x - c * x + s * y, y - s * x - c * y];
      }
      if (r[1] === "skewX") n = [1, 0, Math.tan(rad), 1, 0, 0];
      if (r[1] === "skewY") n = [1, Math.tan(rad), 0, 1, 0, 0];
      m = mul(m, n.some(isNaN) ? ID : n);
    }
    return m;
  }

  function parseStyle(s) {
    const o = {};
    (s || "").split(";").forEach((d) => {
      const i = d.indexOf(":");
      if (i > 0) o[d.slice(0, i).trim().toLowerCase()] = d.slice(i + 1).trim();
    });
    return o;
  }

  // parse path data into absolute segments
  function parsePath(d) {
    const segs = [],
      num = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;
    let i = 0,
      cmd = "",
      x = 0,
      y = 0,
      sx = 0,
      sy = 0;
    const skip = () => {
      while (i < d.length && /[\s,]/.test(d[i])) i++;
    };
    const n = () => {
      skip();
      num.lastIndex = i;
      const m = num.exec(d);
      if (!m) throw 0;
      i = num.lastIndex;
      return +m[0];
    };
    const flag = () => {
      skip();
      const c = d[i++];
      if (c !== "0" && c !== "1") throw 0;
      return +c;
    };
    try {
      for (;;) {
        skip();
        if (i >= d.length) break;
        if (/[a-z]/i.test(d[i])) cmd = d[i++];
        else if (!cmd) throw 0;
        const rel = cmd === cmd.toLowerCase(),
          ox = rel ? x : 0,
          oy = rel ? y : 0,
          last = segs.at(-1);
        switch (cmd.toUpperCase()) {
          case "M":
            x = sx = ox + n();
            y = sy = oy + n();
            segs.push(["M", x, y]);
            cmd = rel ? "l" : "L";
            break;
          case "L":
            x = ox + n();
            y = oy + n();
            segs.push(["L", x, y]);
            break;
          case "H":
            x = ox + n();
            segs.push(["L", x, y]);
            break;
          case "V":
            y = oy + n();
            segs.push(["L", x, y]);
            break;
          case "C": {
            const c = [ox + n(), oy + n(), ox + n(), oy + n()];
            x = ox + n();
            y = oy + n();
            segs.push(["C", ...c, x, y]);
            break;
          }
          case "S": {
            const r = last && last[0] === "C";
            const c = [r ? 2 * x - last[3] : x, r ? 2 * y - last[4] : y];
            c.push(ox + n(), oy + n());
            x = ox + n();
            y = oy + n();
            segs.push(["C", ...c, x, y]);
            break;
          }
          case "Q": {
            const c = [ox + n(), oy + n()];
            x = ox + n();
            y = oy + n();
            segs.push(["Q", ...c, x, y]);
            break;
          }
          case "T": {
            const r = last && last[0] === "Q";
            const c = [r ? 2 * x - last[1] : x, r ? 2 * y - last[2] : y];
            x = ox + n();
            y = oy + n();
            segs.push(["Q", ...c, x, y]);
            break;
          }
          case "A": {
            const a = [n(), n(), n(), flag(), flag()];
            x = ox + n();
            y = oy + n();
            segs.push(["A", ...a, x, y]);
            break;
          }
          case "Z":
            segs.push(["Z"]);
            x = sx;
            y = sy;
            cmd = "";
            break;
          default:
            throw 0;
        }
      }
    } catch (e) {}
    return segs;
  }

  // convert basic shapes to path segments
  function shapeSegs(el) {
    const tag = el.localName;
    if (tag === "path") return parsePath(el.getAttribute("d") || "");
    const n = (k) => {
      const v = (el.getAttribute(k) ?? "0").trim().replace(/px$/i, "");
      return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(v) ? +v : NaN;
    };
    if (tag === "polyline" || tag === "polygon") {
      const p = (el.getAttribute("points") || "")
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      if (p.some(isNaN)) return null;
      const segs = [];
      for (let i = 0; i + 1 < p.length; i += 2)
        segs.push([i ? "L" : "M", p[i], p[i + 1]]);
      if (tag === "polygon" && segs.length) segs.push(["Z"]);
      return segs;
    }
    if (tag === "line") {
      const v = [n("x1"), n("y1"), n("x2"), n("y2")];
      return v.some(isNaN)
        ? null
        : [
            ["M", v[0], v[1]],
            ["L", v[2], v[3]],
          ];
    }
    if (tag === "circle" || tag === "ellipse") {
      const cx = n("cx"),
        cy = n("cy"),
        rx = tag === "circle" ? n("r") : n("rx"),
        ry = tag === "circle" ? rx : n("ry");
      if ([cx, cy, rx, ry].some(isNaN)) return null;
      if (rx <= 0 || ry <= 0) return [];
      return [
        ["M", cx - rx, cy],
        ["A", rx, ry, 0, 1, 0, cx + rx, cy],
        ["A", rx, ry, 0, 1, 0, cx - rx, cy],
        ["Z"],
      ];
    }
    if (tag === "rect") {
      const x = n("x"),
        y = n("y"),
        w = n("width"),
        h = n("height");
      let rx = el.hasAttribute("rx") ? n("rx") : null,
        ry = el.hasAttribute("ry") ? n("ry") : null;
      rx ??= ry ?? 0;
      ry ??= rx;
      if ([x, y, w, h, rx, ry].some(isNaN)) return null;
      if (w <= 0 || h <= 0) return [];
      rx = Math.min(rx, w / 2);
      ry = Math.min(ry, h / 2);
      if (rx <= 0 || ry <= 0)
        return [
          ["M", x, y],
          ["L", x + w, y],
          ["L", x + w, y + h],
          ["L", x, y + h],
          ["Z"],
        ];
      const a = (ex, ey) => ["A", rx, ry, 0, 0, 1, ex, ey];
      // sides are left out when the corners already meet
      return [
        ["M", x + rx, y],
        w > 2 * rx && ["L", x + w - rx, y],
        a(x + w, y + ry),
        h > 2 * ry && ["L", x + w, y + h - ry],
        a(x + w - rx, y + h),
        w > 2 * rx && ["L", x + rx, y + h],
        a(x, y + h - ry),
        h > 2 * ry && ["L", x, y + ry],
        a(x + rx, y),
        ["Z"],
      ].filter(Boolean);
    }
    return null;
  }

  // transform arc radii and rotation
  function arcThrough(rx, ry, rot, m) {
    const t = (rot * Math.PI) / 180,
      c = Math.cos(t),
      s = Math.sin(t);
    const p = (m[0] * c + m[2] * s) * rx,
      q = (m[2] * c - m[0] * s) * ry,
      r = (m[1] * c + m[3] * s) * rx,
      u = (m[3] * c - m[1] * s) * ry;
    const E = (p + u) / 2,
      F = (p - u) / 2,
      G = (r + q) / 2,
      H = (r - q) / 2;
    const Q = Math.hypot(E, H),
      R = Math.hypot(F, G);
    const phi = (Math.atan2(H, E) + Math.atan2(G, F)) / 2;
    return [Q + R, Math.abs(Q - R), (phi * 180) / Math.PI];
  }

  function transformSegs(segs, m) {
    const flip = m[0] * m[3] - m[1] * m[2] < 0;
    return segs.map((s) => {
      if (s[0] === "Z") return s;
      if (s[0] === "A") {
        const [, rx, ry, rot, large, sweep, x, y] = s;
        return [
          "A",
          ...(rx && ry ? arcThrough(rx, ry, rot, m) : [rx, ry, rot]),
          large,
          flip ? 1 - sweep : sweep,
          m[0] * x + m[2] * y + m[4],
          m[1] * x + m[3] * y + m[5],
        ];
      }
      const out = [s[0]];
      for (let i = 1; i < s.length; i += 2)
        out.push(
          m[0] * s[i] + m[2] * s[i + 1] + m[4],
          m[1] * s[i] + m[3] * s[i + 1] + m[5],
        );
      return out;
    });
  }

  // segments back to path data
  function pathData(segs) {
    const R = (n) => +n.toFixed(2);
    const num = (n) => {
      const s = String(+n.toFixed(3));
      return s === "-0" ? "0" : s.replace(/^(-?)0\./, "$1.");
    };
    // how far apart two points are, measured in arc radii (1 means a half ellipse)
    const span = (rx, ry, rot, ax, ay, bx, by) => {
      const t = (rot * Math.PI) / 180,
        dx = (ax - bx) / 2,
        dy = (ay - by) / 2;
      const u = Math.cos(t) * dx + Math.sin(t) * dy,
        v = Math.cos(t) * dy - Math.sin(t) * dx;
      return (u * u) / (rx * rx) + (v * v) / (ry * ry);
    };
    let out = "",
      last = "",
      prev = null,
      cx = 0,
      cy = 0,
      sx = 0,
      sy = 0,
      fx = 0,
      fy = 0,
      fsx = 0,
      fsy = 0;
    const enc = (L, vals) => {
      const implicit =
        (L === last && !/[mz]/i.test(L)) ||
        (last === "M" && L === "L") ||
        (last === "m" && L === "l");
      let s = implicit ? "" : L,
        p = implicit ? prev : null;
      vals.forEach((v) => {
        const t = num(v);
        if (p !== null && t[0] !== "-" && !(t[0] === "." && p.includes(".")))
          s += " ";
        s += t;
        p = t;
      });
      return [s, L, p];
    };
    const put = (A, a, r) => {
      const x = enc(A, a),
        y = enc(A.toLowerCase(), r);
      [out, last, prev] = [
        out + (y[0].length <= x[0].length ? y : x)[0],
        ...(y[0].length <= x[0].length ? y : x).slice(1),
      ];
    };
    for (const s of segs) {
      if (s[0] === "Z") {
        out += "z";
        last = "z";
        prev = null;
        cx = sx;
        cy = sy;
        fx = fsx;
        fy = fsy;
        continue;
      }
      const pts = s.slice(1).map(R),
        X = pts.at(-2),
        Y = pts.at(-1);
      const rel = (v, i) => R(v - (i % 2 ? cy : cx));
      if (s[0] === "A") {
        let [, rx, ry] = s;
        const [, , rot, la, sw] = pts;
        // rounded end points change how much of the ellipse the arc covers, so the radii are fitted to them.
        // A half ellipse gets radii a bit too small, which the browser stretches to fit exactly.
        if (rx && ry) {
          const before = span(rx, ry, s[3], fx, fy, s[6], s[7]),
            after = span(rx, ry, rot, cx, cy, X, Y);
          if (before && after) {
            const half = before > 0.999,
              k = Math.sqrt(half ? after : after / before);
            const r = (v) =>
              half ? Math.floor(v * k * 1000) / 1000 : +(v * k).toFixed(3);
            if (r(rx) > 0 && r(ry) > 0) [rx, ry] = [r(rx), r(ry)];
          }
        }
        put(
          "A",
          [rx, ry, rot, la, sw, X, Y],
          [rx, ry, rot, la, sw, R(X - cx), R(Y - cy)],
        );
      } else if (s[0] === "L" && Y === cy && X !== cx) put("H", [X], [R(X - cx)]);
      else if (s[0] === "L" && X === cx && Y !== cy) put("V", [Y], [R(Y - cy)]);
      else put(s[0], pts, pts.map(rel));
      cx = X;
      cy = Y;
      fx = s.at(-2);
      fy = s.at(-1);
      if (s[0] === "M") {
        sx = X;
        sy = Y;
        fsx = fx;
        fsy = fy;
      }
    }
    return out;
  }

  // viewBox transform of a nested <svg>
  function viewport(el) {
    const n = (k, d) => {
      const v = el.getAttribute(k);
      return v == null ? d : /^[-+.\d]+(px)?$/i.test(v.trim()) ? parseFloat(v) : NaN;
    };
    const x = n("x", 0),
      y = n("y", 0);
    const par = (el.getAttribute("preserveAspectRatio") || "xMidYMid").trim();
    const vb = (el.getAttribute("viewBox") || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (isNaN(x) || isNaN(y)) return null;
    if (vb.length !== 4) return [1, 0, 0, 1, x, y];
    const w = n("width", NaN),
      h = n("height", NaN);
    if (
      vb.some(isNaN) ||
      vb[2] <= 0 ||
      vb[3] <= 0 ||
      !(w > 0 && h > 0) ||
      !/^xMidYMid( meet)?$/.test(par)
    )
      return null;
    const s = Math.min(w / vb[2], h / vb[3]);
    return [
      s,
      0,
      0,
      s,
      x + (w - vb[2] * s) / 2 - vb[0] * s,
      y + (h - vb[3] * s) / 2 - vb[1] * s,
    ];
  }

  function flatten(icon, m) {
    const doc = (icon.doc ||= new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg"${icon.usesXlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ""}>${icon.inner}</svg>`,
      "image/svg+xml",
    ));
    if (doc.querySelector("parsererror")) return null;
    const ser = new XMLSerializer();
    const out = (node) =>
      ser
        .serializeToString(node)
        .replace(/ xmlns(:xlink)?="[^"]*"/g, "");
    const byId = (id) => doc.querySelector(`[id="${CSS.escape(id)}"]`);
    const TOKEN = "\u0000clones\u0000";
    const clones = {},
      cloned = [];
    let defsSeen = false;
    const styled = !!doc.querySelector("style");

    // copy userSpaceOnUse gradients with the transform applied
    function paint(v, mm) {
      const r = /url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/.exec(v);
      if (!r) return v;
      const el = byId(r[1]);
      if (!el || !/Gradient$/.test(el.localName)) return null;
      let units = null,
        gt = null,
        cur = el;
      for (let k = 0; cur && k < 10; k++) {
        units ??= cur.getAttribute("gradientUnits");
        gt ??= cur.getAttribute("gradientTransform");
        const h = cur.getAttribute("href") || cur.getAttribute("xlink:href");
        cur = h && h.startsWith("#") ? byId(h.slice(1)) : null;
      }
      if (units !== "userSpaceOnUse") return axisAligned(mm) ? v : null;
      const key = r[1] + "|" + mm.join(",");
      if (!clones[key]) {
        const c = el.cloneNode(true);
        clones[key] = c.id = `${r[1]}-f${cloned.length + 1}`;
        c.setAttribute(
          "gradientTransform",
          matrix(mul(mm, parseTransform(gt))),
        );
        cloned.push(out(c));
      }
      return v.replace(r[0], `url(#${clones[key]})`);
    }

    // inherited values are {v, s}: s is the scale they were written at, null if not written yet
    function prep(el, st, mm, inh, skip) {
      const s = Math.sqrt(Math.abs(mm[0] * mm[3] - mm[1] * mm[2]));
      const attrs = {},
        style = { ...st };
      Object.entries(inh).forEach(([k, e]) => {
        if (st[k] != null || el.hasAttribute(k)) return;
        if (e.s == null || (LENGTHS.includes(k) && Math.abs(e.s - s) > 1e-6))
          attrs[k] = e.v;
      });
      [...el.attributes].forEach((a) => {
        if (!["transform", "style", ...skip].includes(a.name))
          attrs[a.name] = a.value;
      });
      const both = (k) => style[k] ?? attrs[k];
      if (both("vector-effect") !== "non-scaling-stroke")
        for (const k of LENGTHS)
          for (const o of [attrs, style]) {
            if (o[k] == null || o[k].trim() === "none") continue;
            const parts = o[k].trim().split(/[\s,]+/);
            if (
              !similar(mm) ||
              !parts.every((p) =>
                /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?(px)?$/i.test(p),
              )
            )
              return null;
            o[k] = parts.map((p) => fmt(parseFloat(p) * s)).join(" ");
          }
      for (const k of ["fill", "stroke"])
        for (const o of [attrs, style])
          if (o[k] && o[k].includes("url(")) {
            const v = paint(o[k], mm);
            if (v == null) return null;
            o[k] = v;
          }
      const next = { ...inh };
      INHERITED.forEach((k) => {
        const v = st[k] ?? el.getAttribute(k);
        if (v != null && v.trim() !== "inherit") next[k] = { v: v.trim(), s };
        else if (next[k] && next[k].s == null) next[k] = { v: next[k].v, s };
      });
      return { attrs, style, s, both, next };
    }

    const attrStr = ({ attrs, style }) =>
      Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${esc(v)}"`)
        .join("") +
      (Object.keys(style).length
        ? ` style="${esc(
            Object.entries(style)
              .map(([k, v]) => `${k}:${v}`)
              .join(";"),
          )}"`
        : "");

    function bake(el, st, mm, inh) {
      const segs = shapeSegs(el);
      if (!segs || !segs.length) return null;
      const p = prep(el, st, mm, inh, GEOMETRY[el.localName]);
      if (!p || NO_BAKE.some((k) => has(p.both(k)) || has(inh[k]?.v)))
        return null;
      if (has(p.both("stroke") ?? inh.stroke?.v)) {
        if (!similar(mm)) return null;
        if (
          p.both("stroke-width") == null &&
          !inh["stroke-width"] &&
          p.both("vector-effect") !== "non-scaling-stroke" &&
          Math.abs(p.s - 1) > 1e-6
        )
          p.attrs["stroke-width"] = fmt(p.s);
      }
      return `<path${attrStr(p)} d="${pathData(transformSegs(segs, mm))}"/>`;
    }

    // left as it is, placed with a transform attribute
    function keep(el, st, mm, inh) {
      const c = el.cloneNode(true);
      c.removeAttribute("transform");
      if (mm.join() !== ID.join()) c.setAttribute("transform", matrix(mm));
      Object.entries(inh).forEach(([k, e]) => {
        if (st[k] != null || el.hasAttribute(k)) return;
        if (e.s == null || (LENGTHS.includes(k) && Math.abs(e.s - 1) > 1e-6))
          c.setAttribute(k, e.v);
      });
      return out(c);
    }

    function group(el, st, mm, inh) {
      const tag = el.localName;
      const vp = tag === "svg" ? viewport(el) : ID;
      if (
        !vp ||
        ["clip-path", "mask", "filter"].some((k) =>
          has(st[k] ?? el.getAttribute(k)),
        )
      )
        return keep(el, st, mm, inh);
      const g = mul(mm, vp);
      const p = prep(
        el,
        st,
        g,
        inh,
        tag === "svg"
          ? ["x", "y", "width", "height", "viewBox", "preserveAspectRatio"]
          : [],
      );
      if (!p) return keep(el, st, mm, inh);
      // a nested <svg> in the source becomes a plain group
      const name = tag === "svg" ? "g" : tag;
      const kids = [...el.children].map((c) => walk(c, g, p.next)).join("");
      return `<${name}${attrStr(p)}>${kids}</${name}>`;
    }

    function walk(el, mm, inh) {
      const tag = el.localName;
      if (tag === "defs" && !defsSeen) {
        defsSeen = true;
        const d = out(el);
        return d.endsWith("/>")
          ? d.slice(0, -2) + `>${TOKEN}</defs>`
          : d.slice(0, -7) + TOKEN + "</defs>";
      }
      if (UNRENDERED.includes(tag)) return out(el);
      const st = parseStyle(el.getAttribute("style"));
      if ((st.display ?? el.getAttribute("display")) === "none") return out(el);
      const own = mul(mm, parseTransform(el.getAttribute("transform")));
      // stylesheet rules can set strokes we can't see, so the transform is kept instead
      if (styled) return keep(el, st, own, inh);
      if (CONTAINERS.includes(tag)) return group(el, st, own, inh);
      if (GEOMETRY[tag]) {
        const p = bake(el, st, own, inh);
        if (p != null) return p;
      }
      return keep(el, st, own, inh);
    }

    const rst = parseStyle(icon.rootAttrs.style),
      rget = (k) => rst[k] ?? icon.rootAttrs[k];
    if (["clip-path", "mask", "filter"].some((k) => has(rget(k)))) return null;
    // the root's inherited attributes go onto its children
    const inh = {};
    INHERITED.forEach((k) => {
      const v = rget(k);
      if (v != null && v.trim() !== "inherit")
        inh[k] = { v: v.trim(), s: null };
    });
    let html = [...doc.documentElement.children]
      .map((c) => walk(c, m, inh))
      .join("");
    const op = rget("opacity");
    if (op != null && parseFloat(op) < 1)
      html = `<g opacity="${esc(op)}">${html}</g>`;
    if (!cloned.length) return html.replace(TOKEN, "");
    return defsSeen
      ? html.replace(TOKEN, cloned.join(""))
      : `<defs>${cloned.join("")}</defs>${html}`;
  }

  // ---------- building ----------
  function badgeMarkup(icon) {
    const b = icon.fit === "viewBox" ? icon.vb : icon.contentBox || icon.vb;
    const S = state.size,
      sc = S / Math.max(b[2], b[3]);
    const w = b[2] * sc,
      h = b[3] * sc;
    // bottom-right: artwork that isn't square hugs the box's right and bottom edges, like the built-in badges
    const x = state.align === "br" ? state.cx + S / 2 - w : state.cx - w / 2;
    const y = state.align === "br" ? state.cy + S / 2 - h : state.cy - h / 2;
    try {
      const flat = flatten(icon, [sc, 0, 0, sc, x - b[0] * sc, y - b[1] * sc]);
      if (flat != null) return flat;
    } catch (e) {}
    const attrs = Object.entries(icon.rootAttrs)
      .map(([k, v]) => ` ${k}="${esc(v)}"`)
      .join("");
    return `<svg x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" viewBox="${b.map(fmt).join(" ")}"${attrs}>${icon.inner}</svg>`;
  }

  function outputs(icon) {
    const c = icon.colors,
      badge = badgeMarkup(icon);
    const head = `<svg xmlns="http://www.w3.org/2000/svg"${icon.usesXlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ""} viewBox="0 0 32 32">`;
    const make = (title, fill, d) =>
      `${head}<title>${title}</title><path fill="${fill}" d="${d}"/>${badge}</svg>`;
    const base = prefix(icon) + (icon.name || "icon");
    return [
      { file: `${base}.svg`, open: false, svg: make(base, c.c, CLOSED) },
      {
        file: `${base}_opened.svg`,
        open: true,
        svg: make(`${base}_opened`, c.o, OPENED),
      },
    ];
  }
  const prefix = (icon) => (icon.light ? "folder_type_light_" : "folder_type_");

  // ---------- adding ----------
  async function addIcon(text, filename) {
    const icon = parseSvg(text, filename);
    const r = await analyze(icon);
    icon.main = r.main;
    if (r.box) icon.contentBox = r.box;
    icon.colors = folderColors(icon);
    state.icons.push(icon);
    state.focus = icon.id;
  }

  async function addFiles(files) {
    const errs = [];
    for (const f of files) {
      if (!/\.svg$/i.test(f.name) && f.type !== "image/svg+xml") {
        errs.push(`${f.name}: only SVG files work here.`);
        continue;
      }
      try {
        await addIcon(await f.text(), f.name);
      } catch (e) {
        errs.push(`${f.name}: ${e.message}`);
      }
    }
    render();
    if (errs.length)
      toast(errs[0] + (errs.length > 1 ? ` (+${errs.length - 1} more)` : ""));
  }

  // ---------- rendering ----------
  function render() {
    const box = $("items");
    $("clearAll").disabled = $("zipAll").disabled = !state.icons.length;
    if (!state.icons.length) {
      box.innerHTML =
        '<p class="empty">No folders yet. Drop file icons above, paste SVG code, or try the sample.</p>';
      renderExplorer();
      renderSpecimen();
      return;
    }
    box.innerHTML = "";
    state.icons.forEach((icon) => box.appendChild(renderItem(icon)));
    renderExplorer();
    renderSpecimen();
  }

  // The big grid at the top shows the selected icon's closed folder (or the newest one).
  function renderSpecimen() {
    const icon =
      state.icons.find((i) => i.id === state.focus) || state.icons.at(-1);
    const img = $("specImg");
    if (icon) {
      const [closed] = outputs(icon);
      img.setAttribute("href", dataUrl(closed.svg));
      $("specName").textContent = closed.file;
    } else {
      img.removeAttribute("href");
      $("specName").textContent = "No folder yet";
    }
    $("specGhost").style.display = icon ? "none" : "";
    document
      .querySelectorAll(".item")
      .forEach((el) =>
        el.classList.toggle("is-focus", !!icon && +el.dataset.id === icon.id),
      );
  }

  function colorInput(icon, key, label) {
    return `<label class="swatch">${label}<input type="color" data-k="${key}" value="${icon.colors[key]}" aria-label="${label} color"></label>`;
  }

  function renderItem(icon) {
    const el = document.createElement("div");
    el.className = "item";
    el.dataset.id = icon.id;
    const outs = outputs(icon);
    const tile = () =>
      outs
        .map(
          (o) =>
            `<img src="${dataUrl(o.svg)}" width="32" height="32" alt="${o.file}"><img src="${dataUrl(o.svg)}" width="16" height="16" alt="">`,
        )
        .join("");
    el.innerHTML = `
      <div class="thumb"><img src="${dataUrl(iconSvg(icon))}" alt=""></div>
      <div class="meta">
        <div class="top">
          <div class="namebox"><span>${prefix(icon)}</span><input value="${esc(icon.name)}" data-act="name" aria-label="Folder name" spellcheck="false"></div>
          <select class="field" data-act="variant" aria-label="Theme this icon is for">
            <option value="dark"${icon.light ? "" : " selected"}>Dark theme</option>
            <option value="light"${icon.light ? " selected" : ""}>Light theme</option>
          </select>
          <select class="field" data-act="fit" aria-label="How to fit the badge">
            <option value="content"${icon.fit === "content" ? " selected" : ""}>Fit to artwork</option>
            <option value="viewBox"${icon.fit === "viewBox" ? " selected" : ""}>Fit to viewBox</option>
          </select>
          <button type="button" class="btn small remove" data-act="remove">Remove</button>
          <span class="src">From ${esc(icon.src)}</span>
        </div>
        <div class="colors">
          <span class="swatch"><span class="chip" style="background:${icon.main}"></span>Main color <b>${icon.main}</b></span>
          ${colorInput(icon, "c", "Folder")}${colorInput(icon, "o", "Opened")}
          <button type="button" class="linkbtn" data-act="recolor">Reset colors</button>
        </div>
        <div class="previews">
          <div class="tile dark">${tile()}</div>
          <div class="tile light">${tile()}</div>
        </div>
        <div class="files">
          ${outs
            .map(
              (
                o,
                i,
              ) => `<div class="file"><code>${o.file}</code><span class="size">${new Blob([o.svg]).size} B</span>
            <button type="button" class="btn small" data-act="copy" data-i="${i}">Copy</button>
            <button type="button" class="btn small" data-act="save" data-i="${i}">Download</button></div>`,
            )
            .join("")}
          <details class="code"><summary>Show code</summary>${outs.map((o) => `<pre aria-label="${o.file}">${esc(o.svg)}</pre>`).join("")}</details>
        </div>
      </div>`;
    return el;
  }

  // One row group per folder name. Each theme uses its own variant and falls back to the other one, like vscode-icons does.
  function renderExplorer() {
    const names = [...new Set(state.icons.map((i) => i.name))];
    const rows = (theme) =>
      names.length
        ? names
            .map((name) => {
              const same = state.icons.filter((i) => i.name === name);
              const icon =
                same.find((i) => i.light === (theme === "light")) || same[0];
              const [closed, opened] = outputs(icon);
              return `<div class="erow"><span class="tw">›</span><img src="${dataUrl(closed.svg)}" alt="">${esc(icon.name)}</div>
        <div class="erow"><span class="tw">⌄</span><img src="${dataUrl(opened.svg)}" alt="">${esc(icon.name)}</div>
        <div class="erow child"><img src="${dataUrl(DEFAULT_FILE)}" alt="">index.ts</div>`;
            })
            .join("")
        : '<div class="erow" style="opacity:.6">Your folders appear here</div>';
    $("exDark").innerHTML = rows("dark");
    $("exLight").innerHTML = rows("light");
    $("explorers").classList.toggle("zoom2", state.zoom);
  }

  function updateItem(icon) {
    const old = document.querySelector(`.item[data-id="${icon.id}"]`);
    if (!old) return render();
    const open = old.querySelector("details")?.open;
    const focusK = document.activeElement?.dataset?.k;
    const fresh = renderItem(icon);
    old.replaceWith(fresh);
    if (open) fresh.querySelector("details").open = true;
    if (focusK) fresh.querySelector(`[data-k="${focusK}"]`)?.focus();
    renderExplorer();
    renderSpecimen();
  }

  // ---------- actions ----------
  const findIcon = (el) =>
    state.icons.find((i) => i.id === +el.closest(".item").dataset.id);

  $("items").addEventListener("click", async (e) => {
    const item = e.target.closest(".item");
    if (item && state.focus !== +item.dataset.id) {
      state.focus = +item.dataset.id;
      renderSpecimen();
    }
    const btn = e.target.closest("[data-act]");
    if (!btn || btn.tagName === "INPUT" || btn.tagName === "SELECT") return;
    const icon = findIcon(btn),
      act = btn.dataset.act;
    if (act === "remove") {
      state.icons = state.icons.filter((i) => i !== icon);
      render();
    }
    if (act === "recolor") {
      icon.colors = folderColors(icon);
      updateItem(icon);
    }
    if (act === "copy") {
      const o = outputs(icon)[+btn.dataset.i];
      copyText(o.svg)
        ? toast(`Copied ${o.file}`)
        : toast('Copy failed. Open "Show code" and copy it from there.');
    }
    if (act === "save") {
      const o = outputs(icon)[+btn.dataset.i];
      save(o.file, o.svg);
    }
  });
  $("items").addEventListener("input", (e) => {
    const t = e.target,
      icon = findIcon(t);
    if (t.dataset.k) {
      icon.colors[t.dataset.k] = t.value;
      clearTimeout(t._t);
      t._t = setTimeout(() => updateItem(icon), 60);
    }
    if (t.dataset.act === "name") {
      icon.name = slugify(t.value || "icon");
    }
  });
  $("items").addEventListener("change", (e) => {
    const t = e.target,
      icon = findIcon(t);
    if (t.dataset.act === "name") {
      t.value = icon.name;
      updateItem(icon);
    }
    if (t.dataset.act === "fit") {
      icon.fit = t.value;
      updateItem(icon);
    }
    if (t.dataset.act === "variant") {
      icon.light = t.value === "light";
      icon.colors = folderColors(icon);
      updateItem(icon);
    }
  });

  function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        return true;
      }
    } catch (e) {}
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;left:-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    ta.remove();
    return ok;
  }

  function save(filename, data) {
    const blob =
      data instanceof Blob ? data : new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(`Saved ${filename}`);
  }

  $("zipAll").addEventListener("click", async () => {
    if (!window.JSZip)
      return toast(
        "The zip library did not load. Download files one by one instead.",
      );
    const zip = new JSZip();
    const used = new Set();
    state.icons.forEach((icon) =>
      outputs(icon).forEach((o) => {
        let f = o.file,
          k = 2;
        while (used.has(f)) f = o.file.replace(/\.svg$/, `_${k++}.svg`);
        used.add(f);
        zip.file(f, o.svg);
      }),
    );
    const blob = await zip.generateAsync({ type: "blob" });
    save("vscode-icons-folders.zip", blob);
  });
  $("clearAll").addEventListener("click", () => {
    state.icons = [];
    render();
  });

  // placement controls
  const syncPlace = () => {
    ["size", "cx", "cy"].forEach((k) => {
      $(k).value = state[k];
      $(k + "Out").textContent = state[k];
    });
    const r = $("miniBox");
    r.setAttribute("x", state.cx - state.size / 2);
    r.setAttribute("y", state.cy - state.size / 2);
    r.setAttribute("width", state.size);
    r.setAttribute("height", state.size);
    const c = $("specCircle");
    c.setAttribute("cx", state.cx);
    c.setAttribute("cy", state.cy);
    c.setAttribute("r", state.size / 2);
    $("specCross").setAttribute("d", `M${state.cx - 1} ${state.cy}h2m-1-1v2`);
  };
  let placeT;
  ["size", "cx", "cy"].forEach((k) =>
    $(k).addEventListener("input", (e) => {
      state[k] = +e.target.value;
      syncPlace();
      clearTimeout(placeT);
      placeT = setTimeout(render, 80);
    }),
  );
  $("resetPlace").addEventListener("click", () => {
    Object.assign(state, { size: 21, cx: 20.5, cy: 20.5, align: "br" });
    $("align").value = "br";
    syncPlace();
    render();
  });
  $("align").addEventListener("change", (e) => {
    state.align = e.target.value;
    render();
  });
  $("zoom").addEventListener("change", (e) => {
    state.zoom = e.target.checked;
    renderExplorer();
  });

  // drop zone
  const drop = $("drop"),
    file = $("file");
  drop.addEventListener("click", (e) => {
    if (e.target.closest("#pasteToggle,#sampleBtn")) e.preventDefault();
  });
  drop.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target === drop) {
      e.preventDefault();
      file.click();
    }
  });
  ["dragenter", "dragover"].forEach((t) =>
    drop.addEventListener(t, (e) => {
      e.preventDefault();
      drop.classList.add("over");
    }),
  );
  ["dragleave", "drop"].forEach((t) =>
    drop.addEventListener(t, (e) => {
      e.preventDefault();
      drop.classList.remove("over");
    }),
  );
  drop.addEventListener("drop", (e) => addFiles([...e.dataTransfer.files]));
  file.addEventListener("change", () => {
    addFiles([...file.files]);
    file.value = "";
  });
  $("pasteToggle").addEventListener("click", () => {
    $("paste").classList.toggle("open");
    if ($("paste").classList.contains("open")) $("pasteText").focus();
  });
  $("sampleBtn").addEventListener("click", async () => {
    try {
      await addIcon(SAMPLE, "vscode-icons.svg");
      render();
    } catch (e) {
      toast(e.message);
    }
  });
  $("pasteAdd").addEventListener("click", async () => {
    const text = $("pasteText").value.trim();
    $("pasteErr").textContent = "";
    if (!text) {
      $("pasteErr").textContent = "Paste some SVG code first.";
      return;
    }
    try {
      await addIcon(text, ($("pasteName").value.trim() || "pasted") + ".svg");
      $("pasteText").value = "";
      $("pasteName").value = "";
      render();
      toast("Folder made");
    } catch (e) {
      $("pasteErr").textContent =
        e.message +
        " Check that the code starts with <svg and ends with </svg>.";
    }
  });

  let toastT;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }

  syncPlace();
  render();

  // theme toggle (remembers your choice)
  const themeBtn = $("themeBtn");
  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    themeBtn.textContent = t === "dark" ? "Light theme" : "Dark theme";
  };
  let saved = null;
  try {
    saved = localStorage.getItem("fig-theme");
  } catch (e) {}
  applyTheme(
    saved ||
      (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"),
  );
  themeBtn.addEventListener("click", () => {
    const t =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(t);
    try {
      localStorage.setItem("fig-theme", t);
    } catch (e) {}
  });
})();
