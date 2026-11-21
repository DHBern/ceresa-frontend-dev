import type { TDocGenreKeys } from './TDocuments';

type TMeta = {
	generated_by: string;
	task: string;
	generated_on: string;
	description: string;
};

type TDocGenreTypeEntry = {
	slug: string;
	id_singular: TDocGenreKeys;
	label_singular: string;
	label_plural: string;
	description: string;
};

export type TDict_DocGenreTypes = {
	meta: TMeta;
	dict_docGenreTypes: Record<string, TDocGenreTypeEntry>;
	labels: {
		sort: { name: string; date_asc: string; date_desc: string };
		filters: {
			docType: string;
			editoriale: string;
			language: string;
			pubPlace: string;
			hasAudio: string;
		};
		docTypes: { posthum: string; unpublished: string; published: string };
		languages: Record<string, string>;
		none_labels: { language: string; pubPlace: string; editoriale: string };
		row: { noDate: string };
		empty: string;
		all: string;
	};
};

// Row model shared between +layout.svelte and the genre route.
export type TDocRow = {
	docType: 'posthum' | 'unpublished' | 'published';
	key: string;
	slug: string;
	name: string;
	title: string | null;
	dateFrom: string | null;
	dateTo: string | null;
	language: string | null;
	pubPlace: string | null;
	typeEditoriale: string | null;
	hasAudio: boolean;
	imageUrl: string | null;
};

export type TDocSortBy = 'name' | 'date-asc' | 'date-desc';
export type TDocColumn =
	'docType' | 'name' | 'date' | 'language' | 'pubPlace' | 'hasAudio' | 'typeEditoriale';
export const DOC_LIST_NONE = '__none__';
