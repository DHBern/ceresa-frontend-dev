// ------------------------------------------------------------
// Resolver Function for Register-Object (using simple heuristic)
// ------------------------------------------------------------

import type { TBiblsKeys } from '$lib/types/register/TBiblsKeys';
import type { TOrgsKeys } from '$lib/types/register/TOrgsKeys';
import type { TPeopleKeys } from '$lib/types/register/TPeopleKeys';
import type { TPlacesKeys } from '$lib/types/register/TPlacesKeys';
import type { TRegister, TRegKeysFlat, TRegTypes } from '$lib/types/register/TRegister';

export type TResolvedRegister =
	| {
			regKey: TPeopleKeys;
			regType: 'people';
			item: TRegister['register']['people'][TPeopleKeys] | null;
	  }
	| {
			regKey: TPlacesKeys;
			regType: 'places';
			item: TRegister['register']['places'][TPlacesKeys] | null;
	  }
	| {
			regKey: TOrgsKeys;
			regType: 'orgs';
			item: TRegister['register']['orgs'][TOrgsKeys] | null;
	  }
	| {
			regKey: TBiblsKeys;
			regType: 'bibls';
			item: TRegister['register']['bibls'][TBiblsKeys] | null;
	  };

export function resolveReg(
	object: Record<TRegTypes, any> | null,
	regKey: TRegKeysFlat | undefined | null
): TResolvedRegister | null {
	if (!regKey) return null;
	if (regKey.includes('person_')) {
		return {
			regKey: regKey as TPeopleKeys,
			regType: 'people',
			item: object?.people[regKey] || null
		};
	} else if (regKey.includes('place_')) {
		return {
			regKey: regKey as TPlacesKeys,
			regType: 'places',
			item: object?.places[regKey] || null
		};
	} else if (regKey.includes('organisation_')) {
		return {
			regKey: regKey as TOrgsKeys,
			regType: 'orgs',
			item: object?.orgs[regKey] || null
		};
	} else if (regKey.includes('bibl_')) {
		return {
			regKey: regKey as TBiblsKeys,
			regType: 'bibls',
			item: object?.bibls[regKey] || null
		};
	} else {
		return null;
	}
}
