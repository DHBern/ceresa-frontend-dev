import type { EntryGenerator } from './$types';
import processTEI from './processTEI';
import type { ProcessedTEI } from './processTEI';
import type { PageServerLoad } from './$types';
import { asset } from '$app/paths';
import { documents as allDocs } from '$lib/data/documents.json';
import { resolveDoc } from '$lib/functions/ease_of_use/resolveDoc';
import type {
	TResolvedPosthum,
	TResolvedUnpublished,
	TResolvedPublished
} from '$lib/functions/ease_of_use/resolveDoc';
import type {
	TCrossRefDocumentsExtended,
	TCrossRefEntitiesExtended,
	TDocKeys,
	TDocTypes
} from '$lib/types/documents/TDocuments';
import documents_path_map_xml from '$lib/data/documents_path_map_xml.json';
import { register as reg } from '$lib/data/register.json';
import type { TRegKeysFlat, TRegTypes } from '$lib/types/register/TRegister';
import { resolveReg } from '$lib/functions/ease_of_use/resolveReg';
import { posthum_keys } from '$lib/data/posthum_keys.json';
import { unpublished_keys } from '$lib/data/unpublished_keys.json';
import { published_keys } from '$lib/data/published_keys.json';

export const entries: EntryGenerator = () => {
	const toEntry = (key: string) => ({ docId: encodeURIComponent(key) });
	const posthumKeyObjects = posthum_keys.map(toEntry);
	const unpublishedKeyObjects = unpublished_keys.map(toEntry);
	const publishedKeyObjects = published_keys.map(toEntry);
	return [...posthumKeyObjects, ...unpublishedKeyObjects, ...publishedKeyObjects];
};

const docIdByParam = new Map(
	[...posthum_keys, ...unpublished_keys, ...published_keys].flatMap((key) => [
		[key, key],
		[encodeURIComponent(key), key],
		[encodeURI(encodeURIComponent(key)), key]
	])
);

