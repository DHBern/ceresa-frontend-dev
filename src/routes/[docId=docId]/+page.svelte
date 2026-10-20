<script lang="ts">
	import DocViewer from './DocViewer.svelte';
	import DocHeader from './DocHeader.svelte';
	import Sequences from './Sequences.svelte';

	import { page } from '$app/state';
	import { useSearchParams } from 'runed/kit';

	import { schema, validSeqKeys } from './schemas';
	import { cleanupSearchParams } from '$lib/functions/searchParams/cleanupSearchParams.js';
	import { currentFilesAudio } from '$lib/globals/ui-states.svelte.js';
	import type { TDocItemsAudio } from '$lib/types/documents/TDocuments.js';

	const params = useSearchParams(schema, { noScroll: true });

	$effect(() => {
		cleanupSearchParams(page.url, schema, validSeqKeys);
	});

	let { data } = $props();

	// Reset Audio Data
	$effect(() => {
		const audioId = data.resolvedDoc?.item?.crossReferences?.linkedDocuments?.audio?.[0]; //!FIX [0]-hack
		if (audioId) {
			currentFilesAudio.value =
				(data.crossRef.linkedDocuments?.audio?.filter((item) => {
					return item.docKey === audioId;
				})[0].item as TDocItemsAudio) || null;
		}
	});
</script>

<!--  -->
<div class="relative flex h-full flex-col items-center gap-6">
	<!-- Sequences -->
	<!-- <Sequences docId={data.resolvedDoc?.docId} {params} {validSeqKeys} /> -->

	<!-- Metadata -->
	<DocHeader
		docId={data.resolvedDoc?.docId}
		resDoc={data.resolvedDoc}
		ceteiData={data.ceteiData}
		crossRef={data.crossRef}
		{params}
	/>

	<!-- Content -->
	<DocViewer
		docItem={data.resolvedDoc?.item}
		ceteiData={data.ceteiData}
		resolvedDoc={data.resolvedDoc}
		classesContainer="w-full grow"
		{params}
	/>
</div>
