import type { ParamMatcher } from '@sveltejs/kit';
import { dict_docTypesGenre } from '$lib/dictionaries/dict_docTypesGenre.json';

const slugs = new Set(Object.values(dict_docTypesGenre).map((type) => type.slug));

export const match = ((param: string): boolean => {
	return slugs.has(param);
}) satisfies ParamMatcher;
