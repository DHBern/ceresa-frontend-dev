<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import { resolveDoc } from '$lib/functions/ease_of_use/resolveDoc';
	import { documents as allDocsRaw } from '$lib/data/documents.json';
	import type {
		TDocuments,
		TDocItemsPosthum,
		TDocItemsUnpublished,
		TDocItemsPublished
	} from '$lib/types/documents/TDocuments';
	import ThumbList from './ThumbList.svelte';
	import type { TEIPage } from '$lib/CETEIcean/behaviors';
	import type { ReturnUseSearchParams } from 'runed/kit';
	import type { schema } from './schemas';

	const allDocs = allDocsRaw as TDocuments['documents'];

	let buttonRefs: HTMLButtonElement[] = [];
	let containerRef: HTMLDivElement;

	type TGalleryItem = {
		pagenum_running: number;
		fac: string;
		page: number;
		label: string;
	};

	let {
		docItem,
		params,
		pages = []
	}: {
		docItem: TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished | null;
		params: ReturnUseSearchParams<typeof schema>;
		pages?: TEIPage[];
	} = $props();
	let currentPage = $derived(params.page ?? 1);

	// Gallery Items
	function collectGalleryItems() {
		const galleryItems: TGalleryItem[] =
			docItem?.iiif.urls_IIIF_images?.map((el: string, idx: number) => {
				const metadata =
					pages.find((item) => item.facs === el.replace(/\/info\.json$/, '')) ??
					(!pages[idx]?.facs ? pages[idx] : undefined);
				return {
					pagenum_running: idx + 1,
					fac: el,
					page: idx + 1,
					label: metadata?.n ?? String(idx + 1)
				};
			}) || [];
		return galleryItems;
	}

	// Scroll Gallery
	function scrollGalleryToPage(currentPage: number) {
		const btn = buttonRefs[currentPage - 1];
		if (btn && containerRef) {
			const btnLeft = btn.offsetLeft;
			const btnWidth = btn.offsetWidth;
			const containerWidth = containerRef.offsetWidth;

			// Center button in the container
			const scrollPos = btnLeft - (containerWidth - btnWidth) / 2;
			containerRef.scrollTo({ left: scrollPos, behavior: 'smooth' });
		}
	}

	function handleSelectPage(newPage: number) {
		params.page = newPage;
	}

	$effect(() => {
		scrollGalleryToPage(currentPage);
	});

	let itemsBefore = $derived(collectGalleryItems()?.slice(0, currentPage - 1));
	let itemsCurrent = $derived(collectGalleryItems()[currentPage - 1]);
	let itemsAfter = $derived(collectGalleryItems()?.slice(currentPage));
</script>

{#snippet thumbItem(
	galleryItem: TGalleryItem,
	isFirst: boolean = false,
	isLast: boolean = false,
	isCurrent: boolean = false
)}
	<button
		class={[
			`group flex flex-col items-center justify-between px-3 py-3 hover:bg-hover`,
			isFirst && 'rounded-l-thumbbox',
			isLast && 'rounded-r-thumbbox'
			// isCurrent ? 'mx-10' : 'mx-2'
		]}
		onclick={(e) => {
			e.preventDefault();
			handleSelectPage(galleryItem.pagenum_running);
		}}
	>
		<IIIF_Thumb
			url={galleryItem.fac}
			classesContainer=""
			classes={`min-h-2 h-max mx-2 my-1 flex justify-center items-center ${isCurrent ? 'max-h-35' : 'max-h-20'}`}
			imgClasses={`h-max border ${isCurrent ? 'max-h-30 max-w-30' : 'max-h-15 max-w-15'}`}
		/>
		<span class="mt-1 text-sm">{galleryItem.label}</span>
	</button>
{/snippet}

<div
	class="sticky top-0 z-20 flex w-full flex-col gap-5 overflow-x-auto bg-background px-0 py-5 transition-all duration-200"
>
	<div bind:this={containerRef} class="my-2 h-max">
		<ThumbList
			reCenterOn={params.page}
			classesContainer="items-center"
			classesBefore="my-2 h-max"
			classesAfter="my-2 h-max"
			classesCurrent="min-w-25 mx-10 pointer-events-none grayscale-0!"
			doInvertScroll={false}
			isBeforeEmpty={itemsBefore.length === 0}
			isAfterEmpty={itemsAfter.length === 0}
		>
			{#snippet childrenBefore()}
				{#each itemsBefore as galleryItem, index (galleryItem.page)}
					{#if galleryItem}
						{@render thumbItem(galleryItem, index === 0, index === itemsBefore.length - 1, false)}
					{:else}<p class="text-warning">MISSING DATA</p>
					{/if}
				{/each}
			{/snippet}
			{#snippet childrenCurrent()}
				{#if itemsCurrent}
					{@render thumbItem(itemsCurrent, true, true, true)}
				{:else}<p class="text-warning">MISSING DATA</p>
				{/if}
			{/snippet}
			{#snippet childrenAfter()}
				{#each itemsAfter as galleryItem, index (galleryItem.page)}
					{#if galleryItem}
						{@render thumbItem(galleryItem, index === 0, index === itemsAfter.length - 1, false)}
					{:else}<p class="text-warning">MISSING DATA</p>
					{/if}
				{/each}
			{/snippet}
		</ThumbList>
	</div>
</div>