export const load: PageServerLoad = async ({ params, fetch }) => {
	// Resolve current document
	const docId = docIdByParam.get(params.docId) ?? params.docId;
	const resolvedDoc = resolveDoc(allDocs, docId as TDocKeys) as
		TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;

	// Resolve cross-register references
	const crossRef: {
		linked_entities?: TCrossRefEntitiesExtended;
		cited_entities?: TCrossRefEntitiesExtended;
		linked_documents?: TCrossRefDocumentsExtended;
		cited_documents?: TCrossRefDocumentsExtended;
		'dict-1'?: TCrossRefDocumentsExtended;
		'dict-2'?: TCrossRefDocumentsExtended;
		versions?: TCrossRefDocumentsExtended;
	} = {};

	// CETEI Data
	async function loadText(filename: string | null | undefined): Promise<ProcessedTEI> {
		const defaultBody = {
			serialized: `
	<?xml version="1.0" encoding="UTF-8"?>
		<TEI xmlns="http://www.tei-c.org/ns/1.0">
			<text>
				<body>
					<div type="body" xml:lang="en">
						<p>No content available.</p>
					</div>
				</body>
			</text>
		</TEI>`,
			elements: [],
			pages: []
		};

		if (!filename) {
			console.warn(`Nullish filename`);
			return defaultBody;
		}

		try {
			// (0) Resolve full path
			const path_from_map = documents_path_map_xml[filename]; //! FIX THIS
			const path = `/data/sources/tei/${path_from_map}`;
			if (!path_from_map) {
				console.warn(`Mapping does not contain filename ${filename}.`);
				return defaultBody;
			}

			// (1) Fetch xml data
			const res = await fetch(asset(`${path}/${filename}.xml`));
			// Throw 404 if XML not found
			if (!res.ok) {
				if (res.status === 404) {
					console.warn(`XML not found in ${path}/${filename}.xml. Using default data.`);
					return defaultBody;
				}
				throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
			}

			// (2) Extract xmlString
			const xmlString = await res.text();
			// Warn if empty/invalid XML
			if (!xmlString || !xmlString.trim()) {
				console.warn(`Empty XML response from ${path}/${filename}.xml. Using default data.`);
				return defaultBody;
			}

			// (3) Apply CETEIcean's processTEI()
			try {
				const ceteiData = processTEI(xmlString);
				return ceteiData;
			} catch (parseErr) {
				console.error('TEI parse error:', parseErr);
				return defaultBody;
			}
		} catch (err) {
			// catch any other errors
			console.error('Failed to load XML:', err);
			return defaultBody;
		}
	}

	// Load main text
	const ceteiData = await loadText(resolvedDoc.item?.tei.filename);

	// Load translation
	let ceteiDataTranslation: ProcessedTEI | null = null;
	if (resolvedDoc.item?.translation) {
		ceteiDataTranslation = await loadText(resolvedDoc.item?.translation?.filename);
	}

	// Retrieve Data for Cross References
	if (resolvedDoc?.item) {
		// linked_entities
		if (resolvedDoc.item.crossReferences.linked_entities) {
			crossRef.linked_entities = {};
			Object.keys(resolvedDoc.item.crossReferences.linked_entities).forEach((type) => {
				crossRef.linked_entities![type as TRegTypes] =
					resolvedDoc.item!.crossReferences?.linked_entities?.[type as TRegTypes]?.map((key) => {
						const resolvedReg = resolveReg(reg, key as TRegKeysFlat);
						const hasValidType = resolvedReg?.regType;
						return {
							item: hasValidType ? resolvedReg?.item : null,
							regType: hasValidType ? resolvedReg?.regType : null,
							regKey: key
						};
					}) ?? null;
			});
		}
		// cited_documents
		if (resolvedDoc.item.crossReferences.cited_entities) {
			crossRef.cited_entities = {};
			Object.keys(resolvedDoc.item.crossReferences.cited_entities).forEach((type) => {
				crossRef.cited_entities![type as TRegTypes] =
					resolvedDoc.item!.crossReferences?.cited_entities?.[type as TRegTypes]?.map((key) => {
						const resolvedReg = resolveReg(reg, key as TRegKeysFlat);
						const hasValidType = resolvedReg?.regType;
						return {
							item: hasValidType ? resolvedReg?.item : null,
							regType: hasValidType ? resolvedReg?.regType : null,
							regKey: key
						};
					}) ?? null;
			});
		}

		// linked_documents
		if (resolvedDoc.item.crossReferences.linked_documents) {
			crossRef.linked_documents = {};
			Object.keys(resolvedDoc.item.crossReferences.linked_documents).forEach((type) => {
				crossRef.linked_documents![type as TDocTypes] =
					resolvedDoc.item!.crossReferences?.linked_documents?.[type as TDocTypes]?.map((key) => {
						const resolvedDoc = resolveDoc(allDocs, key as TDocKeys);
						const hasValidType = resolvedDoc?.docType;
						return {
							item: hasValidType ? resolvedDoc?.item : null,
							docType: hasValidType ? resolvedDoc?.docType : null,
							docKey: key
						};
					}) ?? null;
			});
		}
		// cited_documents
		if (resolvedDoc.item.crossReferences.cited_documents) {
			crossRef.cited_documents = {};
			Object.keys(resolvedDoc.item.crossReferences.cited_documents).forEach((type) => {
				crossRef.cited_documents![type as TDocTypes] =
					resolvedDoc.item!.crossReferences?.cited_documents?.[type as TDocTypes]?.map((key) => {
						const resolvedDoc = resolveDoc(allDocs, key as TDocKeys);
						const hasValidType = resolvedDoc?.docType;
						return {
							item: hasValidType ? resolvedDoc?.item : null,
							docType: hasValidType ? resolvedDoc?.docType : null,
							docKey: key
						};
					}) ?? null;
			});
		}
		// versions //! Still needed?
		if (resolvedDoc.item.crossReferences.versions) {
			crossRef.versions = {};
			Object.keys(resolvedDoc.item.crossReferences.versions).forEach((type) => {
				crossRef.versions![type as TDocTypes] =
					resolvedDoc.item!.crossReferences?.versions?.[type as TDocTypes]?.map((key) => {
						const resolvedDoc = resolveDoc(allDocs, key as TDocKeys);
						const hasValidType = resolvedDoc?.docType;
						return {
							item: hasValidType ? resolvedDoc?.item : null,
							docType: hasValidType ? resolvedDoc?.docType : null,
							docKey: key
						};
					}) ?? null;
			});
		}
	}

	return {
		ceteiData,
		ceteiDataTranslation,
		resolvedDoc,
		crossRef
	};
};
