import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { documents } from '$lib/data/documents.json';
import dictJson from '$lib/dictionaries/dict_docTypesGenre.json';
import type { TDict_DocTypesGenre } from '$lib/types/documents/TDict_DocTypesGenre';

export const prerender = true;

const dict = dictJson as TDict_DocTypesGenre;

export const load: LayoutServerLoad = ({ params }) => {
	const entry = Object.values(dict.dict_docTypesGenre).find(
		(type) => type.slug === params.docTypeGenre
	);
	if (!entry) error(404, 'Genere documentale sconosciuto');

	return {
		documents,
		typesGenre: dict.dict_docTypesGenre,
		uiLabels: dict.labels,
		docTypeGenreSlug: params.docTypeGenre,
		typeGenre: entry.id_singular,
		typeGenreLabel: entry.label_plural
	};
};
