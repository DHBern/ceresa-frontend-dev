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

On document pages, `mode=LF` defaults to continuous scrolling and `mode=DF` defaults to a paged layout. The scroll and page icon tabs switch layouts without changing the selected mode. The URL stores non-default layouts as `flow=fluid` or `flow=paged`; changing modes clears that override. Translation (`TRLF`) is always continuous.

The small and large T buttons immediately left of the flow toggle decrease and increase the edited text size in 10% steps, from 70% to 160% of its default size. They affect both the main text and translation in continuous and paged layouts, without resizing the toolbar or facsimiles. The size is kept while switching viewer modes but is not saved across reloads.

On narrow screens, text panels grow with their content in every mode and flow, keeping the footer below the full text. The translation appears below the main text; on desktop it retains its independently scrolling panel.

In LF, clicking a facsimile beside the continuous text opens the selected page in paged layout and scrolls to the gallery without hiding it under the sticky menu. In continuous DF, clicking a facsimile selects the page without switching layouts. Switching back to continuous layout scrolls to the current `page` when it is after the first running page.

The document viewer uses TEI `<pb>` order for the text, gallery, and large facsimile. Labels show the running page number followed by the printed `@n` in parentheses, for example `Pag. 1 (2)`, even when the numbers match. When `@n` is missing, the original number is shown as `?`. Images come from `@facs`. A missing image does not shift later pages or fall back to `documents.json`. The `page` URL parameter remains a one-based running index.

For a document with `tei.suffix_version`, the TEI division's `xml:id` must match its document key without the category prefix, e.g. `posthum_A-1-b_6-2_AC001_a` selects `A-1-b_6-2_AC001_a`. Selection happens before CETEIcean behaviors; missing or duplicate divisions are reported as errors. If a version starts mid-page, the preceding `<pb>` supplies its initial facsimile and page metadata without changing the source XML. The running page counter starts at one for each version.

Add related document keys to a `doc_sequences.variants` group to show version shortcuts in the document header. Members may come from different TEI files and document categories. Run `node --test tests/tei-version.test.js` to check version selection and pagination.

Edition genre galleries show labeled, inline multi-select filters. Values within a filter are combined with OR; different filters are combined with AND. `Tutti` clears that filter. In either list view, each column header opens its sorting menu and, where applicable, a multi-select filter with a clear action. Selections and sorting are retained when switching views; filters reset when changing genre.

Edition genre pages are centered within a 108rem maximum width. Gallery cards use at most three columns, with a 36rem minimum column width where space permits; image and text stack on small screens. From 1280px, filters duplicate the metadata accordion styling in a full-window container, with padded content aligned to the page and options aligned beneath their titles. Below 1280px, compact filter menus wrap. Gallery sorting is right-aligned, with direction controls inside its dropdown. List views expand beyond the padded page only as far as needed to fit their columns, capped at the window width.

In both list views, column headers stick to the top while the table is on screen and leave with its last row. Horizontal scrolling keeps headers aligned with the rows. Sorting and filter dropdowns share ascending/descending controls with arrows and a tick marking the active column's direction.

List metadata columns reserve room for their labels and status icons, with spare width given to the title. In dropdown and accordion filters, `Tutti` is plain, non-interactive text when no values are selected; an underlined `Cancella filtro` action replaces it when the filter is active. Both use the same checkbox icons, dark in light mode and light in dark mode.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
