// import type { TDocDict, TDocGroupsFlat, TDocTypes } from '$lib/types/documents/TDocuments';
// import type { TPosthumGroups } from '$lib/types/documents/TPosthumGroups';
// import type { TRegDict, TRegGroupsFlat, TRegTypes } from '$lib/types/register/TRegister';

// export function resolveGroup<T extends "documents"|"register">(
// 	dict: T extends "documents" ? TDocDict : TRegDict,
// 	groupKey:  T extends "documents" ? TDocGroupsFlat : TRegGroupsFlat,
// 	type:  T extends "documents" ? TDocTypes : TRegTypes
// ) {
// 	switch (type) {
// 		case 'posthum':
// 			return (dict as TDocDict).dict_docs.posthum.groups[groupKey as TPosthumGroups];
// 		case 'unpublished':
// 			return dict.groups.groupKey;
// 		default:
// 			return null;
// 	}
// }
