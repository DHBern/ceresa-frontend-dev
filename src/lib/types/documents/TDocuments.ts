// --- Types ----------------------------------------
// Keys
import { type TPosthumKeys } from './TPosthumKeys';
import { type TUnpublishedKeys } from './TUnpublishedKeys';
import { type TPublishedKeys } from './TPublishedKeys';

// Types
import { type TPosthumGroups } from './TPosthumGroups';
import { type TUnpublishedGroups } from './TUnpublishedGroups';
import { type TPublishedGroups } from './TPublishedGroups';

// From Register
import { type TPeopleKeys } from '../register/TPeopleKeys';
import { type TPlacesKeys } from '../register/TPlacesKeys';
import { type TEventsKeys } from '../register/TEventsKeys';
import { type TOrgsKeys } from '../register/TOrgsKeys';
import { type TBiblsKeys } from '../register/TBiblsKeys';
import { type TKeywordsKeys } from '../register/TKeywordsKeys';
import type { TRegKeysFlat, TRegTypes } from '../register/TRegister';

// --- Document -------------------------------------------------------
type TContentNotes = {
	type: string;
	title?: string;
	comment?: string;
};
type TCrossRefDocs = {
	posthum?: TPosthumKeys[];
	unpublished?: TUnpublishedKeys[];
	published?: TPublishedKeys[];
};
type TCrossRefEntities = {
	people?: TPeopleKeys[];
	places?: TPlacesKeys[];
	events?: TEventsKeys[];
	orgs?: TOrgsKeys[];
	bibls?: TBiblsKeys[];
	keywords?: TKeywordsKeys[];
};

type TRendition = {
	blur?: boolean;
	hide?: boolean;
};

export type TDocuments = {
	meta: {
		generated_by: string;
		task: string;
		generated_on: string;
		description: string;
	};
	documents: {
		posthum: {
			[key in TPosthumKeys]: {
				slug?: string; //! discuss whether this is identical to key
				name: string;
				date: { from: string | null; to: string | null };
				type: TPosthumGroups | '?' | '';
				metadata: {
					title: string | null;
					authors?: string[];
					pubDate: string;
					title_full: string;
					title_short?: string;
					pubPlace?: string;
					pubDetails?: string;
					textstufen_edited: string[];
					textzeugen_nonedited: string[];
					archive: string;
					archiveCollation: string;
					pubSecondary: string;
					note: string;
				};
				crossReferences?: {
					citedDocuments?: TCrossRefDocs;
					linkedDocuments?: TCrossRefDocs;
					citedEntities?: TCrossRefEntities;
					linkedEntities?: TCrossRefEntities;
				};
				editorialNotes: {
					contentNotes?: TContentNotes[];
				};
				tei: {
					path: string;
					filename: string;
				};
				manuscript: {
					rendition?: TRendition | null;
					iiif_urls: string[];
				};
				numPages: number | null;
				edition: {
					fullyEdited: boolean;
				};
			};
		};
		unpublished: {
			[key in TUnpublishedKeys]: {
				slug?: string; //! discuss whether this is identical to key
				name: string;
				date: { from: string | null; to: string | null };
				type: TUnpublishedGroups | '?' | '';
				metadata: {
					title: string | null;
					authors?: string[];
					pubDate: string;
					title_full: string;
					title_short?: string;
					pubPlace?: string;
					pubDetails?: string;
					textstufen_edited: string[];
					textzeugen_nonedited: string[];
					archive: string;
					archiveCollation: string;
					pubSecondary: string;
					note: string;
				};
				crossReferences?: {
					citedDocuments?: TCrossRefDocs;
					linkedDocuments?: TCrossRefDocs;
					citedEntities?: TCrossRefEntities;
					linkedEntities?: TCrossRefEntities;
				};
				editorialNotes: {
					contentNotes?: TContentNotes[];
				};
				tei: {
					path: string;
					filename: string;
				};
				manuscript: {
					rendition?: TRendition | null;
					iiif_urls: string[];
				};
				numPages: number | null;
				edition: {
					fullyEdited: boolean;
				};
			};
		};
		published: {
			[key in TPublishedKeys]: {
				slug?: string; //! discuss whether this is identical to key
				name: string;
				date: { from: string | null; to: string | null };
				type: TPublishedGroups | '?' | '';
				metadata: {
					title: string | null;
					authors?: string[];
					pubDate: string;
					title_full: string;
					title_short?: string;
					pubPlace?: string;
					pubDetails?: string;
					textstufen_edited: string[];
					textzeugen_nonedited: string[];
					archive: string;
					archiveCollation: string;
					pubSecondary: string;
					note: string;
				};
				crossReferences?: {
					citedDocuments?: TCrossRefDocs;
					linkedDocuments?: TCrossRefDocs;
					citedEntities?: TCrossRefEntities;
					linkedEntities?: TCrossRefEntities;
				};
				editorialNotes: {
					contentNotes?: TContentNotes[];
				};
				tei: {
					path: string;
					filename: string;
				};
				manuscript: {
					rendition?: TRendition | null;
					iiif_urls: string[];
				};
				numPages: number | null;
				edition: {
					fullyEdited: boolean;
				};
			};
		};
	};
};

