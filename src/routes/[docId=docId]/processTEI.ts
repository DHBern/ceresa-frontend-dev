import {
	behaviors,
	collectPageMetadata,
	getTextPageBreaks,
	wrapAnnotations,
	type TEIPage
} from '$lib/CETEIcean/behaviors';
import { processMetamarks } from '$lib/CETEIcean/metamark.js';
import { selectTEIVersion, TEIVersionError } from '$lib/CETEIcean/selectVersion';
import CETEI from 'CETEIcean';
import { JSDOM } from 'jsdom';

export interface ProcessedTEI {
	//   dom: Document;
	//   ceteicean: typeof CETEI;
	serialized: string;
	elements: string[];
	pages: TEIPage[];
}

const processTEI = (xml: string, versionId?: string): ProcessedTEI => {
	const xmlDom = new JSDOM(xml, { contentType: 'text/xml' });
	const xmlDoc = xmlDom.window.document;
	const version = versionId ? selectTEIVersion(xmlDoc, versionId) : null;

	const htmlDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
	const htmlDoc = htmlDom.window.document;

	const ceteicean = new CETEI({
		documentObject: htmlDoc
	});

	//apply behaviors here, if needed, before serializing
	ceteicean.addBehaviors(behaviors(htmlDoc));
	const domFragment = ceteicean.domToHTML5(xmlDoc);
	const container = htmlDoc.createElement('div');
	container.appendChild(domFragment);
	if (version) {
		const pageBreaks = getTextPageBreaks(container);
		if (pageBreaks.length !== version.pageBreakCount) {
			throw new TEIVersionError(
				`Page breaks could not be matched for TEI version "${version.id}".`
			);
		}
		if (version.initialPage) {
			const division = Array.from(container.querySelectorAll('tei-div')).find(
				(el) => el.getAttribute('id') === version.id
			);
			if (!division) throw new TEIVersionError(`Rendered TEI division "${version.id}" not found.`);
			const marker = htmlDoc.createElement('tei-pb');
			marker.dataset.versionPageStart = '';
			const { n, facs } = version.initialPage;
			if (n !== null) marker.setAttribute('n', n);
			if (facs !== null) marker.setAttribute('facs', facs);
			division.prepend(marker);
		}
	}
	wrapAnnotations(container);
	processMetamarks(container);
	const serialized = container.innerHTML;

	return {
		serialized,
		elements: Array.from(ceteicean.els) as string[],
		pages: collectPageMetadata(container)
	};
};

export { processTEI as default, processTEI };
