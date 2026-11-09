<script lang="ts">
	import dict_register from '$lib/dictionaries/dict_register.json';
	import { register as reg } from '$lib/data/register.json';
	import type { TRegKeysFlat, TRegTypes } from '$lib/types/register/TRegister';
	import {
		activeRegType,
		openRegisters,
		selectedTextNode,
		setDrawerSmall
	} from '$lib/globals/ui-states.svelte';
	import {
		findTextNodes,
		selectFirstTextelement,
		selectTextelement
	} from '$lib/functions/interactive_edendum/handleInteractiveText';
	import type {
		TDocItemsPosthum,
		TDocItemsPublished,
		TDocItemsUnpublished
	} from '$lib/types/documents/TDocuments';
	import { resolveReg } from '$lib/functions/ease_of_use/resolveReg';
	import RegSummarypage from '../register/[regSlug=regItem]/RegSummarypage.svelte';
	import { resolve } from '$app/paths';
	import { isBreakpointBelow } from '$lib/functions/ease_of_use/breakpoints.svelte';

	let isBelowBreakpoint = $derived(isBreakpointBelow('lg'));
	const dictReg = dict_register.dict_register as Record<
		string,
		{ key_singular: string; label_plural: string }
	>;

	let {
		docItem
	}: { docItem: TDocItemsPosthum | TDocItemsUnpublished | TDocItemsPublished | null } = $props();

	let regEntries = $derived(docItem?.crossReferences?.citedEntities);
	let localRegKey: TRegKeysFlat | null = $state(null);
	let localRegResolved = $derived(resolveReg(reg, localRegKey));
	const regTypes = Object.keys(reg) as Array<keyof typeof reg>;
	const nonEmptyRegTypes = regTypes.reduce<TRegTypes[]>((acc, regType) => {
		if ((regEntries && regEntries[regType]?.length) || 0 > 0) {
			acc.push(regType as TRegTypes);
		}
		return acc;
	}, []);
	openRegisters.list = nonEmptyRegTypes;

	function changeRegSelection(regKey) {
		selectedTextNode.key = regKey;
		const elSpans = findTextNodes(regKey);
		selectedTextNode.els = elSpans;
		selectedTextNode.el = elSpans?.[0];
	}

	$effect(() => {
		let resolvedReg = resolveReg(reg, selectedTextNode.key as TRegKeysFlat);
		activeRegType.value = resolvedReg?.regType;
		localRegKey = resolvedReg?.regKey ? resolvedReg.regKey : localRegKey;
	});

	let mobileShowList = $state(false);
</script>

