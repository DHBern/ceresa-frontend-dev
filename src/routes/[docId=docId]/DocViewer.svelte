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
	import { fade } from 'svelte/transition';
	import TextFluid from './TextFluid.svelte';

	let {
		docItem,
		ceteiData,
		resolvedDoc,
		classesContainer,
		params
	}: {
		docItem: TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished | null;
		ceteiData: ProcessedTEI;
		resolvedDoc: TResolvedPosthum | TResolvedUnpublished | TResolvedPublished;
		classesContainer: string;
		params: any;
	} = $props();

	$effect(() => {
		if (params.mode === 'LF') {
			isFluid = true;
			showFac = false;
			showMain = true;
			showSecond = false;
			LFleads = true;
		} else if (params.mode === 'LF2') {
			isFluid = false;
			showFac = true;
			showMain = true;
			showSecond = false;
			LFleads = true;
		} else if (params.mode === 'DF') {
			isFluid = false;
			showFac = true;
			showMain = true;
			showSecond = false;
			LFleads = false;
		}
	});

	let showFac = $state(true);
	let showSide = $state(false);
	let showMain = $state(true);
	let showSecond = $state(true);
	let nColsFit = $state(4);
	let nColsVisible = $derived(
		(showFac ? 1 : 0) + (showSide ? 1 : 0) + (showMain ? 1 : 0) + (showSecond ? 1 : 0)
	);
	let isFluid = $state(false);
	let LFleads = $state(true);

	let isAll = $derived(showFac && showMain && showSecond && showSide);
	let isFacsimileView = $derived(!showMain && !showSecond);

	let prioToFac = $state(true);

	let widthFacsimileLg = '600px';
	let widthFacsimileSm = '300px';
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

<div class={classesContainer}>
	<!-- Toggle -->
	<div class="relative flex h-full w-full flex-col items-center gap-6">
		<Tabs.Root class="sticky top-10 z-900 max-w-260 xl:static" bind:value={params.mode}>
			<Tabs.List class="preset-tabs-list --lg grid grid-cols-2">
				<Tabs.Trigger value="LF" class="preset-tabs-trigger --left">Fluid Reading View</Tabs.Trigger
				>
				<Tabs.Trigger
					value="DF"
					class=" preset-tabs-trigger --right"
					onclick={() => {
						isFluid = false;
						showFac = true;
						showMain = true;
						showSecond = false;
						LFleads = false;
					}}>Diplomatic View</Tabs.Trigger
				>
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
		style:--left={nColsVisible >= nColsFit
			? prioToFac
				? '10px'
				: `calc(-1 * (${widthSidebar} - 0vw))`
			: '0px'}
		style:--width={nColsVisible >= nColsFit
			? `calc(100% + ${widthSidebar} - 40px)`
			: 'calc(100% - 40px)'}
	>
		<!-- Content -->
		<div
			in:fade={{ delay: DELAY }}
			class={['layout grid pt-10']}
			class:isAll={nColsVisible >= nColsFit}
			class:isFluid
			class:facsimile_view={!showMain && !showSecond}
			style:--facsimile-width={!showFac ? '0px' : isFacsimileView ? '100%' : facsimileWidth}
			style:--facsimile-width-lg={widthFacsimileLg}
			style:--sidebar-width={showSide && !isFacsimileView ? widthSidebar : '0px'}
			style:--df-visible={showMain ? '1' : '0'}
			style:--lf-visible={showSecond ? '1' : '0'}
			style:--duration={isFacsimileView ? '1000ms' : `${TRANSITION_LENGTH}ms`}
		>
			<!-- IIIF-Viewer -->
			<aside
				class="sticky block h-[70vh] w-full shrink flex-col gap-4 overflow-hidden rounded-xl px-5 transition-colors duration-300 hover:bg-muted-foreground/30"
				style={`top: 20vh`}
			>
				{#if showFac && urls.length}
					<IIIF_Viewer {url} />
				{/if}
			</aside>

			<!-- Texts-Snippet -->
			{#snippet Text(showText: boolean, showThumbs: boolean, isFluid: boolean)}
				<div in:fade={{ delay: DELAY }} class="w-full">
					{#if showText}
						{#if isFluid}
							<TextFluid
								{ceteiData}
								{params}
								{showThumbs}
								classes="mx-auto w-full max-w-300 md:max-w-[1300px]"
							/>
						{:else}
							<TextPaged {ceteiData} page={params.page} />
						{/if}
					{/if}
				</div>
			{/snippet}

			<!-- Main Text -->
			<div class="mx-10">
				<div class={[LFleads ? 'mode-lf' : 'mode-df']}>
					{@render Text(true, true, isFluid)}
				</div>
			</div>

			<!-- Secondary Text -->
			<div
				class={[
					'overflow-auto',
					'mx-10 my-10 ml-10 w-[calc(100%-10)] p-4 px-2 pr-5 pl-2',
					showSecond && 'rounded-lg bg-mist-100 dark:bg-mist-800',
					'sticky',
					isFluid && isGallerySticky ? 'top-10' : 'top-5',
					isGallerySticky ? 'h-[80vh]' : 'h-[90vh]'
				]}
			>
				<div class={[LFleads ? 'mode-df' : 'mode-lf']}>
					{@render Text(showSecond, false, isFluid)}
				</div>
			</div>

			<!-- Sidebar Toggle -->
			<button
				class={[
					'sticky top-0 right-0 h-max w-max bg-foreground p-2 px-4 text-lg text-foreground-contrast'
				]}
				onclick={() => {
					showSide = !showSide;
					prioToFac = showSide ? false : true;
				}}
				aria-label="toggle sidebar"
			>
				{showSide ? 'Hide Register' : 'Show Register'}
			</button>

			<!-- Sidebar -->
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
	</div>
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
