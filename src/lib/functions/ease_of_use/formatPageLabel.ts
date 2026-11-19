/**
 * Builds a page label such as "Pag. 3" or "Pag. 3 (5)".
 * The sequential page number is shown in parentheses when it differs from the printed number `n`.
 */
export function formatPageLabel(
	n: string | null,
	page: number,
	showPagPrefix: boolean = true
): string {
	let label = showPagPrefix ? `Pag. ` : ``;
	label += `${page}`;
	if (n && String(page) !== String(n)) label += `\n (${n})`;
	return label;
}
