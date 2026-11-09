# mim-it

> A community-driven continuation of [georapbox/meme-generator](https://github.com/georapbox/meme-generator).

**mim-it** began as a fork of George Raptis' [Meme Generator](https://github.com/georapbox/meme-generator). This project carries that original foundation forward as an independent, community-led continuation, with new features, improvements and contributions shaped in the open.

mim-it is a community project, not a personal one-off fork. The intention is to keep it open to the people who use it, build with it and want to improve it. Community participation and collaboration are part of the project's long-term direction.

This repository is an independent fork. It is not an official release of, or affiliated with, the upstream project or its maintainers. The original project and its author remain credited; the upstream license and notices are preserved.

## What we're building

mim-it is a browser-based meme editor. Images are processed locally in your browser and are not uploaded to an application server.

- Pick a template, upload an image, load an image URL, paste an image from the clipboard, or capture a photo.
- Add multiple text layers and adjust typography, colors, outlines, shadows, alignment and rotation.
- Drag text layers directly on the canvas, with an optional 10px snap grid.
- Upload WOFF, WOFF2, TTF and OTF fonts for the current browser session.
- Export as PNG, JPEG or WebP, copy a PNG directly to the clipboard, or share where supported.
- Keep the source image's original dimensions or choose a maximum canvas size.
- Installable Progressive Web App (PWA).

## Community

The project is intended to remain community-led and developed in public. You do not need to be a maintainer to help shape it.

- Open an issue to report a bug, suggest an improvement or start a discussion.
- Send a pull request for code, documentation, accessibility, translations or design improvements.
- Help test new changes across browsers and devices.
- Share ideas for templates, fonts, workflows and features that would benefit other users.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Be respectful, explain the problem a change solves and keep contributions focused. Project direction should be discussed openly with the community.

There is no promise that every suggestion will be implemented, but contributions and constructive feedback are welcome.

## Attribution

mim-it is based on [georapbox/meme-generator](https://github.com/georapbox/meme-generator), originally created by **George Raptis**. The original MIT license and copyright notice are retained in [LICENSE](./LICENSE). This fork also includes subsequent community changes made in this repository.

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

## Cloudflare Pages (manual upload)

mim-it uses **Cloudflare Pages Direct Upload**. There is no GitHub Actions deployment workflow and no automatic deployment on every push. You build the site locally and upload the generated assets through the Cloudflare dashboard.

1. Install dependencies and create the production build:

   ```sh
   npm ci
   npm run build
   ```

2. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Get started** → **Drag and drop your files**.
3. Enter `mim-it` as the project name, then upload the generated `dist/` folder (or a ZIP containing its contents).
4. Select **Deploy site**.

For later updates, open the `mim-it` project in Cloudflare Pages, choose **Create a new deployment**, select the production environment, upload the newly generated `dist/` output and select **Save and Deploy**.

**Important:** Direct Upload projects cannot later be converted into Git-integrated Pages projects. Choose this mode because deployments are intentionally manual. See the [Cloudflare Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/) for current dashboard steps and upload limits.

For a local preview of the production output:

```sh
npx wrangler pages dev dist
```

## Docker

Build and run the static site in an Nginx container:

```sh
docker build -t mim-it .
docker run --rm -p 8080:80 mim-it
```

Open http://localhost:8080.

## Browser notes

- Clipboard image writes require a secure context (HTTPS or localhost) and browser clipboard support.
- PNG, JPEG, GIF, WebP, AVIF, BMP, SVG and ICO are included in the picker. Actual decoding depends on the browser.
- JPEG does not preserve transparency. PNG is used when copying to the clipboard.
- Uploaded custom fonts are kept in memory for the current browser session.

## License

[MIT](./LICENSE). The upstream copyright and license notice are preserved.
