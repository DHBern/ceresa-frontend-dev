import type { ParamMatcher } from '@sveltejs/kit';
import { unpublished_keys } from '$lib/data/unpublished_keys.json';
import { published_keys } from '$lib/data/published_keys.json';
import { posthum_keys } from '$lib/data/posthum_keys.json';

const keys_all = [...posthum_keys, ...unpublished_keys, ...published_keys];

export const match = ((param: string): param is (typeof keys_all)[number] => {
	const result = keys_all.includes(param);
	return result;
}) satisfies ParamMatcher;
