import { resolve } from '$app/paths';

export function resolveDocPath(docId: string): string {
	return resolve('/[docId=docId]', { docId: encodeURIComponent(docId) });
}
