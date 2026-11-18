import type { TRegKeysFlat } from '$lib/types/register/TRegister';

export function findRegTypeByRegKey(regKey: TRegKeysFlat) {
	if (regKey.includes('person')) return 'people';
	else if (regKey.includes('place')) return 'places';
	else if (regKey.includes('org')) return 'orgs';
	else if (regKey.includes('work')) return 'works';
	else return null;
}
