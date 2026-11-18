// Keys
import { type TPlacesKeys } from './TPlacesKeys';
import { type TPeopleKeys } from './TPeopleKeys';
import { type TOrgsKeys } from './TOrgsKeys';
import { type TWorksKeys } from './TWorksKeys';

// Types
import { type TPeopleGroups } from './TPeopleGroups';
import { type TPlacesGroups } from './TPlacesGroups';
import { type TOrgsGroups } from './TOrgsGroups';
import { type TWorksGroups } from './TWorksGroups';

// From Documents
import { type TUnpublishedKeys } from '$lib/types/documents/TUnpublishedKeys';
import { type TPosthumKeys } from '$lib/types/documents/TPosthumKeys';
import { type TPublishedKeys } from '$lib/types/documents/TPublishedKeys';

// --- Register -------------------------------------------------------
export type TRegister = {
	meta: {
		generated_by: string | null;
		task: string | null;
		generated_on: string | null;
		description: string | null;
	};
	register: {
		people: {
			[key in TPeopleKeys]: {
				name: string | null;
				firstname: string | null;
				lastname: string | null;
				nameVariants: string[];
				qid?: string | null;
				gndNumber?: string | null;
				dateBirth: string | null;
				dateDeath: string | null;
				type: TPeopleGroups | null;
				orgIds: TOrgsKeys[] | null;
				note: string | null;
				docs?: (TUnpublishedKeys | TPosthumKeys | TPublishedKeys)[];
			};
		};
		places: {
			[key in TPlacesKeys]: {
				name: string | null;
				nameVariants: string[];
				gndNumber?: string | null;
				geoNamesID: number | null;
				geoNamesLink: string | null;
				type: TPlacesGroups | null;
				coords: number[] | null;
				country: string | null;
				note: string | null;
				docs?: (TUnpublishedKeys | TPosthumKeys | TPublishedKeys)[];
			};
		};
		orgs: {
			[key in TOrgsKeys]: {
				name: string | null;
				nameVariants: string[];
				gndNumber?: string | null;
				type: TOrgsGroups | null;
				note: string | null;
				docs?: (TUnpublishedKeys | TPosthumKeys | TPublishedKeys)[];
			};
		};
		works: {
			[key in TWorksKeys]: {
				name: string | null;
				type: TWorksGroups | null;
				authorIds: TPeopleKeys[] | null;
				pubDate: string | null;
				gndNumber?: string | null;
				note?: string | null;
				docs?: (TUnpublishedKeys | TPosthumKeys | TPublishedKeys)[];
			};
		};
	};
};

// --- Register Dictionary -------------------------------------------------------
type RegEntity<TA extends string | number | symbol, TG extends string | number | symbol> = {
	register_name: string | null;
	key_singular: string | null;
	label_plural: string | null;
	attributes: {
		[K in TA]: { label: string };
	};
	groups:
		| {
				[K in TG]: {
					label_singular: string | null;
					label_plural: string | null;
					slug?: string | null;
				};
		  }
		| object;
};

export type TRegDict = {
	meta: {
		generated_by: string | null;
		task: string | null;
		generated_on: string | null;
		description: string | null;
	};
	dict_register: {
		people: RegEntity<TRegAttrsPeople, TPeopleGroups>;
		places: RegEntity<TRegAttrsPlaces, TPlacesGroups>;
		orgs: RegEntity<TRegAttrsOrgs, TOrgsGroups>;
		works: RegEntity<TRegAttrsWorks, TWorksGroups>;
	};
};

// --- Sets -------------------------------------------------------
// Type Set
export type TRegTypes = keyof TRegister['register'];

// Key Set
export type TRegKeysFlat =
	TPeopleKeys | TPlacesKeys | TOrgsKeys | TWorksKeys;

export type TRegKeysMap = {
	people: TPeopleKeys;
	places: TPlacesKeys;
	orgs: TOrgsKeys;
	works: TWorksKeys;
};

// Attribute Sets
export type TRegAttrsPeople = keyof TRegister['register']['people'][TPeopleKeys];
export type TRegAttrsPlaces = keyof TRegister['register']['places'][TPlacesKeys];
export type TRegAttrsOrgs = keyof TRegister['register']['orgs'][TOrgsKeys];
export type TRegAttrsWorks = keyof TRegister['register']['works'][TWorksKeys];

export type TRegAttrs =
	| TRegAttrsPeople
	| TRegAttrsPlaces
	| TRegAttrsOrgs
	| TRegAttrsWorks

export type TRegAttrsMap = {
	people: TRegAttrsPeople;
	places: TRegAttrsPlaces;
	orgs: TRegAttrsOrgs;
	works: TRegAttrsWorks;
};

// Group Set
export type TRegGroupsFlat =
	TPeopleGroups | TPlacesGroups | TOrgsGroups | TWorksGroups;

export type TRegGroupsMap = {
	people: TPeopleGroups;
	places: TPlacesGroups;
	orgs: TOrgsGroups;
	works: TWorksGroups;
};
