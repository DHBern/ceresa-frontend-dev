import assert from 'node:assert/strict';
import { test } from 'node:test';
import CETEI from 'CETEIcean';
import { JSDOM } from 'jsdom';
import { processMetamarks } from '../src/lib/CETEIcean/metamark.js';

test('relocates TEI content across pages even when the destination comes first', () => {
	const xml = new JSDOM(
		`<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body><p>
			<pb xml:id="p1"/><metamark xml:id="mm1">Move here</metamark>
			<pb xml:id="p2"/><metamark target="#mm1"><hi>Moved</hi> text</metamark>
		</p></body></text></TEI>`,
		{ contentType: 'text/xml' }
	);
	const { document } = new JSDOM().window;
	const cetei = new CETEI({ documentObject: document });
	document.body.append(cetei.domToHTML5(xml.window.document));

	processMetamarks(document.body);
	processMetamarks(document.body);

	const original = document.querySelector('.metamark-relocated-text-at-original-position');
	const relocated = document.querySelector('.metamark-relocated-text-at-new-location');
	const marker = document.querySelector('.metamark-marker-at-new-location');
	assert.equal(original?.parentElement?.getAttribute('target'), '#mm1');
	assert.equal(relocated?.parentElement?.id, 'mm1');
	assert.equal(relocated?.innerHTML, original?.innerHTML);
	assert.equal(relocated?.querySelector('tei-hi')?.textContent, 'Moved');
	assert.equal(original?.getAttribute('title'), 'Move here');
	assert.equal(marker?.getAttribute('title'), 'Move here');
	assert.equal(marker?.getAttribute('data-metamark-id'), 'mm1');
	assert.equal(document.querySelectorAll('.metamark-relocated-text-at-new-location').length, 1);
	assert.equal(document.querySelectorAll('[id="mm1"]').length, 1);
});

test('leaves unpaired metamarks and their text intact', () => {
	const { document } = new JSDOM(
		`<main><tei-metamark target="#missing">Keep this text</tei-metamark>
		<tei-metamark id="standalone">Keep this too</tei-metamark></main>
		<aside><tei-metamark id="missing"></tei-metamark></aside>`
	).window;
	const root = document.querySelector('main');
	assert.ok(root);
	const originalMarkup = root.innerHTML;

	processMetamarks(root);

	assert.equal(root.innerHTML, originalMarkup);
});

test('gives nearby relocation pairs matching, distinct labels in origin order', () => {
	const { document } = new JSDOM(
		`<tei-metamark id="second-target"></tei-metamark>
		<tei-metamark target="#first-target">First passage</tei-metamark>
		<tei-metamark target="#second-target">Second passage</tei-metamark>
		<tei-metamark id="first-target"></tei-metamark>`
	).window;

	processMetamarks(document.body);
	processMetamarks(document.body);

	for (const [id, label] of [
		['first-target', 'Spostamento 1'],
		['second-target', 'Spostamento 2']
	]) {
		const originMark = document.querySelector(`tei-metamark[target="#${id}"]`);
		const destination = document.querySelector(`#${id}`);
		const origin = originMark?.querySelector('.metamark-relocated-text-at-original-position');
		const marker = destination?.querySelector('.metamark-marker-at-new-location');
		assert.equal(originMark?.getAttribute('data-metamark-label'), label);
		assert.equal(destination?.getAttribute('data-metamark-label'), label);
		assert.equal(origin?.getAttribute('data-metamark-label'), label);
		assert.equal(marker?.getAttribute('data-metamark-label'), label);
	}
});
