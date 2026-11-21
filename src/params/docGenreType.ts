import type { ParamMatcher } from '@sveltejs/kit';
import { dict_docGenreTypes } from '$lib/dictionaries/dict_docGenreTypes.json';

const slugs = new Set(Object.values(dict_docGenreTypes).map((type) => type.slug));

export const match = ((param: string): boolean => {
	return slugs.has(param);
}) satisfies ParamMatcher;
