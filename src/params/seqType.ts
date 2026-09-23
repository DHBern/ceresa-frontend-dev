import type { ParamMatcher } from '@sveltejs/kit';

const seqTypes = ['series', 'textstufen', 'travels'];

export const match = ((param: string) => {
	return seqTypes.includes(param);
}) satisfies ParamMatcher;
