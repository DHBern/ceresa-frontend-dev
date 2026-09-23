<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	import { filterAndGroupData } from '$lib/functions/ease_of_use/filterAndGroupData.js';
	import { normalizeChars } from '$lib/functions/ease_of_use/normalizeChars';
	import { registerSortBy, registerGroupItems } from '$lib/globals/ui-states.svelte';
	import { TYPESWITHGROUPCONTROL, TYPESWITHSORTCONTROL } from '$lib/globals/constants.svelte';
	import type {
		TRegDict,
		TRegGroupsMap,
		TRegKeysFlat,
		TRegTypes
	} from '$lib/types/register/TRegister';
	import { onMount, tick, untrack } from 'svelte';

	import { useSearchParams } from 'runed/kit';
	import { getSchemaForRegType } from './schemas.js';

	import { isMobile } from '$lib/globals/ui-states.svelte';
	import DropdownRegFilters from './DropdownRegFilters.svelte';
	import DropdownRegSorting from './DropdownRegSorting.svelte';
	import type { TPartialRegEntry } from './[regSlug=regItem]/+page.server.js';

	type TProps = {
		hasScrolledDeep?: boolean;
		isRegListView: boolean;
		regListEntries: Partial<Record<TRegKeysFlat, TPartialRegEntry>>;
		regDict: TRegDict['dict_register'][TRegTypes];
		regType: TRegTypes;
		regKey?: TRegKeysFlat | null;
	};

	let {
		hasScrolledDeep = false,
		isRegListView,
		regListEntries,
		regDict,
		regType,
		regKey = null
	}: TProps = $props();

	// Booleans for sorting and grouping
	let hasGroupControls = $derived(TYPESWITHGROUPCONTROL['register'].includes(regType));
	let hasSortControls = $derived(TYPESWITHSORTCONTROL['register'].includes(regType));

	// Defaults
	let defaultSortBy = $derived(regType === 'people' ? 'lastname' : 'name'); // must also set 'name' in ui.svelte.ts (//! Fix this)
	let sortBy = $derived(hasSortControls ? registerSortBy.value : defaultSortBy); // The actual sortBy state, which includes a fallback for regTypes without sorting options.
	$effect(() => {
		registerSortBy.value = registerSortBy.value ? registerSortBy.value : defaultSortBy; // If empty set to default
	});

	let allGroupKeys = $derived(
		//! IMPROVE: the order inside the unordered object array may actually break.
		Object.keys(regDict.groups) as TRegGroupsMap[TRegTypes][]
	);

	// Schema (updates with regType)
	let { schema } = $derived(getSchemaForRegType(regType));
	const params = $derived(useSearchParams(schema, { pushHistory: true, noScroll: true }));

	// Filters
	let selectedFilter = $derived(params.filter ?? '');
	let filteredAndGroupedData = $derived(
		filterAndGroupData(regListEntries, sortBy, {
			filterKey: 'type',
			filtersIn: params.filter ? [params.filter] : []
		})
	);

	// Reset params when filtereSelected === ''
	$effect(() => {
		const prevFilter = untrack(() => params.filter);
		if (selectedFilter === prevFilter) return;
		if (selectedFilter) {
			params.filter = selectedFilter;
		} else {
			params.reset();
		}
	});

	// Track the current number of columns based on viewport width
	let nCols = $state(1);

	// Calculate and update scroll-margin-top of anchors relative to height of sticky controls
	let elControlsOuter: HTMLElement | null = $state(null);
	const updateHeaderHeight = () => {
		if (elControlsOuter) {
			document.body.style.setProperty('--header-height', `${elControlsOuter.offsetHeight}px`);
		}
	};

	onMount(() => {
		// Responsive Headerheight for scroll-margin-top
		updateHeaderHeight();
		window.addEventListener('resize', updateHeaderHeight);

		// Sync nCols with Tailwind breakpoints
		const updateCols = () => {
			const w = window.innerWidth;
			if (w >= 1920)
				nCols = 5; // 3xl
			else if (w >= 1536)
				nCols = 4; // 2xl
			else if (w >= 1024)
				nCols = 3; // lg
			else if (w >= 768)
				nCols = 2; // md
			else nCols = 1; // sm and below
		};
		updateCols();
		window.addEventListener('resize', updateCols);

		// Cleanup
		return () => {
			window.removeEventListener('resize', updateCols);
			window.removeEventListener('resize', updateHeaderHeight);
		};
	});

	// Calculate how many rows are needed to fit all items in N columns
	let groupStylesFlat = $derived.by(() => {
		if (isRegListView) {
			const nItems = filteredAndGroupedData.flat().length;
			const minCols = Math.min(nCols, nItems);
			console.log(minCols, nCols, nItems);
			const rows = Math.max(minCols, Math.ceil(nItems / nCols));
			return `
			grid-template-rows: repeat(${rows}, 1fr);
			grid-template-columns: repeat(${nCols}, 1fr);
			grid-auto-flow: column;
			`;
		} else {
			return 'grid-template-columns: 1fr;';
		}
	});

	// Calculate how many rows are needed to fit all items of each group in N columns
	let groupStyles = $derived.by(() => {
		return filteredAndGroupedData.map((block) => {
			if (isRegListView) {
				const nItems = block.length;
				const minCols = Math.min(nCols, nItems);
				const rows = Math.max(minCols, Math.ceil(nItems / nCols));
				return `
				grid-template-rows: repeat(${rows}, 1fr);
				grid-template-columns: repeat(${nCols}, 1fr);
				grid-auto-flow: column;
				`;
			} else {
				return 'grid-template-columns: 1fr;';
			}
		});
	});

	// GroupLabels (i.e. A/B/C or dates)
	let groupLabels = $derived(
		[
			...new Set(
				Object.values(filteredAndGroupedData).map((el) => {
					if (registerSortBy.value === 'name') {
						return normalizeChars(el[0][1]['name']?.[0].toUpperCase()) || '';
					} else if (registerSortBy.value === 'date') {
						return el[0][1]['date']?.[0] || '';
					} else {
						return '';
					}
				})
			)
		].sort()
	);

	// Scroll to the specific item
	let elScrollContainer: HTMLElement | undefined = $state();

	function scrollToItem(regKey: TRegKeysFlat) {
		const targetElement = document.getElementById(regKey);
		const offsetSortControls =
			hasGroupControls && hasSortControls ? 100 : hasGroupControls || hasSortControls ? 80 : 0;
		if (targetElement) {
			elScrollContainer?.scrollTo({
				top: targetElement.offsetTop - elScrollContainer.offsetTop - offsetSortControls,
				behavior: 'smooth'
			});
		}
	}

	$effect(() => {
		if (regKey) scrollToItem(regKey);
	});
