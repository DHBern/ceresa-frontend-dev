// --- Types ----------------------------------------
// Keys
import { type TPosthumKeys } from './TPosthumKeys';
import { type TUnpublishedKeys } from './TUnpublishedKeys';
import { type TPublishedKeys } from './TPublishedKeys';
import { type TAudioKeys } from './TAudioKeys';

// Types
import { type TPosthumGroups } from './TPosthumGroups';
import { type TUnpublishedGroups } from './TUnpublishedGroups';
import { type TPublishedGroups } from './TPublishedGroups';
import { type TAudioGroups } from './TAudioGroups';

// From Register
import { type TPeopleKeys } from '../register/TPeopleKeys';
import { type TPlacesKeys } from '../register/TPlacesKeys';
import { type TOrgsKeys } from '../register/TOrgsKeys';
import { type TWorksKeys } from '../register/TWorksKeys';
import type { TRegKeysFlat, TRegTypes } from '../register/TRegister';
import type { TSeqKeys } from '../TSequences';

// --- Document -------------------------------------------------------
type TContentNotes = {
	type: string;
	title?: string;
	comment?: string;
};

type TLanguageKeys = 'it' | 'de' | 'fr';
type TDocEdtypeKeys =
	'in_periodico' | 'in_volume' | 'in_giornale' | 'manoscritto' | 'dattiloscritto';
type TDocGenreKeys =
	'saggio' | 'prosa' | 'racconto' | 'traduzione' | 'dizionario' | 'poesia' | 'romanzo' | 'teatrale';

type TCrossRefDocs = {
	posthum?: TPosthumKeys[];
	unpublished?: TUnpublishedKeys[];
	published?: TPublishedKeys[];
	audio?: TAudioKeys[];
};
type TCrossRefEntities = {
	people?: TPeopleKeys[];
	places?: TPlacesKeys[];
	orgs?: TOrgsKeys[];
	works?: TWorksKeys[];
};

type TRendition = {
	blur?: boolean;
	hide?: boolean;
};

export type TAudioChapters = {
	id: number;
	chapName: string;
	time: number;
};

export type TTextDocuments = {
	slug: string; //! NEW (@LLM: this is a redudant copy of the current TPosthumKeys, TPublishedKeys, TUnpublishedKeys)
	metadata: {
		type_genre: TDocGenreKeys;
		type_editorial: TDocEdtypeKeys;
		title_editorial: string;
		date: { from: string; to: string };
		language: TLanguageKeys;
		observations: string;
	};
	archival: {
		archive: string;
		signature: string;
		digitalisation_number: number;
		url_helvetic_archives: string;
		url_online_sources: string[];
	};
	document: {
		type_material: string;
		title_on_document: string;
		date_and_place_author_as_on_document?: string;
		date_author_normalised?: string;
	};
	iiif: {
		urls_IIIF_images?: string[];
		url_IIIF_manifest: string;
	};
	tei: {
		version_id: TPosthumKeys;
		suffix_version?: string;
		filename: TPosthumKeys;
	};
	crossReferences: {
		group_ids: TSeqKeys[];
		cited_documents?: TCrossRefDocs;
		linked_documents?: TCrossRefDocs;
		cited_entities?: TCrossRefEntities;
		linked_entities?: TCrossRefEntities;
		versions?: TCrossRefDocs;
	};
	publication: {
		pub_type: TDocTypes;
		pub_date?: string;
		pub_place?: string;
		pub_info?: string;
		other_editions?: string[];
		other_translations: string[];
	};
	transcribus: {
		tif_files_to_edit: string[];
		filename_first_facsimile: string;
		filename_last_facsimile: string;
	};
	translation?: {
		filename: string;
	};
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
			[key in TPosthumKeys]: TTextDocuments;
		};
		unpublished: {
			[key in TUnpublishedKeys]: TTextDocuments;
		};
		published: {
			[key in TPublishedKeys]: TTextDocuments;
		};
		audio: {
			[key in TAudioKeys]: {
				slug: TTextDocuments['slug'];
				metadata: TTextDocuments['metadata'];
				archival: TTextDocuments['archival'];
				document: TTextDocuments['document'];
				publication: TTextDocuments['publication'];
				audioMaterial: {
					path: string;
					filename: string;
					chapters?: TAudioChapters[];
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
		audio: DictEntity<TDocMetadataKeysAudio, TAudioGroups>;
	};
};

// --- Sets -------------------------------------------------------
export type TDocTypes = keyof TDocuments['documents'];
export type TTextDocKeys = TPosthumKeys | TUnpublishedKeys | TPublishedKeys;
export type TDocKeys = TTextDocKeys | TAudioKeys;
export type TDocKeysMap = {
	posthum: TPosthumKeys;
	unpublished: TUnpublishedKeys;
	published: TPublishedKeys;
	audio: TAudioKeys;
};

export type TDocAttrsPosthum = keyof TDocuments['documents']['posthum'][TPosthumKeys];
export type TDocAttrsUnpublished = keyof TDocuments['documents']['unpublished'][TUnpublishedKeys];
export type TDocAttrsPublished = keyof TDocuments['documents']['published'][TPublishedKeys];
export type TDocAttrsAudio = keyof TDocuments['documents']['audio'][TAudioKeys];
export type TDocAttrs =
	TDocAttrsPosthum | TDocAttrsUnpublished | TDocAttrsPublished | TDocAttrsAudio;
export type TDocAttrsMap = {
	posthum: TDocAttrsPosthum;
	unpublished: TDocAttrsUnpublished;
	published: TDocAttrsPublished;
	audio: TDocAttrsAudio;
};

export type TDocMetadataKeysPosthum =
	keyof TDocuments['documents']['posthum'][TPosthumKeys]['metadata'];
export type TDocMetadataKeysUnpublished =
	keyof TDocuments['documents']['unpublished'][TUnpublishedKeys]['metadata'];
export type TDocMetadataKeysPublished =
	keyof TDocuments['documents']['published'][TPublishedKeys]['metadata'];
export type TDocMetadataKeysAudio = keyof TDocuments['documents']['audio'][TAudioKeys]['metadata'];
export type TDocMetadataKeys =
	| TDocMetadataKeysPosthum
	| TDocMetadataKeysUnpublished
	| TDocMetadataKeysPublished
	| TDocMetadataKeysAudio;
export type TDocMetadataKeysMap = {
	posthum: TDocMetadataKeysPosthum;
	unpublished: TDocMetadataKeysUnpublished;
	published: TDocMetadataKeysPublished;
	audio: TDocMetadataKeysAudio;
};

export type TDocItemsPosthum = TDocuments['documents']['posthum'][TPosthumKeys];
export type TDocItemsUnpublished = TDocuments['documents']['unpublished'][TUnpublishedKeys];
export type TDocItemsPublished = TDocuments['documents']['published'][TPublishedKeys];
export type TDocItemsAudio = TDocuments['documents']['audio'][TAudioKeys];
export type TDocItems =
	TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished | TDocItemsAudio;
export type TDocItemsMap = {
	posthum: TDocItemsPosthum;
	unpublished: TDocItemsUnpublished;
	published: TDocItemsPublished;
	audio: TDocItemsAudio;
};

// Group Set
export type TDocGroupsFlat =
	TPosthumGroups | TUnpublishedGroups | TPublishedGroups | TAudioGroups | '?' | '';

export type TDocGroupsMap = {
	posthum: TPosthumGroups | '?' | '';
	unpublished: TUnpublishedGroups | '?' | '';
	published: TPublishedGroups | '?' | '';
	audio: TAudioGroups | '?' | '';
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
