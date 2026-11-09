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
		ceteiDataTranslation: ProcessedTEI;
		resolvedDoc: TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;
		classesContainer: string;
		params: any;
	} = $props();

	let showFac = $state(true);
	let showMain = $state(true);
	let showSecond = $state(true);
	let nColsFit = $state(4);
	let nColsVisible = $derived((showFac ? 1 : 0) + (showMain ? 1 : 0) + (showSecond ? 1 : 0));
	let isFluid = $state(false);
	let mode_main: string | null = $state('mode-lf');
	let mode_secondary: string | null = $state('mode-lf');

	let isFacsimileView = $derived(!showMain && !showSecond);

	let prioToFac = $state(true);

	let widthFacsimileLg = '1000px';
	let facsimileWidth = '50vw';

	$effect(() => {
		if (params.mode === 'LF') {
			isFluid = true;
			showFac = false;
			showMain = true;
			showSecond = false;
			mode_main = 'mode-lf';
			mode_secondary = null;
		} else if (params.mode === 'DF') {
			isFluid = false;
			showFac = true;
			showMain = true;
			showSecond = false;
			mode_main = 'mode-df';
			mode_secondary = null;
		} else if (params.mode === 'TRLF') {
			isFluid = true;
			showFac = false;
			showMain = true;
			showSecond = true;
			mode_main = 'mode-lf';
			mode_secondary = 'mode-lf';
		} else if (params.mode === 'FAC') {
			isFluid = true;
			showFac = true;
			showMain = false;
			showSecond = false;
			mode_main = null;
			mode_secondary = null;
		}
	});

	let urls = $derived(docItem?.manuscript?.iiif_urls ?? []);
	let url = $derived(urls[params.page - 1]);
	const TRANSITION_LENGTH = 100;
	const DELAY = 200;
	const isGallerySticky = false; //! temp

	// View Toggle
	type TabItem = { value: string; label: string };

	const tabItems = $derived.by<TabItem[]>(() => {
		const items: TabItem[] = [{ value: 'LF', label: 'Lettura scorrevole' }];
		if (resolvedDoc.docType !== 'published') {
			items.push({ value: 'DF', label: 'Vista diplomatica' });
		}
		if (ceteiDataTranslation) {
			items.push({ value: 'TRLF', label: 'Vista tradotta' });
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
				class="preset-tabs-list --lg grid"
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
		class={[
			'containerCenter',
			'sticky z-10 mx-10 h-max pb-[20vh] transition-all duration-300',
			isFluid ? 'bg-background' : 'bg-background'
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
			class:isFluid
			class:facsimile_view={!showMain && !showSecond}
			style:--facsimile-width={!showFac ? '0px' : isFacsimileView ? '100%' : facsimileWidth}
			style:--facsimile-width-lg={widthFacsimileLg}
			style:--df-visible={showMain ? '1' : '0'}
			style:--lf-visible={showSecond ? '1' : '0'}
			style:--duration={`${TRANSITION_LENGTH}ms`}
		>
			<!-- IIIF-Viewer -->
			<aside
				class="sticky block h-[96vh] w-full shrink flex-col gap-4 overflow-hidden rounded-xl px-5 transition-colors duration-300 hover:bg-muted-foreground/30"
				style="top: 2vh"
			>
				{#if showFac && urls.length}
					<IIIF_Viewer {url} />
				{/if}
			</aside>

			<!-- Snippet: Text for Main and Secondary -->
			{#snippet Text(
				textData: ProcessedTEI,
				showText: boolean,
				showThumbs: boolean,
				isFluid: boolean
			)}
				<div in:fade={{ delay: DELAY }} class="w-full">
					{#if showText}
						{#if isFluid}
							<TextFluid
								{textData}
								{params}
								{showThumbs}
								classes="mx-auto w-full max-w-300 md:max-w-[1300px]"
							/>
						{:else}
							<TextPaged {textData} page={params.page} />
						{/if}
					{/if}
				</div>
			{/snippet}

			<!-- Main Text -->
			<div class={['mx-10', isBreakpointBelow('lg') && 'h-[50vh]']}>
				<div class={[mode_main && mode_main]}>
					{@render Text(ceteiData, showMain, true, isFluid)}
				</div>
			</div>

			<!-- Secondary Text -->
			<div
				class={[
					params.mode !== 'TRLF' && 'hidden',
					'overflow-auto',
					'mx-10 ml-10 w-[calc(100%-10)] px-2 pr-5 pl-2',
					// showSecond && 'rounded-lg bg-mist-100 dark:bg-mist-800',
					showSecond && 'border-l-2 pl-12',
					'sticky',
					isFluid && isGallerySticky ? 'top-10' : 'top-5',
					isGallerySticky ? 'h-[80vh]' : 'h-screen',
					isBreakpointBelow('lg') && 'h-[50vh]'
				]}
			>
				<h3
					class="mb-5 w-max border border-amber-100 bg-amber-100 p-2 text-xs font-bold text-accent-foreground"
				>
					Traduzione editoriale
				</h3>
				<div class={[mode_secondary && mode_secondary]}>
					{@render Text(ceteiDataTranslation, showSecond, false, isFluid)}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Drawer -->
<DrawerRegNotes {ceteiData} {docItem} />

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
