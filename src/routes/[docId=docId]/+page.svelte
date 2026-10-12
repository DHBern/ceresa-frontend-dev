<script lang="ts">
	import COMBO from './COMBO.svelte';
	import DocHeader from './DocHeader.svelte';
	import Sequences from './Sequences.svelte';

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

	<!-- Content -->
	<div class="w-full grow">
		<COMBO
			docItem={data.resolvedDoc?.item}
			ceteiData={data.ceteiData}
			{params}
			resolvedDoc={data.resolvedDoc}
		/>
	</div>
</div>
