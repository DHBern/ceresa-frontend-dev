import assert from 'node:assert/strict';
import { test } from 'node:test';
import CETEI from 'CETEIcean';
import { JSDOM } from 'jsdom';
import { behaviors, wrapAnnotations } from '../src/lib/CETEIcean/behaviors.ts';

test('an annotation mark uses the same ID as its footnote and drawer entry', () => {
	const { document } = new JSDOM().window;
	const xml = new JSDOM(
		`<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body><p>
			<note>Standalone note</note>
			<anchor xml:id="passage"/>Annotated text<note type="annotation" targetEnd="passage">Comment</note>
		</p></body></text></TEI>`,
		{ contentType: 'text/xml' }
	);
	const cetei = new CETEI({ documentObject: document });
	cetei.addBehaviors(behaviors(document));
	const container = document.createElement('div');
	container.append(cetei.domToHTML5(xml.window.document));
	wrapAnnotations(container);

	const mark = container.querySelector('.note-mark');
	const footnote = container.querySelector('.footnote[data-note-type="annotation"]');
	assert.equal(mark?.textContent, 'Annotated text');
	assert.ok(footnote);
	const noteId = footnote.getAttribute('data-noteid');
	assert.equal(mark?.getAttribute('data-noteid'), noteId);
	assert.match(
		container.querySelector(`ol.notes li[data-noteid="${noteId}"]`)?.textContent ?? '',
		/Comment/
	);
});
