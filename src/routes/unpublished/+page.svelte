<script lang="ts">
	import { doc_sequences as seqAll } from '$lib/data/doc_sequences.json';
	import type { TSeqSmallformsKeys } from '$lib/types/TSequences';
	import { resolve } from '$app/paths';
	import { dict_docs as dictDoc } from '$lib/dictionaries/dict_docs.json';
	import DocumentsNav from '$lib/components/DocumentsNav.svelte';

	let seqData = $derived(seqAll.smallforms);
</script>

<!-- Series -->
{#snippet keyList(keys: TSeqSmallformsKeys[])}
	<div class={['preset-btn-list items-center justify-center', '--spacing-sm']}>
		{#each keys as key (key)}
			<a class="preset-btn-round --normal" href={resolve(`/${key}` as any)}
				>{seqData[key as TSeqSmallformsKeys].name}</a
			>
		{/each}
	</div>
{/snippet}

<div class={['z-100 mx-auto flex max-w-300 flex-col gap-10 bg-background px-10']}>
	<!-- Navigation -->
	<DocumentsNav docType="smallforms" />
	<div class={['flex gap-10 py-5']}>
		<!-- Unpublished -->
		<div class="flex flex-col gap-7">
			<h1 class={['h1 text-center whitespace-nowrap transition-all duration-200']}>
				{dictDoc['unpublished']?.label_plural}
			</h1>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{@render keyList(
					Object.keys(seqData).filter((key) => {
						return (key as string) === 'unpublished_all';
					}) as TSeqSmallformsKeys[]
				)}
			</div>
		</div>
	</div>
</div>
