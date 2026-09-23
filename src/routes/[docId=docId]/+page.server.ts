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
import { register as reg } from '$lib/data/register.json';
import type { TRegKeysFlat, TRegTypes } from '$lib/types/register/TRegister';
import { resolveReg } from '$lib/functions/ease_of_use/resolveReg';
import { posthum_keys } from '$lib/data/posthum_keys.json';
import { unpublished_keys } from '$lib/data/unpublished_keys.json';
import { published_keys } from '$lib/data/published_keys.json';

export const entries: EntryGenerator = () => {
	const posthumKeyObjects = posthum_keys.map((key) => {
		return { docId: key };
	});
	const unpublishedKeyObjects = unpublished_keys.map((key) => {
		return { docId: key };
	});
	const publishedKeyObjects = published_keys.map((key) => {
		return { docId: key };
	});
	return [...posthumKeyObjects, ...unpublishedKeyObjects, ...publishedKeyObjects];
};

export const load: PageServerLoad = async ({ params, fetch }) => {
	// Resolve Documents to current document
	const resolvedDoc = resolveDoc(allDocs, params.docId as TDocKeys) as
		TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;
	// Resolve cross-register references
	const crossRef: {
		linkedEntities?: TCrossRefEntitiesExtended;
		citedEntities?: TCrossRefEntitiesExtended;
		linkedDocuments?: TCrossRefDocumentsExtended;
		citedDocuments?: TCrossRefDocumentsExtended;
	} = {};

	// CETEI Data
	async function loadText(params: { docId: string }): Promise<ProcessedTEI> {
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
			elements: []
		};

		try {
			// (1) Fetch xml data
			const res = await fetch(
				asset(`/data/sources/tei/${resolvedDoc.item?.tei.path}/${resolvedDoc.item?.tei.filename}`)
			);
			// Throw 404 if XML not found
			if (!res.ok) {
				if (res.status === 404) {
					console.warn('XML not found, using default data');
					return defaultBody;
				}
				throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
			}

			// (2) Extract xmlString
			const xmlString = await res.text();
			// Warn if empty/invalid XML
			if (!xmlString || !xmlString.trim()) {
				console.warn('Empty XML response, using default data');
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
	const ceteiData = await loadText(params);

	if (resolvedDoc?.item) {
		// linkedEntities
		if (resolvedDoc.item.crossReferences?.linkedEntities) {
			crossRef.linkedEntities = {};
			Object.keys(resolvedDoc.item.crossReferences.linkedEntities).forEach((type) => {
				crossRef.linkedEntities![type as TRegTypes] =
					resolvedDoc.item!.crossReferences?.linkedEntities?.[type as TRegTypes]?.map((key) => {
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
		// citedDocuments
		if (resolvedDoc.item.crossReferences?.citedEntities) {
			crossRef.citedEntities = {};
			Object.keys(resolvedDoc.item.crossReferences.citedEntities).forEach((type) => {
				crossRef.citedEntities![type as TRegTypes] =
					resolvedDoc.item!.crossReferences?.citedEntities?.[type as TRegTypes]?.map((key) => {
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

		// linkedDocuments
		if (resolvedDoc.item.crossReferences?.linkedDocuments) {
			crossRef.linkedDocuments = {};
			Object.keys(resolvedDoc.item.crossReferences.linkedDocuments).forEach((type) => {
				crossRef.linkedDocuments![type as TDocTypes] =
					resolvedDoc.item!.crossReferences?.linkedDocuments?.[type as TDocTypes]?.map((key) => {
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
		// citedDocuments
		if (resolvedDoc.item.crossReferences?.citedDocuments) {
			crossRef.citedDocuments = {};
			Object.keys(resolvedDoc.item.crossReferences.citedDocuments).forEach((type) => {
				crossRef.citedDocuments![type as TDocTypes] =
					resolvedDoc.item!.crossReferences?.citedDocuments?.[type as TDocTypes]?.map((key) => {
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
		resolvedDoc,
		crossRef
	};
};
