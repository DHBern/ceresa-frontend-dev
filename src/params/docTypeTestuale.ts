import type { ParamMatcher } from '@sveltejs/kit';
import { textualTypes } from '$lib/dictionaries/dict_docTextualTypes.json';

const slugs = new Set(Object.values(textualTypes).map(t => t.slug));

export const match = ((param: string): boolean => {
	return slugs.has(param);
}) satisfies ParamMatcher;
