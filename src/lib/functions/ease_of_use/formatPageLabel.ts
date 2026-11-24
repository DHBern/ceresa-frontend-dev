export function formatPageLabel(
	n: string | null,
	page: number,
	showPagPrefix: boolean = false
): string {
	// return `${showPagPrefix ? 'Pag. ' : ''}${page} (${n?.trim() || '?'})`;
	return `${showPagPrefix ? 'Pag. ' : ''}${page}`;
}
