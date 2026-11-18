<script lang="ts">
	import IIIF_Viewer from './IIIF_Viewer.svelte';
	import TextPaged from './TextPaged.svelte';
	import type {
		TDocItemsPosthum,
		TDocItemsPublished,
		TDocItemsUnpublished
	} from '$lib/types/documents/TDocuments';
	import type { ProcessedTEI } from './processTEI';
	import { Tabs } from 'bits-ui';
	import type {
		TResolvedPosthum,
		TResolvedPublished,
		TResolvedUnpublished
	} from '$lib/functions/ease_of_use/resolveDoc';
	import Gallery from './Gallery.svelte';
	import { fade } from 'svelte/transition';
	import TextFluid from './TextFluid.svelte';
	import DrawerRegNotes from './DrawerRegNotes.svelte';
	import { isBreakpointBelow } from '$lib/functions/ease_of_use/breakpoints.svelte';

	let {
		docItem,
		ceteiData,
		ceteiDataTranslation,
		resolvedDoc,
		classesContainer,
		params
	}: {
		docItem: TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished | null;
		ceteiData: ProcessedTEI;
		ceteiDataTranslation: ProcessedTEI | null;
		resolvedDoc: TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;
		classesContainer: string;
		params: any;
	} = $props();

	let view = $derived.by(() => {
		switch (params.mode) {
			case 'DF':
				return {
					isFluid: false,
					showFac: true,
					showMain: true,
					showSecond: false,
					showTranslationPanel: false,
					mainTextClass: 'mode-df'
				};
			case 'TRLF':
				return {
					isFluid: true,
					showFac: false,
					showMain: true,
					showSecond: ceteiDataTranslation !== null,
					showTranslationPanel: true,
					mainTextClass: 'mode-lf'
				};
			case 'FAC':
				return {
					isFluid: true,
					showFac: true,
					showMain: false,
					showSecond: false,
					showTranslationPanel: false,
					mainTextClass: null
				};
			case 'LF':
			default:
				return {
					isFluid: true,
					showFac: false,
					showMain: true,
					showSecond: false,
					showTranslationPanel: false,
					mainTextClass: 'mode-lf'
				};
		}
	});

	let nColsFit = $state(4);
	let nColsVisible = $derived(
		(view.showFac ? 1 : 0) + (view.showMain ? 1 : 0) + (view.showSecond ? 1 : 0)
	);
	let drawerOpen = $state(false);

	function openDrawer() {
		drawerOpen = true;
	}

	let isFacsimileView = $derived(!view.showMain && !view.showSecond);

	let prioToFac = $state(true);

	let widthFacsimileLg = '1000px';
	let facsimileWidth = '50vw';

	let urls = $derived(docItem?.iiif.urls_IIIF_images ?? []);
	let url = $derived(urls[params.page - 1]);
	const TRANSITION_LENGTH = 100;
	const DELAY = 200;
	const isGallerySticky = false; //! temp

	// View Toggle
	type TabItem = { value: string; label: string };

	const tabItems = $derived.by<TabItem[]>(() => {
		const items: TabItem[] = [{ value: 'LF', label: 'Modalità di lettura' }];
		if (resolvedDoc.docType !== 'published') {
			items.push({ value: 'DF', label: 'Trascrizione diplomatica' });
		}
		if (ceteiDataTranslation) {
			items.push({ value: 'TRLF', label: 'Traduzione' });
		}
		return items;
	});

	function positionClass(index: number, total: number): string {
		if (total < 2) return '--single';
		if (index === 0) return '--left';
		if (index === total - 1) return '--right';
		return '--center';
	}
</script>

