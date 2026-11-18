<script lang="ts">
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import CETEI from 'CETEIcean';
	import { behaviors, getTextPageBreaks, removeNotesFromMaintext } from '$lib/CETEIcean/behaviors';
	import { attachTextInteractions } from '$lib/functions/interactive_edendum/handleInteractiveText';
	import { SEARCH_PARAMS_DEFAULTS, type schema } from './schemas';
	import { onMount, tick } from 'svelte';
	import type { ProcessedTEI } from './processTEI';
	import type { ReturnUseSearchParams } from 'runed/kit';

	let containerMaintext: HTMLElement;
	let containerTEI: HTMLElement;
	let {
		textData,
		params,
		showThumbs = true,
		classes,
		openDrawer,
		initialPage = null
	}: {
		textData: ProcessedTEI;
		params: ReturnUseSearchParams<typeof schema>;
		showThumbs?: boolean;
		classes: string;
		openDrawer: () => void;
		initialPage?: number | null;
	} = $props();

	let serializedWithoutNotes = $derived(removeNotesFromMaintext(textData.serialized));

	onMount(() => {
		const page = initialPage;
		if (page === null) return;
		let cancelled = false;
		void (async () => {
			await tick();
			await document.fonts.ready;
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			if (cancelled) return;
			const pageBreak = getTextPageBreaks(containerTEI)[page - 1];
			pageBreak?.scrollIntoView({ block: 'start', behavior: 'instant' });
		})();
		return () => {
			cancelled = true;
		};
	});

	// ---------------------------------------------
	// Thumbnails
	type TThumb = {
		id: number;
		el: HTMLElement;
		facs: string;
		n: string;
		page: number;
		top: number;
	};

	let thumbs = $state([] as TThumb[]);
	let resizeObserver: ResizeObserver;
	let mutationObserver: MutationObserver;

	function collectPagebreaks(el: HTMLElement) {
		const nodes = getTextPageBreaks(el);

		if (nodes.length) {
			const newThumbs = nodes.map((el, i) => ({
				id: i,
				el: el,
				facs: textData.pages[i]?.facs ?? '',
				n: textData.pages[i]?.n ?? String(i + 1),
				page: i + 1,
				top: 0
			}));

			// prevent unnecessary state updates (breaks feedback loop)
			const same =
				newThumbs.length === thumbs.length && newThumbs.every((n, i) => n.el === thumbs[i]?.el);

			if (!same) {
				thumbs = newThumbs;
				updatePagebreakPositions();
			}
		}
	}

	function updatePagebreakPositions() {
		thumbs = thumbs.map((thumb) => {
			const rect = thumb.el.getBoundingClientRect();
			const containerRect = containerMaintext.getBoundingClientRect();

			return {
				...thumb,
				top: rect.top - containerRect.top + containerMaintext.scrollTop
			};
		});
	}

	// ---------------------------------------------
	// Attachments
	function setupFacsimile(el: HTMLElement) {
		$effect(() => {
			// initial collect
			collectPagebreaks(el);

			// reacts to layout / wrapping changes
			resizeObserver = new ResizeObserver(() => {
				updatePagebreakPositions();
			});
			resizeObserver.observe(el);

			// reacts to DOM/text changes
			let mutationTimeout: ReturnType<typeof setTimeout>;

			mutationObserver = new MutationObserver(() => {
				clearTimeout(mutationTimeout);
				mutationTimeout = setTimeout(() => {
					collectPagebreaks(el);
				}, 50);
			});

			mutationObserver.observe(el, {
				childList: true,
				subtree: true
			});

			// fallback for viewport changes
			window.addEventListener('resize', updatePagebreakPositions);

			// fonts can shift layout after load
			if (document.fonts) {
				document.fonts.addEventListener('loadingdone', updatePagebreakPositions);
			}

			// cleanup
			return () => {
				resizeObserver?.disconnect();
				mutationObserver?.disconnect();
				window.removeEventListener('resize', updatePagebreakPositions);

				if (document.fonts) {
					document.fonts.removeEventListener('loadingdone', updatePagebreakPositions);
				}
			};
		});
	}

	// ---------------------------------------------
	// Load text
	const c = new CETEI();

	const setupCustomElements = (element: HTMLElement) => {
		c.addBehaviors(behaviors(document));
		c.processPage();
		attachTextInteractions(element, openDrawer);
	};
</script>

<div data-textflow="fluid" class={classes} bind:this={containerMaintext}>
	<div
		class={[
			'w-full gap-4 p-10 pt-0 xl:grid xl:pl-1',
			showThumbs ? 'xl:grid-cols-[7vw_1fr]' : 'xl:grid-cols-1'
		]}
	>
		<!-- Thumbnail Column -->
		{#if showThumbs}
			<aside class="hidden h-full xl:block">
				{#each thumbs as thumb, i (thumb.id)}
					<!-- spacer -->
					<div style={`height: ${i === 0 ? '5' : thumb.top - thumbs[i - 1].top}px`}></div>

					<button
						class="sticky top-0 float-right ml-2 flex w-full translate-y-3 flex-col items-end justify-center gap-1 rounded bg-background p-[2px] xl:max-w-[80px] 2xl:max-w-[90px]"
						onclick={() => {
							if (params.mode === 'DF') {
								params.update({ page: thumb.page });
							} else {
								params.update({ mode: 'DF', flow: SEARCH_PARAMS_DEFAULTS.flow, page: thumb.page });
							}
						}}
					>
						<div class="w-full flex-col items-center justify-center">
							<IIIF_Thumb
								url={thumb.facs}
								classesContainer="rounded-xs border border-muted-foreground"
								classes="w-full"
								imgClasses="w-full"
							/>
							<span class="text-sm">Pag. {thumb.n}</span>
						</div>
					</button>
				{/each}
			</aside>
		{/if}

		<!-- Text Column -->
		<main
			bind:this={containerTEI}
			class="max-w-none"
			{@attach setupFacsimile}
			{@attach setupCustomElements}
		>
			{@html serializedWithoutNotes}
		</main>
	</div>
</div>
