// ------------------------------------------------------------
// Resolver Function for Doc-Object (using simple heuristic)
// ------------------------------------------------------------

import type { TDocKeys, TDocTypes, TDocuments } from '$lib/types/documents/TDocuments';
import type { TPosthumKeys } from '$lib/types/documents/TPosthumKeys';
import type { TPublishedKeys } from '$lib/types/documents/TPublishedKeys';
import type { TUnpublishedKeys } from '$lib/types/documents/TUnpublishedKeys';

export type TResolvedPosthum = {
	docId: TPosthumKeys;
	docType: 'posthum';
	item: TDocuments['documents']['posthum'][TPosthumKeys] | null;
};
export type TResolvedUnpublished = {
	docId: TUnpublishedKeys;
	docType: 'unpublished';
	item: TDocuments['documents']['unpublished'][TUnpublishedKeys] | null;
};
export type TResolvedPublished = {
	docId: TPublishedKeys;
	docType: 'published';
	item: TDocuments['documents']['published'][TPublishedKeys] | null;
};

export type TResolvedDoc =
	TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;

export function resolveDoc(
	object: Record<TDocTypes, any> | null,
	docId: TDocKeys
): TResolvedDoc | null {
	if (docId.includes('posthum')) {
		return {
			docId: docId as TPosthumKeys,
			docType: 'posthum',
			item: object?.posthum[docId] || null
		};
	} else if (docId.includes('unpublished')) {
		return {
			docId: docId as TUnpublishedKeys,
			docType: 'unpublished',
			item: object?.unpublished[docId] || null
		};
	} else if (docId.includes('published')) {
		return {
			docId: docId as TPublishedKeys,
			docType: 'published',
			item: object?.published[docId] || null
		};
	} else {
		return null;
	}
}

// ------------------------------------------------------------
// Resolver Function for Doc-Object (using run-time indexing)
// ------------------------------------------------------------

// import { documents as docs } from '$lib/data/documents.json';

// const docTypeIndex = Object.fromEntries([
// 	...Object.keys(docs.posthum).map((k) => [k, 'posthum']),
// 	...Object.keys(docs.unpublished).map((k) => [k, 'unpublished']),
// 	...Object.keys(docs.published).map((k) => [k, 'published'])
// ]);

// export function resolveDocIndexed<K extends TDocKeys>(
// 	object: Record<TDocTypes, any> | null,
// 	docId: K
// ): TResolvedDoc | null {
// 	const type = docTypeIndex[docId];

// 	if (!docTypeIndex[docId]) return null;
// 	switch (type) {
// 		case 'posthum':
// 			return {
// 				docId: docId as TPosthumKeys,
// 				docType: 'posthum',
// 				item: object?.posthum[docId as TPosthumKeys] || null
// 			};
// 		case 'unpublished':
// 			return {
// 				docId: docId as TUnpublishedKeys,
// 				docType: 'unpublished',
// 				item: object?.unpublished[docId as TUnpublishedKeys] || null
// 			};
// 		case 'published':
// 			return {
// 				docId: docId as TPublishedKeys,
// 				docType: 'published',
// 				item: object?.published[docId as TPublishedKeys] || null
// 			};
// 		default:
// 			return null;
// 	}
// }