<div class={classesContainer}>
	<!-- Toggle -->
	<div class="relative flex h-full w-full flex-col items-center gap-6">
		<Tabs.Root class="sticky top-10 z-900 max-w-260 xl:static" bind:value={params.mode}>
			<Tabs.List
				class="preset-tabs-list --lg grid text-sm"
				style={`grid-template-columns: repeat(${tabItems.length}, minmax(0, 1fr))`}
			>
				{#each tabItems as tab, i (tab.value)}
					<Tabs.Trigger
						value={tab.value}
						class={`preset-tabs-trigger ${positionClass(i, tabItems.length)}`}
					>
						{tab.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	</div>

	<!-- Gallery -->
	<aside
		class={[
			'z-20 w-full overflow-hidden',
			isGallerySticky && 'sticky top-0',
			view.isFluid ? 'h-0' : '200px'
		]}
	>
		{#if !view.isFluid}
			<div in:fade={{ delay: DELAY }}>
				<Gallery docItem={resolvedDoc.item} {params} />
			</div>
		{/if}
	</aside>

	<div
		class={[
			'containerCenter',
			'sticky z-10 mx-10 h-max pb-[20vh] transition-all duration-300',
			'bg-background'
		]}
		style:--left={nColsVisible >= nColsFit ? (prioToFac ? '10px' : `-1`) : '0px'}
		style:--width={'calc(100% - 40px)'}
	>
		<!-- Content -->
		<div
			in:fade={{ delay: DELAY }}
			class={['layout grid pt-10']}
			class:isAll={nColsVisible >= nColsFit}
			//! Could be deleted
			class:isSmall={isBreakpointBelow('lg')}
			class:isFluid={view.isFluid}
			class:facsimile_view={isFacsimileView}
			style:--facsimile-width={!view.showFac ? '0px' : isFacsimileView ? '100%' : facsimileWidth}
			style:--facsimile-width-lg={widthFacsimileLg}
			style:--df-visible={view.showMain ? '1' : '0'}
			style:--lf-visible={view.showSecond ? '1' : '0'}
			style:--duration={`${TRANSITION_LENGTH}ms`}
		>
			<!-- IIIF-Viewer -->
			<aside
				class="sticky block h-[96vh] w-full shrink flex-col gap-4 overflow-hidden rounded-xl px-5 transition-colors duration-300 hover:bg-muted-foreground/30"
				style="top: 2vh"
			>
				{#if view.showFac && urls.length}
					<IIIF_Viewer {url} />
				{/if}
			</aside>

			<!-- Snippet: Text for Main and Secondary -->
			{#snippet Text(
				textData: ProcessedTEI | null,
				showText: boolean,
				showThumbs: boolean,
				isFluid: boolean
			)}
				<div in:fade={{ delay: DELAY }} class="w-full">
					{#if showText && textData}
						{#if isFluid}
							<TextFluid
								{textData}
								{params}
								{showThumbs}
								{openDrawer}
								classes="mx-auto w-full max-w-300 md:max-w-[1300px]"
							/>
						{:else}
							<TextPaged {textData} page={params.page} {openDrawer} />
						{/if}
					{/if}
				</div>
			{/snippet}

			<!-- Main Text -->
			<div class={['mx-10', isBreakpointBelow('lg') && 'h-[50vh]']}>
				<div class={[view.mainTextClass]}>
					{@render Text(ceteiData, view.showMain, true, view.isFluid)}
				</div>
			</div>

			<!-- Secondary Text -->
			<div
				class={[
					!view.showTranslationPanel && 'hidden',
					'overflow-auto',
					'mx-10 ml-10 w-[calc(100%-10)] px-2 pr-5 pl-2',
					// view.showSecond && 'rounded-lg bg-mist-100 dark:bg-mist-800',
					view.showSecond && 'border-l-2 pl-12',
					'sticky',
					view.isFluid && isGallerySticky ? 'top-10' : 'top-5',
					isGallerySticky ? 'h-[80vh]' : 'h-screen',
					isBreakpointBelow('lg') && 'h-[50vh]'
				]}
			>
				<h3
					class="mb-5 w-max border border-amber-100 bg-amber-100 p-2 text-xs font-bold text-accent-foreground"
				>
					Traduzione editoriale
				</h3>
				<div class="mode-lf">
					{@render Text(ceteiDataTranslation, view.showSecond, false, view.isFluid)}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Drawer -->
<DrawerRegNotes {ceteiData} {docItem} bind:open={drawerOpen} />

<style>
	.containerCenter {
		width: var(--width);
		margin-left: var(--left);
	}
	.layout {
		/*
		 * The first track has fixed width.
		 * The middle two tracks divide whatever space remains.
		 */

		transition: all var(--duration) ease;
		grid-template-columns:
			var(--facsimile-width)
			minmax(0, calc((100% - var(--facsimile-width)) * var(--df-visible)))
			minmax(0, calc((100% - var(--facsimile-width)) * var(--lf-visible)));
		&.isSmall {
			grid-template-columns:
				var(--facsimile-width)
				minmax(0, calc((100% - var(--facsimile-width))));
			grid-template-rows: 1fr 1fr;
		}
		/* &:not(.isFluid) {
			grid-template-rows: 200px 1fr;
		}

		&.isFluid {
			grid-template-rows: 0px 1fr;
		} */
	}
</style>
