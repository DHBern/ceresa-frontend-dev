<script lang="ts">
	import { doc_sequences as seqAll } from '$lib/data/doc_sequences.json';
	import type { TSeqSmallformsKeys } from '$lib/types/TSequences';
	import { resolve } from '$app/paths';

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
	<h1 class={['h1 text-center whitespace-nowrap transition-all duration-200']}>Texte und Audio</h1>

	<div class={['flex flex-col gap-5']}>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat.
		</p>
	</div>

	<div class={['grid grid-cols-3 gap-10 py-5']}>
		<!-- Posthumous -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Posthumous</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{@render keyList(
					Object.keys(seqData).filter((key) => {
						return (key as string) === 'smallforms_all';
					}) as TSeqSmallformsKeys[]
				)}
			</div>
		</div>

		<!-- Unpublished -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Unpublished</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{@render keyList(
					Object.keys(seqData).filter((key) => {
						return (key as string) === 'smallforms_all';
					}) as TSeqSmallformsKeys[]
				)}
			</div>
		</div>

		<!-- Published -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Published</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{@render keyList(
					Object.keys(seqData).filter((key) => {
						return (key as string) === 'smallforms_all';
					}) as TSeqSmallformsKeys[]
				)}
			</div>
		</div>
	</div>
</div>
