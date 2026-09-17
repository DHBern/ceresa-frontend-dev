<script
	lang="ts"
	generics="
		T extends 'documents' | 'register'
	"
>
	import { registerGroupByCat } from '$lib/globals/ui-states.svelte';
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { slugify } from '$lib/functions/ease_of_use/slugify';
	import type { TRegDict, TRegGroupsMap, TRegTypes } from '$lib/types/register/TRegister';

	type TProps = {
		dict: TRegDict['dict_register'][TRegTypes];
		allGroupKeys: TRegGroupsMap[TRegTypes][];
	};

	let {
		dict,
		allGroupKeys,
		hasGroupControls,
		autoCatLabels
	}: TProps & {
		hasGroupControls: boolean;
		autoCatLabels: string[];
	} = $props();
</script>

{#if !hasGroupControls || !registerGroupByCat.value}
	<div class="flex w-max justify-center gap-2">
		{#each autoCatLabels as letter (letter)}
			<button
				onclick={() => {
					goto(`#${letter}`, { replaceState: true, noScroll: true });
					tick();
					window.scrollTo({ top: 0, behavior: 'auto' });
				}}
				class="center flex w-8 items-center justify-center hover:font-bold"><p>{letter}</p></button
			>
		{/each}
	</div>
{:else if dict && hasGroupControls && registerGroupByCat.value}
	<div class="flex w-full justify-start gap-2 overflow-x-auto pb-5">
		{#each allGroupKeys as groupKey (groupKey)}
			<!-- //! Fix this any type -->
			{@const groupLabel = (dict.groups as any)[groupKey]?.label_plural}
			<button
				onclick={() => {
					goto(`#${slugify(groupLabel, { slash: true })}`, {
						replaceState: true,
						noScroll: true
					});
					tick();
					window.scrollTo({ top: 0, behavior: 'auto' });
				}}
				class="preset-btn-round --sm"><p>{groupLabel}</p></button
			>
		{/each}
	</div>
{/if}
