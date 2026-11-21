import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { documents } from '$lib/data/documents.json';
import dictJson from '$lib/dictionaries/dict_docGenreTypes.json';
import type { TDict_DocGenreTypes } from '$lib/types/documents/TDict_DocGenreTypes';

export const prerender = true;

const dict = dictJson as TDict_DocGenreTypes;

export const load: LayoutServerLoad = ({ params }) => {
	const entry = Object.values(dict.dict_docGenreTypes).find(
		(type) => type.slug === params.docGenreType
	);
	if (!entry) error(404, 'Genere documentale sconosciuto');

	return {
		documents,
		genreTypes: dict.dict_docGenreTypes,
		uiLabels: dict.labels,
		docGenreTypeSlug: params.docGenreType,
		genreType: entry.id_singular,
		genreTypeLabel: entry.label_plural
	};
};
