# mim-it

A browser-based meme maker for creating and exporting image memes. It runs entirely client-side: images and uploaded fonts stay in the browser and are not sent to an application server.

## Features

- Pick a template, upload an image, load an image URL, paste an image from the clipboard, or capture a photo.
- Add multiple text layers and adjust typography, colors, outlines, shadows, alignment and rotation.
- Drag text layers directly on the canvas, with an optional 10px snap grid.
- Upload WOFF, WOFF2, TTF and OTF fonts for the current browser session.
- Export as PNG, JPEG or WebP, copy a PNG directly to the clipboard, or share where supported.
- Keep the source image's original dimensions or choose a maximum canvas size.
- Installable Progressive Web App (PWA).

## Development

Requires Node.js 24 and npm 11.17 or newer.

```sh
npm ci
npm start
```

Create a production build:

```sh
npm run build
```

The static site is generated in `dist/`.

## Cloudflare Pages

This repository includes a Wrangler Pages configuration and a GitHub Actions deployment workflow.

1. In Cloudflare, create a **Pages project using Direct Upload** named `mim-it`. The workflow deploys the generated `dist/` directory with Wrangler. Do not choose Git integration for this project if you intend to use this workflow: Cloudflare does not allow converting a Direct Upload project into a Git-integrated project or vice versa.
2. Create an Account API Token with **Cloudflare Pages: Edit** permission.
3. In GitHub, open **Settings → Secrets and variables → Actions** and add:
   - `CLOUDFLARE_API_TOKEN`: your Cloudflare API token.
   - `CLOUDFLARE_ACCOUNT_ID`: the account ID from the Cloudflare dashboard.
4. Push to `main`, or run **Deploy to Cloudflare Pages** manually from the Actions tab.

The workflow builds with Node.js 24 and deploys to the `mim-it` Pages project.

For a local preview:

```sh
npx wrangler pages dev dist
```

For a manual deployment:

```sh
npx wrangler pages deploy dist --project-name=mim-it --branch=main
```

## Docker

```sh
docker build -t mim-it .
docker run --rm -p 8080:80 mim-it
```

Open http://localhost:8080.

## Browser notes

- Clipboard image writes require a secure context (HTTPS or localhost) and browser clipboard support.
- PNG, JPEG, GIF, WebP, AVIF, BMP, SVG and ICO are included in the picker. Actual decoding depends on the browser.
- JPEG does not preserve transparency. PNG is used when copying to the clipboard.

## License

[MIT](./LICENSE). This project retains the upstream project's existing licensing and attribution.
