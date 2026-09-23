import { normalizeChars } from '$lib/functions/ease_of_use/normalizeChars';

type TFilterAndSortOptions = {
	filterKey?: string;
	filtersIn?: string[];
	filtersOut?: string[];
};

export function filterAndGroupData(
	data: Record<string, any>,
	sortBy: string,
	{ filterKey = '', filtersIn = [], filtersOut = [] }: TFilterAndSortOptions = {}
): [string, typeof data][][] {
	// 1. Define the sort comparison logic
	let sortFunction: (a: [string, any], b: [string, any]) => number;

	if (sortBy === 'date') {
		sortFunction = (a, b) => {
			const [, entryA] = a;
			const [, entryB] = b;

			const compare = (x?: string, y?: string) => {
				if (!x && !y) return 0;
				if (!x) return 1;
				if (!y) return -1;
				return x.localeCompare(y);
			};

			const valAFrom = entryA[sortBy]?.from as string;
			const valBFrom = entryB[sortBy]?.from as string;
			const valATo = entryA[sortBy]?.to as string;
			const valBTo = entryB[sortBy]?.to as string;

			return compare(valAFrom, valBFrom) || compare(valATo, valBTo);
		};
	} else {
		sortFunction = (a, b) => {
			const [, entryA] = a;
			const [, entryB] = b;

			const aVal = entryA[sortBy];
			const bVal = entryB[sortBy];

			if (!aVal && !bVal) return 0;
			if (!aVal) return 1;
			if (!bVal) return -1;

			return String(aVal).localeCompare(String(bVal));
		};
	}

	// 2. Define the grouping key logic
	const getGroupKey = (entry: any): string => {
		if (sortBy === 'date') {
			// For date, use the full 'from' value as the group key
			return entry[sortBy]?.from ?? '';
		} else {
			// For others, use the first letter
			const val = entry[sortBy];
			if (!val) return '';
			// Normalize before extracting first letter
			return normalizeChars(String(val)).charAt(0).toUpperCase();
		}
	};

	// 3. Filter and Sort first
	const sortedEntries = Object.entries(data)
		.map(([key, entry]) => [key, entry] as [string, typeof data])
		.filter(([, entry]) =>
			filtersIn?.length ? filtersIn.some((filter) => entry[filterKey]?.includes(filter)) : true
		)
		.filter(([, entry]) =>
			filtersOut?.length ? !filtersOut.some((filter) => entry[filterKey]?.includes(filter)) : true
		)
		.sort(sortFunction);

	// 4. Group the sorted entries
	const groupedResult: [string, typeof data][][] = [];
	let currentGroup: [string, typeof data][] = [];
	let currentKey: string | null = null;

	sortedEntries.forEach((item) => {
		const key = getGroupKey(item[1]);

		// If this is the first item, or the key changed, start a new group
		if (currentKey === null || key !== currentKey) {
			if (currentGroup.length > 0) {
				groupedResult.push(currentGroup);
			}
			currentGroup = [item];
			currentKey = key;
		} else {
			// Same group, push to current
			currentGroup.push(item);
		}
	});

	// Push the last remaining group
	if (currentGroup.length > 0) {
		groupedResult.push(currentGroup);
	}

	return groupedResult;
}
