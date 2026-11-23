export function formatPageLabel(
	n: string | null,
	page: number,
	showPagPrefix: boolean = true
): string {
	// return `${showPagPrefix ? 'Pag. ' : ''}${page} (${n?.trim() || '?'})`;
	return `${showPagPrefix ? 'Pag. ' : ''}${page}`;
}
