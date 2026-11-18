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

test('a page with no facsimile keeps its place in the paged transcription', (t) => {
	const { window } = new JSDOM();
	const previousParser = Object.getOwnPropertyDescriptor(globalThis, 'DOMParser');
	Object.defineProperty(globalThis, 'DOMParser', { configurable: true, value: window.DOMParser });
	t.after(() => {
		if (previousParser) Object.defineProperty(globalThis, 'DOMParser', previousParser);
		else Reflect.deleteProperty(globalThis, 'DOMParser');
	});
	const html = `
		<tei-teiheader><tei-pb n="header"></tei-pb></tei-teiheader>
		<tei-text>
			<tei-pb n="1" facs="https://example.test/first"></tei-pb><tei-p>First page</tei-p>
			<tei-pb n="2" facs=" "></tei-pb><tei-p>Page without image</tei-p>
			<tei-pb n="177" facs="https://example.test/third"></tei-pb><tei-p>Third page</tei-p>
		</tei-text>`;

	const pages = collectPageMetadata(new window.DOMParser().parseFromString(html, 'text/html'));
	assert.equal(pages[1].facs, null);
	assert.match(extractPage(html, pages[1].page), /Page without image/);
	assert.equal(pages[2].n, '177');
	assert.match(extractPage(html, pages[2].page), /Third page/);
});
