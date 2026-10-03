<script lang="ts">
	import { activeRegisterTab } from '$lib/globals/ui-states.svelte';
	import IIIF_Viewer from './IIIF_Viewer.svelte';
	import TextPaged from './TextPaged.svelte';
	import type {
		TDocItemsPosthum,
		TDocItemsPublished,
		TDocItemsUnpublished
	} from '$lib/types/documents/TDocuments';
	import type { ProcessedTEI } from './processTEI';
	import { Tabs } from 'bits-ui';
	import Annotations from './Annotations.svelte';
	import Register from './Register.svelte';
	import type {
		TResolvedPosthum,
		TResolvedPublished,
		TResolvedUnpublished
	} from '$lib/functions/ease_of_use/resolveDoc';
	import Gallery from './Gallery.svelte';
	import { fade, fly } from 'svelte/transition';
	import TextFluid from './TextFluid.svelte';

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

	let showFac = $state(true);
	let showSide = $state(false);
	let showLF = $state(true);
	let showDF = $state(true);
	let isFluid = $state(false);
	let isAll = $derived(showFac && showDF && showLF && showSide);
	let isFacsimileView = $derived(!showDF && !showLF);

	let prioToFac = $state(true);

	let widthFacsimileLg = '600px';
	let widthFacsimileSm = '200px';
	let facsimileWidth = $derived(showSide ? widthFacsimileSm : widthFacsimileLg);
	let widthSidebar = $derived(showSide ? '600px' : '0px');

	$effect(() => {
		if (isFacsimileView) {
			showSide = false;
		}
	});
	let urls = $derived(docItem?.manuscript?.iiif_urls ?? []);
	let url = $derived(urls[params.page - 1]);
	const TRANSITION_LENGTH = 400;
	// const DELAY = TRANSITION_LENGTH;
	const DELAY = 200;
	const isGallerySticky = false; //! temp
</script>

