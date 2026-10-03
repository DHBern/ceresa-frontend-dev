<script lang="ts">
	import IIIF_Viewer from './IIIF_Viewer.svelte';
	import TextPaged from './TextPaged.svelte';
	import type {
		TDocItemsPosthum,
		TDocItemsPublished,
		TDocItemsUnpublished
	} from '$lib/types/documents/TDocuments';
	import type { ProcessedTEI } from './processTEI';
	import Gallery from './Gallery.svelte';
	import type {
		TResolvedPosthum,
		TResolvedPublished,
		TResolvedUnpublished
	} from '$lib/functions/ease_of_use/resolveDoc';

	let {
		docItem,
		ceteiData,
		params,
		resolvedDoc
	}: {
		docItem: TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished | null;
		ceteiData: ProcessedTEI;
		params: any;
		resolvedDoc: TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;
	} = $props();

	let urls = $derived(docItem?.manuscript?.iiif_urls ?? []);
	let url = $derived(urls[params.page - 1]);
</script>

<Gallery docItem={resolvedDoc.item} {params} />

<div
	data-fassung="DF"
	class="mode-df mx-10 gap-10 pt-10 xl:grid xl:grid-cols-[25vw_auto] 2xl:grid-cols-[25vw_auto]"
>
	<aside class="sticky top-0 hidden h-screen w-full flex-col gap-4 overflow-hidden pt-6 xl:block">
		{#if urls.length}
			<IIIF_Viewer {url} />
		{/if}
	</aside>
	<TextPaged {ceteiData} page={params.page} />
</div>
