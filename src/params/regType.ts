import type { ParamMatcher } from '@sveltejs/kit';
import { register as reg } from '$lib/data/register.json';

// Extract the first-order keys from the register object
const keys = Object.keys(reg) as Array<keyof typeof reg>;

export const match: ParamMatcher = (param: string): param is (typeof keys)[number] => {
	return keys.includes(param);
};
