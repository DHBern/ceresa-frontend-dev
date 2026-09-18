<script lang="ts">
	import RegSummarypage from './RegSummarypage.svelte';
	import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';

	import type { TRegKeysFlat } from '$lib/types/register/TRegister.js';
	import RegList from '../RegList.svelte';

	let { data } = $props();

	const regType = $derived(data.regType || null);
	const regSlug = $derived(data.regSlug || null);
</script>

<div class="relative mt-24 grid h-full w-full grid-cols-1 gap-4 xl:grid-cols-[500px_auto]">
	<div class="absolute hidden h-full xl:block">
		<RegList
			isRegListView={false}
			regListEntries={data.regListEntries}
			regDict={dictReg[regType]}
			{regType}
			regKey={regSlug as TRegKeysFlat}
		/>
	</div>
	<div class="px-10 xl:col-start-2">
		<RegSummarypage
			docType={regType}
			regDict={dictReg[regType]}
			regAttributes={data.regAttributes}
			crossRef={data.crossRef}
			regMapPreviewPath={data.regMapPreviewPath}
		/>
	</div>
</div>
