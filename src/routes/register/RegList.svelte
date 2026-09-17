<script
	lang="ts"
	generics="
		T extends 'register'
	"
>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import Switch from '$lib/components/ui/Switch.svelte';

	import { register as reg } from '$lib/data/register.json';

	import { filterAndSortData } from '$lib/functions/ease_of_use/filterAndSortData';
	import { normalizeChars } from '$lib/functions/ease_of_use/normalizeChars';
	import { slugify } from '$lib/functions/ease_of_use/slugify';
	import { registerSortBy, registerGroupByCat } from '$lib/globals/ui-states.svelte';
	import { TYPESWITHGROUPCONTROL, TYPESWITHSORTCONTROL } from '$lib/globals/constants.svelte';
	import Shortcuts from './Shortcuts.svelte';
	import type {
		TRegDict,
		TRegGroupsMap,
		TRegister,
		TRegKeysFlat,
		TRegTypes
	} from '$lib/types/register/TRegister';
	import { invertScroll } from '$lib/functions/invertScroll.svelte';
	import type { TEventsKeys } from '$lib/types/register/TEventsKeys';

	type TProps = {
		regListEntries: TRegister['register'][TRegTypes];
		regType: TRegTypes;
		regDict: TRegDict['dict_register'][TRegTypes];
		regKey?: TRegKeysFlat | null;
	};

	let {
		isMultiColumn,
		regListEntries,
		regType,
		regDict,
		regKey = null,
		cheatPageHeightInRegSingleColView = ''
	}: TProps & {
		isMultiColumn: boolean;
		cheatPageHeightInRegSingleColView?: string;
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

	// Variables for autoCatLabels (Alphabet or Dates)
	//! IMPROVE: this should be generalised as soon as more types receive sorting-options
	let sortVariableKeyForShortcuts = $derived(
		regType === 'people' ? 'lastname' : regType === 'events' ? sortBy : 'name'
	);
	let autoCatLabels = $derived(
		[
			...new Set(
				Object.values(regListEntries).map((el) => {
					// Normalize autoCatLabels to group e.g. Ç with C and Ä with A
					return normalizeChars(el[sortVariableKeyForShortcuts]?.[0]?.toUpperCase());
				})
			)
		].sort()
	);

	// Scroll to the specific item
	let ovListScrollContainer: HTMLElement | undefined = $state();

	function scrollToItem(regKey: TRegKeysFlat) {
		const targetElement = document.getElementById(regKey);
		const offsetSortControls =
			hasGroupControls && hasSortControls ? 92 : hasGroupControls || hasSortControls ? 60 : 0;
		if (targetElement) {
			ovListScrollContainer?.scrollTo({
				top: targetElement.offsetTop - ovListScrollContainer.offsetTop - offsetSortControls,
				behavior: 'smooth'
			});
		}
	}

	$effect(() => {
		if (regKey) scrollToItem(regKey);
	});
</script>

<!-- Snippet for Register Items -->
{#snippet regListItem(key: string, name: string | null)}
	<a
		data-sveltekit-preload-data="tap"
		data-sveltekit-preload-code="hover"
		id={key}
		class={[
			'align-left block w-90 border-b px-5 py-3 text-left',
			!isMultiColumn && key === regKey && 'bg-dark-10 font-bold text-background-contrast'
		]}
		href={resolve(`/register/${key}`)}
	>
		<span class="overflow-hidden whitespace-normal">
			{name ? `${name}` : '...'}
		</span>
	</a>
{/snippet}

<!-- Snippet for Group Titles (i.e. autoCatLabels or Category Names) -->
{#snippet groupTitle(value: string)}
	<button
		onclick={async () => {
			if (isMultiColumn) {
				await goto(`#${slugify(value, { slash: true })}`, {
					replaceState: true,
					noScroll: true,
					keepFocus: true
				});
				window.scrollTo({ top: 0, behavior: 'instant' });
			}
		}}
		aria-label="store in URL"
		id={slugify(value, { slash: true })}
		class={[
			'group align-left block min-h-25 w-90 border-b px-5 pt-10 text-left font-serif text-4xl font-bold',
			!isMultiColumn && 'pointer-events-none'
		]}
	>
		<div class="h-full">
			<p class="inline-block">
				{value}
				{#if isMultiColumn}
					<span class="hidden group-hover:inline-block">
						<i class="fa-solid fa-link mx-2 text-xl"></i>
					</span>
				{/if}
			</p>
		</div>
	</button>
{/snippet}

<!-- Snippet for Sorting Controls -->
{#snippet sortControls()}
	{#if hasSortControls}
		<div class={['flex flex-wrap items-center gap-2', isMultiColumn ? 'text-base' : 'text-xs']}>
			<p>Sortierung:</p>
			{#snippet sortButton(name: string, sortKey: string)}
				<button
					class={[registerSortBy.value === sortKey ? 'pointer-events-none font-bold' : 'underline']}
					onclick={() => {
						registerSortBy.value = sortKey;
					}}>{name}</button
				>
			{/snippet}
			<div>
				{@render sortButton('alphabetisch', 'name')}
				<span>/</span>
				{@render sortButton('chronologisch', 'date')}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Snippet for Grouping Controls -->
{#snippet groupControls()}
	{#if hasGroupControls}
		<div class={['flex flex-wrap items-center gap-2', isMultiColumn ? 'text-base' : 'text-xs']}>
			<Switch bind:checked={registerGroupByCat.value} height={24}
				><span>Nach Kategorien gruppieren</span></Switch
			>
		</div>
	{/if}
{/snippet}

<!-- RegList Container (including other navigation) -->
<div class="overflow-y-auto">
	<!-- Controls (when outside scroll container) -->
	{#if isMultiColumn}
		<div
			class="my-10 flex w-full flex-col flex-wrap items-start justify-start gap-x-10 gap-y-6 text-base"
		>
			<div class="flex gap-5">
				{@render groupControls()}
				{@render sortControls()}
			</div>

			<Shortcuts
				dict={regDict as TRegDict['dict_register'][TRegTypes]}
				{hasGroupControls}
				{autoCatLabels}
				allGroupKeys={allGroupKeys as TRegGroupsMap[TRegTypes][]}
			/>
		</div>
	{/if}

	<!-- Scroll Container -->
	<div
		bind:this={ovListScrollContainer}
		// redirect vertical scroll to horizontal scroll
		onwheel={(ev) => {
			if (isMultiColumn && ovListScrollContainer) {
				invertScroll(ev);
			}
		}}
		class={[
			'flex w-full flex-col',
			isMultiColumn
				? //! h-[65vh] is not optimal, but h-full will not make the flex wrap.
					'mt-10 h-[65vh] flex-wrap content-start gap-x-16 overflow-x-auto pb-10'
				: 'mt-5 overflow-y-auto pr-6'
		]}
		style={cheatPageHeightInRegSingleColView}
	>
		<!-- Controls (when inside scroll container) -->
		{#if !isMultiColumn}
			<div class={['flex w-full flex-col items-end justify-center gap-x-4 gap-y-2 pb-10']}>
				{@render groupControls()}
				{@render sortControls()}
			</div>
		{/if}

		{#if hasGroupControls && registerGroupByCat.value}
			<!-- Grouped by categories -->
			{#each allGroupKeys as groupKey (groupKey)}
				{#if groupKey && groupKey !== '?'}
					{@render groupTitle(
						//! FIX hardcoded types!
						(regDict.groups[groupKey as keyof typeof regDict.groups] as Record<'label_plural', any>)
							?.label_plural || '?'
					)}
					{#each filterAndSortData( regListEntries, sortBy, { filterKey: 'type', filtersIn: [groupKey] } ) as [key, item] (key)}
						{@render regListItem(key, item.name)}
					{/each}
				{/if}
			{/each}
		{:else if regType}
			<!-- All other types -->
			{@const sortedData = filterAndSortData(regListEntries, sortBy)}
			{#each sortedData as [key, item], i (key)}
				{@const itemBefore = sortedData[i - 1]?.[1]}
				{@const autoCatLabel =
					hasSortControls && sortBy === 'date'
						? item.date.from?.slice(0, 4)
						: normalizeChars(item[sortBy]?.[0]?.toUpperCase())}
				{@const catLabelBefore =
					hasSortControls && sortBy === 'date'
						? itemBefore?.date.from?.slice(0, 4)
						: normalizeChars(itemBefore?.[sortBy]?.[0]?.toUpperCase())}
				{#if autoCatLabel && autoCatLabel !== catLabelBefore}
					{@render groupTitle(autoCatLabel)}
				{/if}
				{@render regListItem(key, item.name)}
			{/each}
		{/if}
	</div>
</div>
