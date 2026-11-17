import type { EntryGenerator } from './$types';
import { register as reg } from '$lib/data/register.json';
import type { TRegKeysFlat, TRegTypes } from '$lib/types/register/TRegister';
import type { PageServerLoad } from './$types';

export const entries: EntryGenerator = () => {
	const keys = Object.keys(reg).map((firstKey) => {
		return { regSlug: firstKey };
	});
	return keys;
};

export const load: PageServerLoad = async ({ parent }) => {
	const { regType } = await parent();

	function createRegListEntries(regType: TRegTypes) {
		if (!regType) return {};

		const fullRegOfType = reg[regType];
		if (!fullRegOfType) return {};

		// Strip register entries to only the fields needed.
		type TPartialRegEntry = {
			name?: string;
			lastname?: string;
			type?: string;
		};

		const allowedKeys: Array<keyof TPartialRegEntry> = ['name', 'lastname', 'type', 'date'];

		return Object.fromEntries(
			Object.entries(fullRegOfType).map(([key, entry]) => [
				key,
				Object.fromEntries(
					allowedKeys.filter((k) => k in entry && entry[k] !== undefined).map((k) => [k, entry[k]])
				) as TPartialRegEntry
			])
		) as Partial<Record<TRegKeysFlat, TPartialRegEntry>>;
	}

	const regListEntries = createRegListEntries(regType);

	return { regListEntries };
};
