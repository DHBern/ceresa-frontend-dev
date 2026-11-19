import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { collectPageMetadata, extractPage } from '../src/lib/CETEIcean/behaviors.ts';

test('page metadata preserves TEI labels independently from running page indices', () => {
	const { document } = new JSDOM(`
		<tei-text>
			<tei-pb n="iv" facs="https://example.test/first/info.json"></tei-pb>
			<tei-pb n="12r" facs="https://example.test/second"></tei-pb>
			<tei-pb n="12r"></tei-pb>
			<tei-pb></tei-pb>
			<tei-pb n=" "></tei-pb>
		</tei-text>
	`).window;

	assert.deepEqual(collectPageMetadata(document), [
		{ page: 1, n: 'iv', facs: 'https://example.test/first' },
		{ page: 2, n: '12r', facs: 'https://example.test/second' },
		{ page: 3, n: '12r', facs: null },
		{ page: 4, n: null, facs: null },
		{ page: 5, n: null, facs: null }
	]);
});

test('page metadata excludes non-text and CETEI original page breaks', () => {
	const { document } = new JSDOM(`
		<tei-teiheader><tei-pb n="header"></tei-pb></tei-teiheader>
		<tei-text>
			<cetei-original><tei-pb n="original"></tei-pb></cetei-original>
			<tei-pb n="3"></tei-pb>
		</tei-text>
	`).window;

	assert.deepEqual(collectPageMetadata(document), [{ page: 1, n: '3', facs: null }]);
});

/** @param {import('node:test').TestContext} t */
function useDOMParser(t) {
	const { window } = new JSDOM();
	const previousParser = Object.getOwnPropertyDescriptor(globalThis, 'DOMParser');
	Object.defineProperty(globalThis, 'DOMParser', { configurable: true, value: window.DOMParser });
	t.after(() => {
		if (previousParser) Object.defineProperty(globalThis, 'DOMParser', previousParser);
		else Reflect.deleteProperty(globalThis, 'DOMParser');
	});
	return new window.DOMParser();
}

test('a page with no facsimile keeps its place in the paged transcription', (t) => {
	const parser = useDOMParser(t);
	const html = `
		<tei-teiheader><tei-pb n="header"></tei-pb></tei-teiheader>
		<tei-text>
			<tei-pb n="1" facs="https://example.test/first"></tei-pb><tei-p>First page</tei-p>
			<tei-pb n="2" facs=" "></tei-pb><tei-p>Page without image</tei-p>
			<tei-pb n="177" facs="https://example.test/third"></tei-pb><tei-p>Third page</tei-p>
		</tei-text>`;

	const pages = collectPageMetadata(parser.parseFromString(html, 'text/html'));
	assert.equal(pages[1].facs, null);
	assert.match(extractPage(html, pages[1].page), /Page without image/);
	assert.equal(pages[2].n, '177');
	assert.match(extractPage(html, pages[2].page), /Third page/);
});

test('paged transcription keeps paragraphs as siblings across mid-paragraph page breaks', (t) => {
	const parser = useDOMParser(t);
	const html = `
		<tei-text><tei-body><tei-div rendition="#test">
			<tei-p>Before <tei-pb n="1"></tei-pb>Continuation</tei-p>
			<tei-p>Separate paragraph</tei-p>
			<tei-p>End of page <tei-pb n="2"></tei-pb>Next page</tei-p>
		</tei-div></tei-body></tei-text>`;

	const first = parser.parseFromString(extractPage(html, 1), 'text/html');
	const second = parser.parseFromString(extractPage(html, 2), 'text/html');
	assert.deepEqual(
		[...first.querySelectorAll('tei-text > tei-body > tei-div[rendition="#test"] > tei-p')].map(
			(p) => p.textContent.trim()
		),
		['Continuation', 'Separate paragraph', 'End of page']
	);
	assert.equal(first.querySelector('tei-p tei-p, tei-pb'), null);
	assert.equal(second.querySelector('tei-div > tei-p')?.textContent, 'Next page');
});

test('a page entirely within one paragraph retains the paragraph wrapper', (t) => {
	const parser = useDOMParser(t);
	const html = `<tei-text><tei-p rendition="#test">Before<tei-pb></tei-pb>Between<tei-pb></tei-pb>After</tei-p></tei-text>`;
	const page = parser.parseFromString(extractPage(html, 1), 'text/html');

	assert.equal(page.querySelector('tei-text > tei-p[rendition="#test"]')?.textContent, 'Between');
});