<!-- Menu -->
<p>{url}</p>
<div class="fixed top-13 right-10 z-200 flex flex-col gap-2">
	<div class="flex justify-end gap-5 px-5 py-2.5">
		<button
			onclick={() => {
				isFluid = !isFluid;
			}}
			aria-label="show LF"
			class={[
				'  h-10 w-10 rounded-full border  p-2 text-black',
				isFluid ? 'bg-orange-200' : 'bg-orange-50'
			]}
		>
			F
		</button>
	</div>
	<div class="right-10 flex justify-end gap-5 px-5">
		<button
			onclick={() => {
				showDF = true;
				showLF = false;
			}}
			aria-label="show DF"
			class={[
				'h-10 w-max rounded-full border  p-2 px-4 text-black',
				showDF && !showLF ? 'bg-stone-200' : 'bg-stone-50'
			]}
		>
			[DF]
		</button>
		<button
			onclick={() => {
				showDF = true;
				showLF = true;
			}}
			aria-label="show DF"
			class={[
				'h-10 w-max rounded-full border  p-2 px-4 text-black',
				showDF && showLF ? 'bg-stone-200' : 'bg-stone-50'
			]}
		>
			DF+LF
		</button>
		<button
			onclick={() => {
				showDF = false;
				showLF = true;
			}}
			aria-label="show LF"
			class={[
				'h-10 w-max rounded-full border  p-2 px-4 text-black',
				showLF && !showDF ? 'bg-stone-200' : 'bg-stone-50'
			]}
		>
			[LF]
		</button>
	</div>
	<div class="right-10 flex justify-end gap-5 px-5">
		<button
			onclick={() => {
				prioToFac = !prioToFac;
			}}
			aria-label="shift"
			class={['h-10 w-max rounded-full border bg-white  p-2 px-4 text-black']}
		>
			{#if prioToFac}
				<i class="fa-solid fa-arrow-left"></i>
			{:else}
				<i class="fa-solid fa-arrow-right"></i>
			{/if}
		</button>
	</div>
	<div class="right-10 flex justify-end gap-5 px-5">
		<button
			onclick={() => {
				showFac = !showFac;
				prioToFac = showFac ? true : false;
			}}
			aria-label="show DF"
			class={[
				'  h-10 w-16 rounded-full border  p-2 text-black',
				showFac ? 'bg-yellow-200' : 'bg-yellow-50'
			]}
		>
			Fac
		</button>
		<button
			onclick={() => {
				showDF = !showDF;
			}}
			aria-label="show DF"
			class={[
				'  h-10 w-16 rounded-full border  p-2 text-black',
				showDF ? 'bg-green-200' : 'bg-green-50'
			]}
		>
			DF
		</button>

		<button
			onclick={() => {
				showLF = !showLF;
			}}
			aria-label="show LF"
			class={[
				'  h-10 w-16 rounded-full border  p-2 text-black',
				showLF ? 'bg-red-200' : 'bg-red-50'
			]}
		>
			LF
		</button>
		<button
			onclick={() => {
				showSide = !showSide;
				prioToFac = showSide ? false : true;
			}}
			aria-label="show sidebar"
			class={[
				'h-10 w-16 rounded-full border p-2 px-4 text-black',
				showSide ? 'bg-sky-200' : 'bg-sky-50'
			]}
		>
			Reg
		</button>
	</div>
</div>

<aside
	class={[
		'z-20 w-full overflow-hidden',
		isGallerySticky && 'sticky top-0',
		isFluid ? 'h-0' : '200px'
	]}
>
	{#if !isFluid}
		<div in:fade={{ delay: DELAY }}>
			<Gallery docItem={resolvedDoc.item} {params} />
		</div>
	{/if}
</aside>

<div
	data-fassung="COMBO"
	class={[
		'containerCenter',
		'sticky mx-10 h-max pb-[20vh] transition-all duration-300',
		isFluid ? 'bg-background' : 'bg-background'
	]}
	style:--left={isAll ? (prioToFac ? '10px' : `-${widthSidebar}`) : '0px'}
	style:--width={isAll ? `calc(100% + ${widthSidebar} - 40px)` : 'calc(100% - 40px)'}
>
	<!-- {#if isFacsimileView}
		<div
			in:fade={{ delay: DELAY }}
			class="w-[90vw]] mx-10 grid h-full grid-cols-1 grid-rows-[200px_1fr] gap-10 border-4 bg-sky-700 pt-10 *:border-2"
		>
			<aside class={['sticky top-0 z-20 col-span-4 overflow-hidden']}>
				{#if !isFluid}
					<div in:fade={{ delay: DELAY }}>
						<Gallery docItem={resolvedDoc.item} {params} />
					</div>
				{/if}
			</aside>
			<div class="h-[80vh] w-full bg-red-400">
				{#if !isFluid && urls.length}
					<IIIF_Viewer {url} />
				{/if}
			</div>
		</div>
	{:else} -->

	<div
		in:fade={{ delay: DELAY }}
		class={['layout grid pt-10']}
		class:isAll
		class:isFluid
		class:facsimile_view={!showDF && !showLF}
		style:--facsimile-width={!showFac ? '0px' : isFacsimileView ? '100%' : facsimileWidth}
		style:--facsimile-width-lg={widthFacsimileLg}
		style:--sidebar-width={showSide && !isFacsimileView ? widthSidebar : '0px'}
		style:--df-visible={showDF ? '1' : '0'}
		style:--lf-visible={showLF ? '1' : '0'}
		style:--duration={isFacsimileView ? '1000ms' : `${TRANSITION_LENGTH}ms`}
	>
		<aside
			class="sticky hidden h-[70vh] w-full shrink flex-col gap-4 overflow-hidden rounded-xl transition-colors duration-300 hover:bg-muted-foreground/30 xl:block"
			style={`top: 20vh`}
		>
			{#if showFac && urls.length}
				<IIIF_Viewer {url} />
			{/if}
		</aside>
		{#snippet Text()}
			<div in:fade={{ delay: DELAY }} class="m-5">
				{#if isFluid}
					<TextFluid {ceteiData} {params} classes="mx-auto w-full max-w-300 md:max-w-[1300px]" />
				{:else}
					<TextPaged {ceteiData} page={params.page} />
				{/if}
			</div>
		{/snippet}
		{#snippet LFDF(side: string)}
			{#if side === 'left'}
				{#if showDF}
					<div class="mode-df">
						{@render Text()}
					</div>
				{/if}
			{:else if side === 'right'}
				{#if showLF}
					<div class="mode-lf">
						{@render Text()}
					</div>
				{/if}
			{/if}
		{/snippet}

		<!-- Main Text -->
		<div
			class={[
				'overflow-auto'
				// sticky
				// 'mx-5 my-10 w-full rounded-xl border-2 p-4 px-2 pr-5 pl-2',
				// 'sticky',
				// isFluid && isGallerySticky ? 'top-10' : 'top-5',
				// isGallerySticky ? 'h-[80vh]' : 'h-[90vh]'
			]}
		>
			{@render LFDF('left')}
		</div>

		<!-- Secondary Text -->
		<div
			class={[
				'overflow-auto'
				// sticky
				// 'mx-5 my-10 w-full rounded-xl border-2 p-4 px-2 pr-5 pl-2',
				// 'sticky',
				// isFluid && isGallerySticky ? 'top-10' : 'top-5',
				// isGallerySticky ? 'h-[80vh]' : 'h-[90vh]'
			]}
		>
			{@render LFDF('right')}
		</div>
		<aside
			class={[
				'sticky flex-col gap-4 overflow-auto p-4 px-10 pt-6',
				isFluid && isGallerySticky ? 'top-10' : 'top-5',
				isGallerySticky ? 'h-[80vh]' : 'h-[90vh]'
			]}
		>
			{#if showSide}
				<div in:fade={{ delay: DELAY }} class="h-full">
					<Tabs.Root bind:value={activeRegisterTab.value} class="flex h-full flex-col">
						<Tabs.List class="preset-tabs-list --sm grid shrink-0 grid-cols-2">
							<Tabs.Trigger value="notes" class="preset-tabs-trigger --left"
								>Stellenkommentare</Tabs.Trigger
							>
							<Tabs.Trigger value="register" class="preset-tabs-trigger --right"
								>Register</Tabs.Trigger
							>
						</Tabs.List>

						<div class="relative min-h-0 flex-1">
							<Tabs.Content value="notes" class="absolute inset-0 overflow-y-auto p-4">
								<Annotations {ceteiData} />
							</Tabs.Content>

							<Tabs.Content value="register" class="absolute inset-0 ml-6 overflow-y-auto p-6">
								<Register {docItem} />
							</Tabs.Content>
						</div>
					</Tabs.Root>
				</div>
			{/if}
		</aside>
	</div>
	<!-- {/if} -->
</div>

<style>
	.containerCenter {
		width: var(--width);
		margin-left: var(--left);
	}
	.layout {
		/*
		 * The first and last tracks have fixed widths.
		 * The middle two tracks divide whatever space remains.
		 */

		/* transition: all 600ms ease; */
		transition: all var(--duration) ease;
		grid-template-columns:
			var(--facsimile-width)
			minmax(0, calc((100% - var(--facsimile-width) - var(--sidebar-width)) * var(--df-visible)))
			minmax(0, calc((100% - var(--facsimile-width) - var(--sidebar-width)) * var(--lf-visible)))
			var(--sidebar-width);

		&.isAll {
			display: absolute;
			grid-template-columns:
				var(--facsimile-width-lg)
				minmax(0, calc((100% - var(--facsimile-width) - var(--sidebar-width)) * var(--df-visible)))
				minmax(0, calc((100% - var(--facsimile-width) - var(--sidebar-width)) * var(--lf-visible)))
				var(--sidebar-width);
			/* background-color: aquamarine; */
		}
		/* &:not(.isFluid) {
			grid-template-rows: 200px 1fr;
		}

		&.isFluid {
			grid-template-rows: 0px 1fr;
		} */
	}
</style>
