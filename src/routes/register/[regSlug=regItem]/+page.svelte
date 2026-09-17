<script lang="ts">
	import RegSummarypage from './RegSummarypage.svelte';
	import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';

	import type { TRegKeysFlat } from '$lib/types/register/TRegister.js';
	import RegList from '../RegList.svelte';

	let { data } = $props();

	const regType = $derived(data.regType || null);
	const regSlug = $derived(data.regSlug || null);

	//! FIX: This is a workaround to pass the same *absolute* value to RegList and RegSummarypage
	// Ideally the height would be relative (e.g. h-full).
	// However, this will make overflow its flex content (i.e. the list and linked items).
	const cheatPageHeightInRegSingleColView = 'height:85vh;';
</script>

<div class="relative mt-24 grid h-full w-full grid-cols-[auto_1fr] gap-4">
	<RegList
		isMultiColumn={false}
		regListEntries={data.regListEntries}
		regDict={dictReg[regType]}
		{regType}
		regKey={regSlug as TRegKeysFlat}
		{cheatPageHeightInRegSingleColView}
	/>
	<RegSummarypage
		docType={regType}
		regDict={dictReg[regType]}
		regAttributes={data.regAttributes}
		crossRef={data.crossRef}
		regMapPreviewPath={data.regMapPreviewPath}
		{cheatPageHeightInRegSingleColView}
	/>
</div>
