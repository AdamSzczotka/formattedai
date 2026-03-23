# FormattedAI

A collection of free, privacy-focused web tools for developers and content creators. Every tool runs entirely in your browser — no server uploads, no accounts, no tracking. Your files never leave your device.

**Live:** [formattedai.pl](https://formattedai.pl/)

![FormattedAI - Home](assets/screenshots/screen_web.png)

## Tools

### [Markdown Formatter](formatter/README.md)

Convert markdown text from ChatGPT and other AI assistants into perfectly formatted rich text for Google Docs and Microsoft Word. One-click copy with preserved formatting.

![Markdown Formatter](assets/screenshots/screen_web_formatted.png)

### [AVIF Converter](avif/README.md)

Convert PNG, JPG and WebP images to modern AVIF format. Batch conversion, quality presets, ZIP download — all client-side via WebAssembly.

![AVIF Converter](assets/screenshots/screen_desktop_avif_1.png)

## Tech stack

- Vanilla HTML, CSS (SCSS), JavaScript
- No frameworks, no server, no dependencies at runtime
- [SASS](https://sass-lang.com/) for CSS preprocessing
- [esbuild](https://esbuild.github.io/) for JS minification
- [Marked](https://github.com/markedjs/marked) + [DOMPurify](https://github.com/cure53/DOMPurify) (Formatter)
- [@jsquash/avif](https://github.com/jamsinclair/jSquash) + [JSZip](https://stuk.github.io/jszip/) (AVIF Converter)

## Project structure

```
formattedai/
├── index.html              # Home page with tool cards
├── formatter/
│   ├── index.html          # Markdown Formatter tool
│   └── README.md
├── avif/
│   ├── index.html          # AVIF Converter tool
│   └── README.md
├── assets/
│   ├── css/                # Compiled CSS
│   ├── scss/               # SCSS source files
│   │   ├── _variables.scss # Shared variables & mixins
│   │   ├── _base.scss      # Theme system, resets, shared components
│   │   ├── home.scss       # Home page styles
│   │   ├── formatter.scss  # Formatter styles
│   │   └── avif.scss       # AVIF Converter styles
│   ├── js/                 # JavaScript source & minified
│   ├── vendor/             # Local copies of dependencies (JSZip)
│   ├── screenshots/        # README screenshots
│   └── favicon.svg
├── nginx.conf              # Production server config
├── package.json
├── LICENSE
└── README.md
```

## Running locally

```bash
# Install dev dependencies
npm install

# Build CSS and JS
npm run build

# Or watch for changes during development
npm run dev
```

Then open `index.html` with a local server (e.g. VS Code Live Server).

## License

MIT — see [LICENSE](LICENSE) for details.

## Author

[Adam Szczotka](https://github.com/AdamSzczotka)
