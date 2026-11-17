import { error } from '@sveltejs/kit';
import {documents } from '$lib/data/documents.json';
import dictJson from '$lib/dictionaries/dict_docTextualTypes.json';
import type { TDocDictTextualTypes } from '$lib/types/documents/TDocDictTextualTypes';

export const prerender = true;

const dict = dictJson as TDocDictTextualTypes;

export const load = ({ params }) => {
	const entry = dict.textualTypes[params.docTypeTestuale];
	if (!entry) error(404, 'Tipo testuale sconosciuto');

	return {
		documents: documents,
		textualTypes: dict.textualTypes,
		uiLabels: dict.labels,
		docTypeTestualeSlug: params.docTypeTestuale,
		typeGenre: entry.docTypeTestuale,
		typeTestualeLabel: entry.label
	};
};