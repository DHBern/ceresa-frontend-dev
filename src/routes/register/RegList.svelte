<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Toggle, ToggleGroup } from 'bits-ui';

	import { filterAndGroupData } from '$lib/functions/ease_of_use/filterAndSortData';
	import { normalizeChars } from '$lib/functions/ease_of_use/normalizeChars';
	import { slugify } from '$lib/functions/ease_of_use/slugify';
	import {
		registerSortBy,
		registerShowAll,
		registerFilterBy,
		registerGroupItems
	} from '$lib/globals/ui-states.svelte';
	import { TYPESWITHGROUPCONTROL, TYPESWITHSORTCONTROL } from '$lib/globals/constants.svelte';
	import type {
		TRegDict,
		TRegGroupsMap,
		TRegister,
		TRegKeysFlat,
		TRegTypes
	} from '$lib/types/register/TRegister';
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';

	type TProps = {
		regListEntries: TRegister['register'][TRegTypes];
		regType: TRegTypes;
		regDict: TRegDict['dict_register'][TRegTypes];
		regKey?: TRegKeysFlat | null;
	};

	let {
		isRegListView,
		regListEntries,
		regType,
		regDict,
		regKey = null
	}: TProps & {
		isRegListView: boolean;
	} = $props();

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

	// Filters
	let searchParamFilterKey = $derived(page.url.searchParams.get('filter'));
	$inspect(searchParamFilterKey);

	let filteredAndGroupedData = $derived(
		filterAndGroupData(regListEntries, sortBy, {
			filterKey: 'type',
			filtersIn: registerFilterBy.value ? [registerFilterBy.value] : []
		})
	);

	// Track the current number of columns based on viewport width
	let nCols = $state(1);

	let elControlsOuter: HTMLElement | null = $state(null);
	let headerHeight = 0;

	// Function to calculate and update height
	const updateHeaderHeight = () => {
		if (elControlsOuter) {
			headerHeight = elControlsOuter.offsetHeight;
			console.log(`Header height updated to: ${headerHeight}px`);
			// document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
			document.body.style.setProperty('--header-height', `${headerHeight}px`);
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

	// Variables for autoCatLabels (Alphabet or Dates)
	//! IMPROVE: this should be generalised as soon as more types receive sorting-options
	let sortVariableKeyForShortcuts = $derived(
		regType === 'people' ? 'lastname' : regType === 'events' ? sortBy : 'name'
	);
	let autoCatLabels = $derived(
		[
			...new Set(
				Object.values(filteredAndGroupedData).map((el) => {
					if (registerSortBy.value === 'name') {
						return el[0][1]['name'] ? normalizeChars(el[0][1]['name'][0].toUpperCase()) : '-';
					} else if (registerSortBy.value === 'date') {
						return el[0][1]['date'] ? el[0][1]['date'][0] : '-';
					} else {
						return '-';
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
			hasGroupControls && hasSortControls ? 92 : hasGroupControls || hasSortControls ? 60 : 0;
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
	{#if hasSortControls}
		<div class={['grid w-full grid-cols-[160px_auto] items-start gap-2']}>
			<p class={['col-start-1 w-40 shrink-0 pt-1.25 text-sm font-bold']}>Sortieren:</p>

			<ToggleGroup.Root type="single" bind:value={registerSortBy.value} class="col-start-2 w-full">
				<!-- Sort Alphabetically -->
				<ToggleGroup.Item
					value="name"
					class={[
						'h-10 w-10 rounded-xl border p-1',
						registerSortBy.value === 'name' ? 'bg-dark text-white' : 'text-black'
					]}
					><div class="flex items-start justify-center gap-0">
						<i class="fa-solid fa-a -m-0.75 text-xs"></i><i class="fa-solid fa-b -m-0.75 text-xs"
						></i><i class="fa-solid fa-c -m-0.75 text-xs"></i>
					</div></ToggleGroup.Item
				>
				<!-- Sort by Date -->
				<ToggleGroup.Item
					value="date"
					class={[
						'h-10 w-10 rounded-xl border p-1',
						registerSortBy.value === 'date' ? 'bg-dark text-white' : 'text-black'
					]}><i class="fa-solid fa-calendar"></i></ToggleGroup.Item
				>
			</ToggleGroup.Root>
		</div>
	{/if}
{/snippet}

<!-- Outer Controls -->
{#if isRegListView}
	<div
		bind:this={elControlsOuter}
		class="sticky top-0 mb-10 flex w-full flex-col flex-wrap items-start justify-start gap-x-10 gap-y-2 bg-background py-5 text-sm"
	>
		<!-- Filters -->
		{#if regDict && hasGroupControls}
			<div class={['grid w-full grid-cols-[auto_1fr] items-start gap-2']}>
				<p class={['col-start-1 w-40 shrink-0 pt-1.25 text-sm font-bold']}>Filtern:</p>

				<div class="col-start-2 flex w-full flex-wrap justify-start gap-2">
					<button
						onclick={() => {
							registerShowAll.value = true;
							registerFilterBy.value = '';
							goto(`?filter=all`, {
								replaceState: true,
								noScroll: true
							});
							tick();
							window.scrollTo({ top: 0, behavior: 'auto' });
						}}
						class={[
							'preset-btn-round --sm mr-0',
							(!searchParamFilterKey || searchParamFilterKey === 'all') && '--active'
						]}><p>Alle Kategorien</p></button
					>
					{#each allGroupKeys as groupKey (groupKey)}
						<!-- //! Fix this any type -->
						{@const groupLabel = (regDict.groups as any)[groupKey]?.label_plural}
						{@const groupLabelSlug = slugify(groupLabel, { slash: true })}
						<button
							onclick={() => {
								registerShowAll.value = false;
								registerFilterBy.value = groupKey;
								goto(`?filter=${groupLabelSlug}`, {
									replaceState: true,
									noScroll: true
								});
								tick();
								window.scrollTo({ top: 0, behavior: 'auto' });
							}}
							class={[
								'preset-btn-round --sm',
								groupLabelSlug === searchParamFilterKey && '--active'
							]}><p>{groupLabel}</p></button
						>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Sort Controls -->
		<div class="flex gap-5">
			{@render sortControls()}
		</div>

		<!-- Grouping Toggle -->
		<div class={['grid w-full grid-cols-[160px_auto] items-center gap-2']}>
			<p class={['w-40 shrink-0 self-start pt-1.25 text-sm font-bold']}>Gruppieren:</p>

			<div class="grid w-full grid-cols-[60px_auto]">
				<!-- Toggle -->
				<Toggle.Root
					bind:pressed={registerGroupItems.value}
					aria-label="toggle grouping"
					class={[
						'col-start-1 my-auto h-10 w-10 shrink-0 rounded-xl border p-1',
						registerGroupItems.value ? 'bg-dark text-white' : 'text-black'
					]}
				>
					<i class="fa-solid fa-bars-staggered"></i>
				</Toggle.Root>
				<!-- Alphabet -->
				{#if registerGroupItems.value}
					<div class="col-start-2 flex w-full flex-wrap items-center gap-2">
						{#each autoCatLabels as letter (letter)}
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
		</div>
	</div>
{/if}

<!-- Scroll Container -->
<div
	bind:this={elScrollContainer}
	class={['flex h-full flex-col overflow-y-auto', isRegListView ? 'w-full' : 'mb-10 ml-10 w-max']}
>
	<!-- Controls (when inside scroll container) -->
	{#if !isRegListView}
		<div class={['flex w-full flex-col items-end justify-center gap-x-4 gap-y-2 pb-10']}>
			{@render sortControls()}
		</div>
	{/if}

	<!-- Items -->
	{#if registerGroupItems.value}
		{#each filteredAndGroupedData as block, blockIdx}
			{@const firstItem = block[0]?.[1]}
			{@const autoCatLabel =
				hasSortControls && sortBy === 'date'
					? firstItem?.date?.from?.slice(0, 4)
					: normalizeChars(firstItem?.[sortBy]?.[0]?.toUpperCase())}

			<!-- Header -->
			{#if autoCatLabel}
				<button
					onclick={async () => {
						if (isRegListView) {
							await goto(`#${slugify(autoCatLabel, { slash: true })}`, {
								replaceState: true,
								noScroll: true,
								keepFocus: true
							});
							window.scrollTo({ top: 0, behavior: 'instant' });
						}
					}}
					aria-label="store in URL"
					id={slugify(autoCatLabel, { slash: true })}
					class={[
						'group align-left block min-h-25 border-b pt-10 text-left font-serif text-5xl font-bold',
						!isRegListView && 'pointer-events-none'
					]}
					style="scroll-margin-top: var(--header-height, 0)"
				>
					<div class="h-full">
						<p class="inline-block">
							{autoCatLabel}
							{#if isRegListView}
								<span class="hidden group-hover:inline-block">
									<i class="fa-solid fa-link mx-2 text-xl"></i>
								</span>
							{/if}
						</p>
					</div>
				</button>

				<!-- List -->
				<div class={['grid gap-y-2', isRegListView && 'gap-x-10']} style={groupStyles[blockIdx]}>
					{#each block as [key, item]}
						<a
							data-sveltekit-preload-data="tap"
							data-sveltekit-preload-code="hover"
							id={key}
							class={[
								'block w-full px-2 py-2 hover:bg-dark-10',
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
		{/each}
	{:else}
		<!-- Title -->
		<div
			class={[
				'group align-left block h-full min-h-25 border-b pt-10 text-left font-serif text-5xl font-bold',
				!isRegListView && 'pointer-events-none'
			]}
		>
			<p class="inline-block">Alle Treffer</p>
		</div>
		<!-- Flattened Grid (no Alphabetical Grouping) -->
		<div class={['grid', isRegListView ? 'gap-x-2 gap-y-1' : 'gap-y-2']} style={groupStylesFlat}>
			{#each filteredAndGroupedData.flat() as [key, item]}
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
