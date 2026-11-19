# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv create --template minimal --types ts --add prettier eslint tailwindcss="plugins:none" --install pnpm dse-as-frontend
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

On document pages, `mode=LF` defaults to continuous scrolling and `mode=DF` defaults to a paged layout. The button next to the gallery toggles the layout without changing the selected tab. The URL stores non-default layouts as `flow=fluid` or `flow=paged`; changing tabs clears that override. Translation (`TRLF`) is always continuous.

In LF, clicking a facsimile beside the continuous text opens the selected page in paged layout and scrolls to the gallery without hiding it under the sticky menu. In continuous DF, clicking a facsimile selects the page without switching layouts. Switching back to continuous layout scrolls to the current `page` when it is after the first running page.

The document viewer uses TEI `<pb>` order for the text, gallery, and large facsimile. Thumbnail labels come from `@n` and images from `@facs`, both cached during TEI processing. Thumbnails without `@n` have no visible label. A missing image does not shift later pages or fall back to `documents.json`. The `page` URL parameter remains a one-based running index.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
