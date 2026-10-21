<script lang="ts">
	import { doc_sequences as seqAll } from '$lib/data/doc_sequences.json';
	import type { TSeqPosthumKeys } from '$lib/types/TSequences';
	import { resolve } from '$app/paths';
	import { dict_docs as dictDoc } from '$lib/dictionaries/dict_docs.json';
	import DocumentsNav from '$lib/components/DocumentsNav.svelte';
	import { dictionaries } from '$lib/data/dictionaries.json';

	let seqData = $derived(seqAll.posthum);
</script>

<!-- Series -->
{#snippet keyList(keys: TSeqPosthumKeys[])}
	<div class={['preset-btn-list items-center justify-center', '--spacing-sm']}>
		{#each keys as key (key)}
			<a class="preset-btn-round --normal" href={resolve(`/${key}` as any)}
				>{seqData[key as TSeqPosthumKeys].name}</a
			>
		{/each}
	</div>
{/snippet}

<div class={['z-100 mx-auto flex max-w-300 flex-col gap-10 bg-background px-10']}>
	<!-- Navigation -->
	<DocumentsNav docType="posthum" />
	<div class={['flex gap-10 py-5']}>
		<!-- Posthumous -->
		<div class="flex flex-col gap-7">
			<h1 class={['h1 text-center whitespace-nowrap transition-all duration-200']}>
				{dictDoc['posthum']?.label_plural}
			</h1>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{@render keyList(Object.keys(seqAll.posthum) as TSeqPosthumKeys[])}
			</div>
		</div>
	</div>

	<!-- Dictionary -->
	<div class={['flex gap-10 py-5']}>
		<!-- Posthumous -->
		<div class="flex flex-col gap-7">
			<h1
				id="piccolo_dizionario"
				class={['h1 text-center whitespace-nowrap transition-all duration-200']}
			>
				Piccolo Dizionario
			</h1>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			{#snippet DictList(dictId: keyof typeof dictionaries)}
				<div>
					<h2 class="h2">{dictionaries[dictId].name}</h2>
					<ul class="">
						{#each dictionaries[dictId].documents as doc (doc.order)}
							<li>
								<a class={[doc.version && 'ml-5']} href={resolve(`/${doc.docId}`)}
									>{doc.name}
									{#if doc.version}<em>({doc.version})</em>{/if}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			{/snippet}

			<div class="grid grid-cols-2">
				{@render DictList('dict-1')}
				{@render DictList('dict-2')}
			</div>
		</div>
	</div>
</div>
