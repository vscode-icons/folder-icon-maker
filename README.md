# vscode-icons folder maker

Make [vscode-icons](https://github.com/vscode-icons/vscode-icons) folders from your file icons: closed and opened, for dark and light themes.

Each icon becomes a badge in the standard folder-badge spot, and the folder color is derived from the icon's main color so the badge stays readable.

## Usage

No build step. Open `index.html` in a browser, or serve the folder with any static server:

```sh
npx serve .
```

Then:

1. Drop file icon SVGs on the drop zone, click **Choose files**, paste SVG code, or click **Try a sample**.
2. Rename the folder if needed (the `folder_type_` prefix is added for you).
3. Adjust colors, badge fit, and placement. The explorer preview shows how the folders look in dark and light sidebars.
4. Copy or download each file, or use **Download all (.zip)**.

## Output

Each input icon gives two files, closed and opened:

| Input                      | Output                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `file_type_name.svg`       | `folder_type_name.svg`, `folder_type_name_opened.svg`             |
| `file_type_light_name.svg` | `folder_type_light_name.svg`, `folder_type_light_name_opened.svg` |

The light theme version is a separate input icon. Files named `file_type_light_*` (or `folder_type_light_*`) are detected as light automatically, and each icon has a **Dark theme / Light theme** picker for anything else, such as pasted code. Light icons get a folder color tuned for light sidebars.

Previews always show both dark and light backgrounds. In the explorer preview, each theme uses its own version of a folder and falls back to the other one if it's missing.

## Options

- **Badge placement**: size, center x/y, and alignment (bottom right of the box, or centered). The default is a 21×21 box from 10 to 31 on the 32×32 canvas, matching the built-in vscode-icons badges.
- **Fit**: _Fit to artwork_ sizes the badge from the visible pixels; _Fit to viewBox_ uses the SVG's own viewBox.
- **Colors**: the folder and opened colors can be overridden; **Reset colors** restores the derived ones.

## Notes

- Uploaded SVGs are sanitized (scripts, event handlers, and `foreignObject` are removed) and their IDs are prefixed so gradients and clip paths don't clash.
- Everything runs locally in the browser. The only external resources are JSZip (from cdnjs) and the JetBrains Mono font.

## Files

- `index.html` – page layout
- `style.css` – styles, with dark and light themes
- `script.js` – parsing, color derivation, SVG building, and export