// --- Docs Dictionary -------------------------------------------------------
type DictEntity<TM extends string | number | symbol, TG extends string | number | symbol> = {
	name: string;
	key_singular: string;
	label_plural: string;
	metadata: {
		[K in TM]?: { label: string };
	};
	groups:
		| {
				[K in TG]: {
					label_singular: string;
					label_plural: string;
					slug?: string | null;
				};
		  }
		| object;
};

export type TDocDict = {
	meta: {
		generated_by: string;
		task: string;
		generated_on: string;
		description: string;
	};
	dict_docs: {
		posthum: DictEntity<TDocMetadataKeysPosthum, TPosthumGroups>;
		unpublished: DictEntity<TDocMetadataKeysUnpublished, TUnpublishedGroups>;
		published: DictEntity<TDocMetadataKeysPublished, TPublishedGroups>;
	};
};

// --- Sets -------------------------------------------------------
export type TDocTypes = keyof TDocuments['documents'];
export type TDocKeys = TPosthumKeys | TUnpublishedKeys | TPublishedKeys;
export type TDocKeysMap = {
	posthum: TPosthumKeys;
	unpublished: TUnpublishedKeys;
	published: TPublishedKeys;
};

export type TDocAttrsPosthum = keyof TDocuments['documents']['posthum'][TPosthumKeys];
export type TDocAttrsUnpublished = keyof TDocuments['documents']['unpublished'][TUnpublishedKeys];
export type TDocAttrsPublished = keyof TDocuments['documents']['published'][TPublishedKeys];
export type TDocAttrs = TDocAttrsPosthum | TDocAttrsUnpublished | TDocAttrsPublished;
export type TDocAttrsMap = {
	posthum: TDocAttrsPosthum;
	unpublished: TDocAttrsUnpublished;
	published: TDocAttrsPublished;
};

export type TDocMetadataKeysPosthum =
	keyof TDocuments['documents']['posthum'][TPosthumKeys]['metadata'];
export type TDocMetadataKeysUnpublished =
	keyof TDocuments['documents']['unpublished'][TUnpublishedKeys]['metadata'];
export type TDocMetadataKeysPublished =
	keyof TDocuments['documents']['published'][TPublishedKeys]['metadata'];
export type TDocMetadataKeys =
	TDocMetadataKeysPosthum | TDocMetadataKeysUnpublished | TDocMetadataKeysPublished;
export type TDocMetadataKeysMap = {
	posthum: TDocMetadataKeysPosthum;
	unpublished: TDocMetadataKeysUnpublished;
	published: TDocMetadataKeysPublished;
};

export type TDocItemsPosthum = TDocuments['documents']['posthum'][TPosthumKeys];
export type TDocItemsUnpublished = TDocuments['documents']['unpublished'][TUnpublishedKeys];
export type TDocItemsPublished = TDocuments['documents']['published'][TPublishedKeys];
export type TDocItems = TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished;
export type TDocItemsMap = {
	posthum: TDocItemsPosthum;
	unpublished: TDocItemsUnpublished;
	published: TDocItemsPublished;
};

// Group Set
export type TDocGroupsFlat = TPosthumGroups | TUnpublishedGroups | TPublishedGroups | '?' | '';

export type TDocGroupsMap = {
	posthum: TPosthumGroups | '?' | '';
	unpublished: TUnpublishedGroups | '?' | '';
	published: TPublishedGroups | '?' | '';
};

// CrossRef Entities (Register)
export type TCrossRefEntitiesExtended = Partial<
	Record<
		TRegTypes,
		{ item: object | string | null; regType: TRegTypes | null; regKey: TRegKeysFlat }[] | null
	>
>;

// CrossRef Documents
export type TCrossRefDocumentsExtended = Partial<
	Record<
		TDocTypes,
		{ item: object | string | null; docType: TDocTypes | null; docKey: TDocKeys }[] | null
	>
>;
