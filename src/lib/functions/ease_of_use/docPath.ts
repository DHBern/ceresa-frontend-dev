import { resolve } from '$app/paths';

export function docPath(docId: string): string {
	return resolve('/[docId=docId]', { docId: encodeURIComponent(docId) });
}
