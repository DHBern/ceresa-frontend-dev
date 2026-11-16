type TMeta = {
	generated_by: string;
	task: string;
	generated_on: string;
	description: string;
};

type TTextualTypeEntry = {
	docTypeTestuale: string;
	label: string;
};

export type TDocDictTextualTypes = {
	meta: TMeta;
	textualTypes: Record<string, TTextualTypeEntry>;
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

// Row model shared between +layout.svelte and [docTypeTestuale]/+page.svelte
export type TDocRow = {
	docType: 'posthum' | 'unpublished' | 'published';
	key: string;
	slug: string;
	name: string;
	title: string | null;
	dateFrom: string | null;
	language: string | null;
	pubPlace: string | null;
	typeEditoriale: string | null;
	hasAudio: boolean;
	fullyEdited: boolean | null;
};

export type TDocSortBy = 'name' | 'date-asc' | 'date-desc';
export const DOC_LIST_NONE = '__none__';