{#snippet ListRegTypes(type: 'round' | 'block')}
	{#each regTypes as regType (regType)}
		{#if regEntries?.[regType]?.length}
			<button
				class={[
					type === 'block' && 'px-4 py-2 text-left text-sm hover:bg-dark-90',
					type === 'block' && activeRegType.value === regType && 'bg-dark-70',
					type === 'round' && 'preset-btn-round'
				]}
				onclick={() => {
					activeRegType.value = regType;
				}}
			>
				<span>{dictReg[regType].label_plural}&nbsp;</span>
				<span class="font-sans font-normal">({regEntries?.[regType]?.length || '0'})</span>
			</button>
		{/if}
	{/each}
{/snippet}
{#snippet ListRegEntries()}
	{#if activeRegType.value}
		{#each regEntries?.[activeRegType.value] as regKey (regKey)}
			{@const resolvedReg = resolveReg(reg, regKey as TRegKeysFlat)}
			<button
				data-regKey={regKey}
				class={[
					'px-4 py-2 text-left  text-sm hover:bg-dark-90',
					localRegKey === regKey && 'bg-dark-70 hover:bg-background-hover!'
				]}
				onclick={() => {
					localRegKey = regKey;
					changeRegSelection(regKey);
					mobileShowList = false;
				}}
			>
				{resolvedReg?.item?.name}
			</button>
		{/each}
	{/if}
{/snippet}
{#snippet Main()}
	{#if localRegResolved}
		<div class="flex items-center gap-5">
			{#if isBelowBreakpoint}
				{@render SmallVersionListToggle()}
			{/if}
			<!-- Button: Cycle occurences -->
			<button
				class="preset-btn-round --ghost"
				aria-label="find in text"
				onclick={() => {
					if (!selectedTextNode.key) {
						changeRegSelection(localRegKey);
						selectFirstTextelement(selectedTextNode.key);
					} else {
						selectTextelement(selectedTextNode.el); // in case focus has been lost.
					}
					setDrawerSmall();
				}}
				><i class="fa-magnifying-glass fa-solid"></i><span class="ml-2"
					>{selectedTextNode.els?.length > 1
						? `Trova tutte le ${selectedTextNode.els?.length} occorrenze`
						: `Trova l'occorrenza`}</span
				>
			</button>

			<!-- Button: Open in Register -->
			<a
				class="preset-btn-round --ghost"
				href={resolve(`/register/${selectedTextNode.key as any}`)}
				target="_blank"
				aria-label="In Register öffnen"
				rel="noopener noreferrer"
				><i class="fa-up-right-from-square fa-regular"></i><span class="ml-2 text-nowrap"
					>Apri nel registro</span
				></a
			>
		</div>
		<RegSummarypage
			docType={localRegResolved?.regType}
			regDict={dictReg[localRegResolved?.regType]}
			regAttributes={localRegResolved?.item}
			crossRef={undefined}
			regMapPreviewPath={undefined}
			openCrossRefsInNewTab={true}
		/>
	{/if}
{/snippet}
{#snippet SmallVersionListToggle()}
	<button
		class="preset-btn-round --ghost"
		onclick={() => {
			mobileShowList = !mobileShowList;
		}}
	>
		{#if mobileShowList}
			<i class="fa-solid fa-chevron-left"></i>
			<span class="ml-2 text-nowrap">Torna alla voce</span>
		{:else}
			<i class="fa-solid fa-bars-staggered"></i>
			<span class="ml-2 text-nowrap">Mostra altre voci</span>
		{/if}
	</button>
{/snippet}

<!-- Small version -->
{#if isBelowBreakpoint}
	<!-- Main Content -->
	{#if mobileShowList}
		<div
			class={['h-full px-5']}
			// in:fade={{ delay: 100, duration: 200 }}
		>
			{@render SmallVersionListToggle()}
			<div
				data-dom="reg-col-1"
				class="mt-5 flex h-full w-full flex-col"
				// transition:slide={{ duration: 100, axis: 'x' }}
			>
				<div
					data-dom="reg-col-1"
					class="mb-5 flex flex-wrap gap-2 overflow-y-auto"
					// out:fade={{ delay: 0, duration: 50 }}
				>
					{@render ListRegTypes('round')}
				</div>
				<div
					data-dom="reg-col-2"
					class="flex flex-col gap-2 overflow-y-auto"
					// out:fade={{ delay: 0, duration: 50 }}
				>
					{@render ListRegEntries()}
				</div>
			</div>
		</div>
	{:else}
		<div
			class={['h-full overflow-y-auto px-5']}
			// in:fade={{ delay: 100, duration: 200 }}
		>
			{@render Main()}
		</div>
	{/if}
{:else}
	<!-- Large version -->
	<div class="grid h-full w-full grid-cols-[200px_200px_1fr] px-5">
		<!-- First Column: Register Types -->
		<div data-dom="reg-col-1" class="flex flex-col overflow-auto border-r px-0">
			{@render ListRegTypes('block')}
		</div>

		<!-- Second Column: Register Entries -->
		<div data-dom="reg-col-2" class="flex flex-col overflow-auto px-0">
			{@render ListRegEntries()}
		</div>

		<!-- Main Content -->
		<div class={['ml-5 overflow-y-auto']}>
			{@render Main()}
		</div>
	</div>
{/if}
