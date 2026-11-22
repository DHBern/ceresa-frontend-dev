import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test, after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const vite = await createServer({
	configFile: false,
	root,
	appType: 'custom',
	server: { middlewareMode: true, hmr: false },
	optimizeDeps: { noDiscovery: true, include: [] },
	resolve: { alias: { $lib: fileURLToPath(new URL('../src/lib', import.meta.url)) } }
});
after(() => vite.close());

const { processTEI } = await vite.ssrLoadModule('/src/routes/[docId=docId]/processTEI.ts');
const { extractPage } = await vite.ssrLoadModule('/src/lib/CETEIcean/behaviors.ts');
const { TEIVersionError } = await vite.ssrLoadModule('/src/lib/CETEIcean/selectVersion.ts');
const { formatPageLabel } = await vite.ssrLoadModule(
	'/src/lib/functions/ease_of_use/formatPageLabel.ts'
);

const xml = `<TEI xmlns="http://www.tei-c.org/ns/1.0">
	<teiHeader><fileDesc><titleStmt><title>Header</title></titleStmt></fileDesc></teiHeader>
	<text><body><div>
		<pb xml:id="p1" n="10" facs="https://example.test/1/info.json"/>
		<div xml:id="work_a"><p>First version<note>First note</note></p></div>
		<div xml:id="work_b"><p>Second version<note>Second note</note>
			<pb xml:id="p2" n="11" facs="https://example.test/2"/>Next page</p></div>
		<div xml:id="work_c"><pb xml:id="p3" facs="https://example.test/3"/><p>Third version</p></div>
	</div></body></text>
</TEI>`;

test('isolates text and notes and inherits a shared initial page', () => {
	const result = processTEI(xml, 'work_b');
	assert.match(result.serialized, /Second version/);
	assert.match(result.serialized, /Second note/);
	assert.doesNotMatch(result.serialized, /First version|First note|Third version/);
	assert.deepEqual(result.pages, [
		{ page: 1, n: '10', facs: 'https://example.test/1' },
		{ page: 2, n: '11', facs: 'https://example.test/2' }
	]);
	assert.equal(formatPageLabel(result.pages[0].n, result.pages[0].page, false), '1 (10)');
	assert.equal(formatPageLabel(result.pages[1].n, result.pages[1].page, false), '2 (11)');
	assert.match(result.serialized, /data-version-page-start/);
	globalThis.DOMParser = new JSDOM('').window.DOMParser;
	const first = extractPage(result.serialized, 1);
	const second = extractPage(result.serialized, 2);
	assert.match(first, /Second version/);
	assert.doesNotMatch(first, /Next page/);
	assert.match(second, /Next page/);
	assert.doesNotMatch(second, /Second version/);
	delete globalThis.DOMParser;
});

test('does not inherit a preceding page when the version starts at a page break', () => {
	const result = processTEI(xml, 'work_c');
	assert.deepEqual(result.pages, [{ page: 1, n: null, facs: 'https://example.test/3' }]);
	assert.equal(formatPageLabel(result.pages[0].n, result.pages[0].page), 'Pag. 1 (?)');
	assert.doesNotMatch(result.serialized, /data-version-page-start/);
});

test('preserves initial text without inventing facsimile metadata when no page break precedes it', () => {
	const source =
		'<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body><div xml:id="work_a"><p>Beginning</p><pb facs="later"/><p>Later</p></div></body></text></TEI>';
	const result = processTEI(source, 'work_a');
	assert.deepEqual(result.pages, [
		{ page: 1, n: null, facs: null },
		{ page: 2, n: null, facs: 'later' }
	]);
	globalThis.DOMParser = new JSDOM('').window.DOMParser;
	assert.match(extractPage(result.serialized, 1), /Beginning/);
	delete globalThis.DOMParser;
});

test('reports an unknown version rather than rendering the full document', () => {
	assert.throws(() => processTEI(xml, 'work_missing'), TEIVersionError);
});

test('keeps unsplit documents intact', () => {
	const result = processTEI(xml);
	assert.match(result.serialized, /First version/);
	assert.match(result.serialized, /Second version/);
	assert.equal(result.pages.length, 3);
});

test('shows the original number even when it matches the sequential number', () => {
	assert.equal(formatPageLabel('1', 1), 'Pag. 1 (1)');
	assert.equal(formatPageLabel('3', 1), 'Pag. 1 (3)');
});

test('selects the two Anima versions and their facsimiles from the real TEI', async () => {
	const source = await readFile(
		new URL(
			'../static/data/sources/tei/A-1/A-1-b/A-1-b_6/A-1-b_6-2/A-1-b_6-2_AC001/A-1-b_6-2_AC001.xml',
			import.meta.url
		),
		'utf8'
	);
	const a = processTEI(source, 'A-1-b_6-2_AC001_a');
	const b = processTEI(source, 'A-1-b_6-2_AC001_b');
	assert.equal(formatPageLabel(b.pages[0].n, b.pages[0].page), 'Pag. 1 (2)');
	assert.deepEqual(
		a.pages.map((page) => page.facs?.split('/').at(-1)),
		['A-1-b_6-2_002.tif']
	);
	assert.deepEqual(
		b.pages.map((page) => page.facs?.split('/').at(-1)),
		['A-1-b_6-2_003.tif']
	);
	assert.match(a.serialized, /p002_r_tl_1/);
	assert.doesNotMatch(a.serialized, /p003_tr_3_tl_1/);
	assert.match(b.serialized, /p003_tr_3_tl_1/);
	assert.doesNotMatch(b.serialized, /p002_r_tl_1/);
});
