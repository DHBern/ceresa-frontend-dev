import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { collectPageMetadata } from '../src/lib/CETEIcean/behaviors.ts';

test('page metadata preserves TEI labels independently from running page indices', () => {
	const { document } = new JSDOM(`
		<tei-text>
			<tei-pb n="iv" facs="https://example.test/first/info.json"></tei-pb>
			<tei-pb n="12r" facs="https://example.test/second"></tei-pb>
			<tei-pb n="12r"></tei-pb>
			<tei-pb></tei-pb>
		</tei-text>
	`).window;

	assert.deepEqual(collectPageMetadata(document), [
		{ page: 1, n: 'iv', facs: 'https://example.test/first' },
		{ page: 2, n: '12r', facs: 'https://example.test/second' },
		{ page: 3, n: '12r', facs: null },
		{ page: 4, n: null, facs: null }
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
