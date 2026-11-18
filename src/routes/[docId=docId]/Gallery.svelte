<script lang="ts">
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import ThumbList from './ThumbList.svelte';
	import type { TEIPage } from '$lib/CETEIcean/behaviors';
	import type { ReturnUseSearchParams } from 'runed/kit';
	import type { schema } from './schemas';

	let {
		params,
		pages
	}: {
		params: ReturnUseSearchParams<typeof schema>;
		pages: TEIPage[];
	} = $props();
	let currentPage = $derived(params.page ?? 1);

	let itemsBefore = $derived(pages.slice(0, currentPage - 1));
	let itemsCurrent = $derived(pages[currentPage - 1]);
	let itemsAfter = $derived(pages.slice(currentPage));
</script>

{#snippet thumbItem(
	galleryItem: TEIPage,
	isFirst: boolean = false,
	isLast: boolean = false,
	isCurrent: boolean = false
)}
	<button
		type="button"
		aria-current={isCurrent ? 'page' : undefined}
		class={[
			'group flex min-w-20 flex-col items-center justify-between px-3 py-3 hover:bg-hover',
			isFirst && 'rounded-l-thumbbox',
			isLast && 'rounded-r-thumbbox'
		]}
		onclick={() => (params.page = galleryItem.page)}
	>
		<IIIF_Thumb
			url={galleryItem.facs}
			classesContainer=""
			classes={`min-h-2 h-max mx-2 my-1 flex justify-center items-center ${isCurrent ? 'max-h-35' : 'max-h-20'}`}
			imgClasses={`h-max border ${isCurrent ? 'max-h-30 max-w-30' : 'max-h-15 max-w-15'}`}
		/>
		<span class="mt-1 text-sm">{galleryItem.n || galleryItem.page}</span>
	</button>
{/snippet}

<div
	class="sticky top-0 z-20 flex w-full flex-col gap-5 overflow-x-auto bg-background px-0 py-5 transition-all duration-200"
>
	<div class="my-2 h-max">
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
					{@render thumbItem(galleryItem, index === 0, index === itemsBefore.length - 1)}
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
					{@render thumbItem(galleryItem, index === 0, index === itemsAfter.length - 1)}
				{/each}
			{/snippet}
		</ThumbList>
	</div>
</div>
