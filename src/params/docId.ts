import type { ParamMatcher } from '@sveltejs/kit';
import { unpublished_keys } from '$lib/data/unpublished_keys.json';
import { published_keys } from '$lib/data/published_keys.json';
import { posthum_keys } from '$lib/data/posthum_keys.json';

const keys_all = [...posthum_keys, ...unpublished_keys, ...published_keys];
const keys_all_set = new Set(keys_all);
const encoded_keys_all_set = new Set(
	keys_all.flatMap((key) => [encodeURIComponent(key), encodeURI(encodeURIComponent(key))])
);

export const match = ((param: string) => {
	return keys_all_set.has(param) || encoded_keys_all_set.has(param);
}) satisfies ParamMatcher;
