import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
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
const teiNs = 'http://www.tei-c.org/ns/1.0';
const xmlNs = 'http://www.w3.org/XML/1998/namespace';

/** @param {string} dir @returns {Promise<string[]>} */
async function xmlFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	return (
		await Promise.all(
			entries.map((entry) => {
				const path = `${dir}/${entry.name}`;
				return entry.isDirectory() ? xmlFiles(path) : entry.name.endsWith('.xml') ? [path] : [];
			})
		)
	).flat();
}

test('source hand declarations agree with document metadata', async () => {
	const data = JSON.parse(await readFile(`${root}/src/lib/data/documents.json`, 'utf8'));
	const documents = Object.values(data.documents).flatMap(Object.values);
	const files = (
		await Promise.all([
			xmlFiles(`${root}/static/data/sources/tei`),
			xmlFiles(`${root}/tests/fixtures/sources/tei`)
		])
	).flat();
	assert.ok(files.length > 0);

	for (const file of files) {
		const xml = new JSDOM(await readFile(file, 'utf8'), { contentType: 'text/xml' }).window
			.document;
		const id = xml.documentElement.getAttributeNS(xmlNs, 'id');
		const matches = documents.filter((doc) => doc.tei?.filename === id);
		assert.equal(matches.length, 1, file);
		const notes = [...xml.getElementsByTagNameNS(teiNs, 'handNote')];
		assert.deepEqual(
			notes.map((note) => [note.getAttributeNS(xmlNs, 'id'), note.getAttribute('medium')]),
			[
				['hw', 'handwritten'],
				['tw', 'typewritten']
			],
			file
		);
		assert.ok(
			notes.every(
				(note) =>
					note.parentElement?.localName === 'handDesc' &&
					note.parentElement.parentElement?.localName === 'physDesc'
			),
			file
		);
		const type = matches[0].metadata.type_document;
		const expected = type === 'manoscritto' ? ['hw'] : type === 'dattiloscritto' ? ['tw'] : [];
		assert.deepEqual(
			notes
				.filter((note) => note.getAttribute('scope') === 'major')
				.map((note) => note.getAttributeNS(xmlNs, 'id')),
			expected,
			file
		);
	}
});

for (const hand of ['hw', 'tw']) {
	test(`preserves the ${hand} base hand and explicit corrections in fluid and paged output`, (t) => {
		const source = `<TEI xmlns="${teiNs}">
			<teiHeader><fileDesc><sourceDesc><msDesc><physDesc><handDesc>
				<handNote xml:id="${hand}" scope="major"/>
			</handDesc></physDesc></msDesc></sourceDesc></fileDesc></teiHeader>
			<text><body><div><pb n="1"/><p>
				<add>implicit</add><del hand="#hw">explicit</del>
				<pb n="2"/><add hand="#tw">next</add><del>implicit</del>
			</p></div></body></text>
		</TEI>`;
		const result = processTEI(source);
		const { window } = new JSDOM();
		const previousParser = Object.getOwnPropertyDescriptor(globalThis, 'DOMParser');
		Object.defineProperty(globalThis, 'DOMParser', { configurable: true, value: window.DOMParser });
		t.after(() => {
			if (previousParser) Object.defineProperty(globalThis, 'DOMParser', previousParser);
			else Reflect.deleteProperty(globalThis, 'DOMParser');
		});
		const parser = new window.DOMParser();
		for (const html of [
			result.serialized,
			extractPage(result.serialized, 1),
			extractPage(result.serialized, 2)
		]) {
			const doc = parser.parseFromString(html, 'text/html');
			assert.equal(doc.querySelector('tei-text')?.getAttribute('data-default-hand'), `#${hand}`);
			assert.ok(doc.querySelector('tei-add, tei-del'));
		}
		const doc = parser.parseFromString(result.serialized, 'text/html');
		assert.equal(doc.querySelector('tei-add')?.hasAttribute('hand'), false);
		assert.equal(doc.querySelector('tei-del[hand="#hw"]')?.textContent, 'explicit');
		assert.equal(doc.querySelector('tei-add[hand="#tw"]')?.textContent, 'next');
	});
}

test('leaves the default unset when it is unknown and rejects conflicting defaults', () => {
	/** @param {string} notes */
	const source = (notes) => `<TEI xmlns="${teiNs}"><teiHeader><fileDesc><sourceDesc>
		<msDesc><physDesc><handDesc>${notes}</handDesc></physDesc></msDesc>
		</sourceDesc></fileDesc></teiHeader><text><body><p><add>text</add></p></body></text></TEI>`;
	const unknown = processTEI(source('<handNote xml:id="hw"/><handNote xml:id="tw"/>'));
	assert.doesNotMatch(unknown.serialized, /data-default-hand/);
	assert.throws(
		() =>
			processTEI(
				source('<handNote xml:id="hw" scope="major"/><handNote xml:id="tw" scope="major"/>')
			),
		/Multiple default TEI hands/
	);
});

test('standalone preview applies the declared base hand', async () => {
	const preview = await readFile(`${root}/src/lib/CETEIcean/oxy.html`, 'utf8');
	const { window } = new JSDOM(preview, { runScripts: 'outside-only' });
	const script = [...window.document.querySelectorAll('script')].find((el) => !el.src);
	assert.ok(script);
	window.eval(script.textContent ?? '');
	const xml = new window.DOMParser().parseFromString(
		`<TEI xmlns="${teiNs}"><teiHeader><handDesc><handNote xml:id="hw" scope="major"/></handDesc></teiHeader></TEI>`,
		'text/xml'
	);
	const container = window.document.createElement('div');
	container.innerHTML = '<tei-text><tei-add>text</tei-add></tei-text>';
	Reflect.get(window, 'applyDefaultHand')(xml, container);
	assert.equal(container.querySelector('tei-text')?.getAttribute('data-default-hand'), '#hw');
	window.close();
});
