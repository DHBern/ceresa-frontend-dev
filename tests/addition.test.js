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

test('a leading line break precedes the opening margin bracket', () => {
	const { document } = new JSDOM().window;
	const xml = new JSDOM(
		`<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body><p>Before
			<add place="margin">
				<?oxy_comment_start author="luisepappe" comment="encode as a note?"?>
				<lb xml:id="first"/>(Scritta al tempo in cui <rs>Moravia</rs>
				<lb xml:id="second"/>un editore.)<?oxy_comment_end?>
			</add>
			<add place="margin">Text<lb xml:id="later"/>more</add>
			<add place="above"><lb xml:id="above"/>note</add>
		</p></body></text></TEI>`,
		{ contentType: 'text/xml' }
	);
	const cetei = new CETEI({ documentObject: document });
	cetei.addBehaviors({ tei: { add: markAddition } });
	document.body.append(cetei.domToHTML5(xml.window.document));

	const [margin, inline, above] = document.querySelectorAll('tei-add');
	const first = margin.querySelector('#first');
	const second = margin.querySelector('#second');
	assert.ok(first && second);
	assert.equal(first.nextElementSibling?.textContent, '‹');
	assert.equal(first.nextElementSibling?.nextSibling?.textContent, '(Scritta al tempo in cui ');
	assert.equal(second.nextSibling?.textContent, 'un editore.)');
	assert.equal(margin.lastElementChild?.textContent, '›');
	assert.equal(inline.firstElementChild?.textContent, '‹');
	assert.equal(inline.querySelector('#later')?.nextSibling?.textContent, 'more');
	assert.equal(above.firstElementChild?.textContent, '⌜');

	markAddition(margin);
	assert.equal(margin.querySelectorAll('.addition_wrapper').length, 2);
});
