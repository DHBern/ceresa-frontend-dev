# CETEIcean Preview -- WebDAV sync

The contents in this directory are kept in sync with the `preview` directory on the WebDAV storage. See main [README](https://github.com/DHBern/ceresa-frontend/blob/main/README.md) for details.

DO NOT edit files in `preview` directly on WebDAV!

Deploy `oxy.html`, `behaviours.js`, `metamark.js`, and `styles.css` together when
updating metamark rendering. The preview imports `metamark.js` as a module and
resolves relocation pairs after CETEIcean has loaded the full TEI document.
In diplomatic view, matching **Spostamento 1**, **Spostamento 2**, etc. labels connect each
underlined passage to its destination. Reading view shows the relocated text
without the labels.

The shared stylesheet brackets additions inside deletions in diplomatic view
(for example, `cha⌜q⌝ue` with a strikethrough). Reading view hides the entire
deletion, including the addition.
