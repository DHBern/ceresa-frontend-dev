<script lang="ts">
	import LF from './LF.svelte';
	import Gallery from './Gallery.svelte';
	import DF from './DF.svelte';
	import COMBO from './COMBO.svelte';
	import DocHeader from './DocHeader.svelte';
	import Sequences from './Sequences.svelte';
	import { Tabs } from 'bits-ui';

	import { page } from '$app/state';
	import { useSearchParams } from 'runed/kit';

	import { schema, validSeqKeys } from './schemas';
	import { cleanupSearchParams } from '$lib/functions/searchParams/cleanupSearchParams.js';

	const params = useSearchParams(schema, { noScroll: true });

	$effect(() => {
		cleanupSearchParams(page.url, schema, validSeqKeys);
	});

	let { data } = $props();
</script>

<div class="relative flex h-full flex-col items-center gap-6">
	<!-- Sequences -->
	<Sequences docId={data.resolvedDoc?.docId} {params} {validSeqKeys} />

	<!-- Metadata -->
	<DocHeader
		docId={data.resolvedDoc?.docId}
		resDoc={data.resolvedDoc}
		ceteiData={data.ceteiData}
		crossRef={data.crossRef}
		{params}
	/>

	<!-- DFLF Toggle -->
	<!-- <Tabs.Root bind:value={params.mode} class="sticky top-10 z-90000 max-w-260 xl:static">
		<Tabs.List class="preset-tabs-list --lg grid grid-cols-3">
			<Tabs.Trigger value="DF" class="preset-tabs-trigger --left">Diplomatic View</Tabs.Trigger>
			<Tabs.Trigger value="COMBO" class="preset-tabs-trigger --center">Combined View</Tabs.Trigger>
			<Tabs.Trigger value="LF" class=" preset-tabs-trigger --right">Reading View</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root> -->

	<!-- Content -->
	<div class="w-full grow">
		{#if params.mode === 'LF'}
			<LF docItem={data.resolvedDoc?.item} ceteiData={data.ceteiData} {params} />
		{:else if params.mode === 'DF'}
			<DF
				docItem={data.resolvedDoc?.item}
				ceteiData={data.ceteiData}
				{params}
				resolvedDoc={data.resolvedDoc}
			/>
		{:else if params.mode === 'COMBO'}
			<COMBO
				docItem={data.resolvedDoc?.item}
				ceteiData={data.ceteiData}
				{params}
				resolvedDoc={data.resolvedDoc}
			/>
		{/if}
	</div>
</div>