</script>

<!-- Snippet for Sorting Controls -->
{#snippet sortControls()}
	<DropdownRegSorting
		bind:registerSortBy={registerSortBy.value}
		bind:registerGroupItems={registerGroupItems.value}
		contentProps={{
			class:
				'min-w-[var(--bits-dropdown-menu-anchor-width)] text-sm border bg-background max-h-[60vh] overflow-y-auto'
		}}
	/>
{/snippet}

<!-- Outer Controls -->
{#if isRegListView}
	<div
		bind:this={elControlsOuter}
		class="sticky top-0 flex w-full flex-col flex-wrap items-start justify-start gap-x-10 gap-y-7 bg-background py-7 text-sm"
	>
		{#if (regDict && hasGroupControls) || hasSortControls}
			<div class="flex flex-wrap gap-2">
				<!-- Filters -->
				{#if regDict && hasGroupControls}
					{#if isMobile.value || hasScrolledDeep}
						<DropdownRegFilters
							{regDict}
							bind:selectedFilter
							items={allGroupKeys}
							contentProps={{
								class:
									'min-w-[var(--bits-dropdown-menu-anchor-width)] text-sm text-sm border bg-background max-h-[60vh] overflow-y-auto'
							}}
						/>
					{:else}
						<div class={['grid w-full grid-cols-[auto_1fr] items-start gap-2']}>
							<!-- <p class={['col-start-1 w-40 shrink-0 pt-1.25 text-sm font-bold']}>Filtern:</p> -->
							<div class="col-start-2 flex w-full flex-wrap justify-start gap-2">
								<button
									onclick={() => {
										params.reset();
										selectedFilter = '';
										tick();
										window.scrollTo({ top: 0, behavior: 'auto' });
									}}
									class={['preset-btn-round --sm mr-0', !selectedFilter && '--active']}
									><p>Alle Kategorien</p></button
								>
								{#each allGroupKeys as groupKey (groupKey)}
									<!-- //! Fix this any type -->
									{@const groupLabel = (regDict.groups as any)[groupKey]?.label_plural}
									<button
										onclick={() => {
											params.filter = groupKey;
											selectedFilter = groupKey;
											tick();
											window.scrollTo({ top: 0, behavior: 'auto' });
										}}
										class={['preset-btn-round --sm', groupKey === selectedFilter && '--active']}
										><p>{groupLabel}</p></button
									>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
				<!-- Sort Controls -->
				<div class="flex gap-5">
					{#if hasSortControls}
						{#if !isMobile.value && !hasScrolledDeep}
							<div class={['grid w-full grid-cols-[auto_1fr] items-start gap-2']}>
								<!-- <p class={['col-start-1 w-40 shrink-0 pt-1.25 text-sm font-bold']}>Gruppieren:</p> -->
								<div class="col-start-2 flex w-full flex-wrap justify-start gap-2">
									{@render sortControls()}
								</div>
							</div>
						{:else}
							{@render sortControls()}
						{/if}
					{/if}
				</div>
			</div>
		{/if}
		<!-- Alphabet -->
		{#if registerGroupItems.value && !isMobile.value}
			<div class="flex w-full flex-wrap items-center justify-start gap-2 text-base">
				{#each groupLabels as letter (letter)}
					{#if letter}
						<button
							onclick={() => {
								goto(`#${letter}`, { replaceState: true });
								tick();
								window.scrollTo({ top: 0, behavior: 'auto' });
							}}
							class="center flex w-8 items-center justify-center hover:font-bold"
							><p>{letter}</p></button
						>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Scroll Container -->
<div
	bind:this={elScrollContainer}
	class={[
		'flex h-full flex-col overflow-y-auto',
		isRegListView ? 'w-full' : 'mt-30 mb-10 ml-10 w-full'
	]}
>
	<!-- Controls (when inside scroll container) -->
	{#if !isRegListView}
		<div
			class={[
				'sticky top-0 flex w-full flex-col items-start justify-center gap-x-4 gap-y-2 bg-background py-4 pr-2 text-sm'
			]}
		>
			{#if hasSortControls}
				{@render sortControls()}
			{/if}
			<div class="flex w-full items-center justify-between gap-4">
				<!-- <p><strong>Filter:</strong></p> -->
				<DropdownRegFilters
					{regDict}
					bind:selectedFilter
					items={allGroupKeys}
					contentProps={{
						class:
							'min-w-[var(--bits-dropdown-menu-anchor-width)] text-sm border bg-background max-h-[60vh] overflow-y-auto'
					}}
				/>
			</div>
		</div>
	{/if}

	<!-- Items -->
	{#if registerGroupItems.value}
		{#each filteredAndGroupedData as block, blockIdx (block)}
			{@const firstItem = block[0]?.[1]}
			{@const autoCatLabel =
				hasSortControls && sortBy === 'date'
					? firstItem?.date?.from?.slice(0, 4)
					: normalizeChars(firstItem?.[sortBy]?.[0]?.toUpperCase())}

			{#if autoCatLabel}
				<!-- Header -->
				<button
					onclick={async () => {
						if (isRegListView) {
							await goto(`#${autoCatLabel}`, {
								replaceState: true,
								noScroll: true,
								keepFocus: true
							});
							window.scrollTo({ top: 0, behavior: 'instant' });
						}
					}}
					aria-label="store in URL"
					id={autoCatLabel}
					class={[
						'group align-left mt-10 block min-h-25 border-b text-left font-serif text-5xl font-bold',
						!isRegListView && 'pointer-events-none'
					]}
					style="scroll-margin-top: var(--header-height, 0)"
				>
					<p class="inline-block h-full">
						{autoCatLabel}
						{#if isRegListView}
							<span class="hidden group-hover:inline-block">
								<i class="fa-solid fa-link mx-2 text-xl"></i>
							</span>
						{/if}
					</p>
				</button>

				<!-- Block with Items -->
				<div class={['grid gap-y-2', isRegListView && 'gap-x-10']} style={groupStyles[blockIdx]}>
					{#each block as [key, item] (key)}
						<a
							data-sveltekit-preload-data="tap"
							data-sveltekit-preload-code="hover"
							id={key}
							class={[
								'block w-full px-2 py-2 hover:bg-dark-10',
								!isRegListView && key === regKey && 'bg-dark-10 font-bold text-background-contrast'
							]}
							href={selectedFilter
								? resolve(`/register/${key}?filter=${encodeURIComponent(selectedFilter)}`)
								: resolve(`/register/${key}`)}
						>
							<span class="overflow-hidden whitespace-normal">
								{item.name}
							</span>
						</a>
					{/each}
				</div>
			{/if}
		{/each}
	{:else}
		<!-- Title -->
		<div
			class={[
				'group align-left mt-10 block h-full min-h-25 border-b text-left font-serif text-5xl font-bold',
				!isRegListView && 'pointer-events-none'
			]}
		>
			<p class="inline-block">Alle Treffer</p>
		</div>
		<!-- Flattened Grid (no Alphabetical Grouping) -->
		<div class={['grid', isRegListView ? 'gap-x-2 gap-y-1' : 'gap-y-2']} style={groupStylesFlat}>
			{#each filteredAndGroupedData.flat() as [key, item] (key)}
				<a
					data-sveltekit-preload-data="tap"
					data-sveltekit-preload-code="hover"
					id={key}
					class={[
						'block w-full py-2 hover:bg-dark-10',
						!isRegListView && key === regKey && 'bg-dark-10 font-bold text-background-contrast'
					]}
					href={resolve(`/register/${key}`)}
				>
					<span class="overflow-hidden whitespace-normal">
						{item.name ? `${item.name}` : '...'}
					</span>
				</a>
			{/each}
		</div>
	{/if}
</div>
