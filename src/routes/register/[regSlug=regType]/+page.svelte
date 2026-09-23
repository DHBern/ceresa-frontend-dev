<script lang="ts">
	import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';

	import type { TRegTypes } from '$lib/types/register/TRegister.js';
	import RegList from '../RegList.svelte';

	let { data } = $props();

	const regType = $derived(data.regType || null);
	const regSlug = $derived(data.regSlug || null);

	let hasScrolledDeep = $state(false);
	function checkScrollPosition() {
		hasScrolledDeep = window.scrollY > 400;
	}
</script>

<svelte:window on:scroll={checkScrollPosition} />
<div class="mt-20 w-full px-10 lg:mt-25">
	<RegList
		{hasScrolledDeep}
		isRegListView={true}
		regListEntries={data.regListEntries}
		regDict={dictReg[regType]}
		regType={regSlug as TRegTypes}
		regKey={null}
	/>
</div>
