import { FALLBACK_IIIF_PATH } from '../../globals/constants.svelte.ts';

export function resolveIIIFUrl(value: string | null | undefined): string | null {
	if (!value) return null;
	if (/^https?:\/\//i.test(value)) return value;

	const filename = /\.tif$/i.test(value) ? value : `${value}.tif`;
	return `${FALLBACK_IIIF_PATH}${encodeURIComponent(filename)}`;
}
