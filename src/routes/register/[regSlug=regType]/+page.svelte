<script lang="ts">
	import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';

	import type { TRegTypes } from '$lib/types/register/TRegister.js';
	import RegList from '../RegList.svelte';

	let { data } = $props();

	const regType = $derived(data.regType || null);
	const regSlug = $derived(data.regSlug || null);
</script>

<!-- Overview with Multi-Column List -->
<div class="absolute top-45 left-0 w-full px-10">
	<RegList
		isMultiColumn={true}
		regListEntries={data.regListEntries}
		regDict={dictReg[regType]}
		regType={regSlug as TRegTypes}
		regKey={null}
	/>
</div>
