import assert from 'node:assert/strict';
import { test } from 'node:test';
import CETEI from 'CETEIcean';
import { JSDOM } from 'jsdom';
import { markAddition } from '../src/lib/CETEIcean/addition.js';

test('deleted addition brackets are selectable and preserve nested TEI', () => {
	const { window } = new JSDOM();
	const { document } = window;
	const xml = new JSDOM(
		`<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body><p>
			<del>cha<add place="inline"><hi>q</hi></add>ue</del>
			<add place="below">note</add>
		</p></body></text></TEI>`,
		{ contentType: 'text/xml' }
	);
	const cetei = new CETEI({ documentObject: document });
	cetei.addBehaviors({ tei: { add: markAddition } });
	document.body.append(cetei.domToHTML5(xml.window.document));

	const deletion = document.querySelector('tei-del');
	assert.ok(deletion);
	const addition = deletion.querySelector('tei-add');
	assert.ok(addition);
	assert.equal(addition.querySelector('tei-hi')?.textContent, 'q');
	assert.equal(document.querySelector('tei-add[place="below"]')?.textContent, '⌞note⌟');

	// Reprocessing must not add another pair of brackets.
	markAddition(addition);
	const selection = window.getSelection();
	assert.ok(selection);
	const range = document.createRange();
	range.selectNodeContents(deletion);
	selection.addRange(range);
	assert.equal(selection.toString(), 'cha⌜q⌝ue');
});
