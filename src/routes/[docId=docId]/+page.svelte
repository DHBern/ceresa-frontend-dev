<script lang="ts">
	import DocViewer from './DocViewer.svelte';
	import DocHeader from './DocHeader.svelte';

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
		const audioId = data.resolvedDoc?.item?.crossReferences?.linked_documents?.audio?.[0]; //!FIX [0]-hack
		if (audioId) {
			currentFilesAudio.value =
				(data.crossRef.linked_documents?.audio?.filter((entry) => {
					return entry.docKey === audioId;
				})[0].item as TDocItemsAudio) || null;
		}
	});
</script>

<!--  -->
<div class="relative flex h-full flex-col items-center gap-6">
	<!-- Metadata -->
	<DocHeader
		docId={data.resolvedDoc?.docId}
		resDoc={data.resolvedDoc}
		ceteiData={data.ceteiData}
		crossRef={data.crossRef}
		{params}
	/>

	<!-- Content -->
	{#key page.params.docId}
		<DocViewer
			docItem={data.resolvedDoc?.item}
			ceteiData={data.ceteiData}
			ceteiDataTranslation={data.ceteiDataTranslation}
			resolvedDoc={data.resolvedDoc}
			classesContainer="w-full grow"
			{params}
		/>
	{/key}
</div>
