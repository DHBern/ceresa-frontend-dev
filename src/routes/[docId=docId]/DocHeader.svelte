<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveDocPath } from '$lib/functions/ease_of_use/resolveDocPath';
	import type { TCrossRefDocumentsExtended, TDocKeys } from '$lib/types/documents/TDocuments';
	import type {
		TResolvedPosthum,
		TResolvedUnpublished,
		TResolvedPublished,
		TResolvedTextDoc
	} from '$lib/functions/ease_of_use/resolveDoc';
	import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';
	import { dict_docs as dictDocs } from '$lib/dictionaries/dict_docs.json';
	import { dict_docGenreTypes } from '$lib/dictionaries/dict_docGenreTypes.json';
	import ResponsiveAccordion from './ResponsiveAccordion.svelte';
	import type { TResolvedRegister } from '$lib/functions/ease_of_use/resolveReg';
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import {
		currentFilesAudio,
		currentlyPlayingAudio,
		isAudioPlayerVisible
	} from '$lib/globals/ui-states.svelte';
	import { dictionaries } from '$lib/data/dictionaries.json';

	const dictDocIds1 = dictionaries['dict-1'].documents.map((doc) => {
		return doc.docId;
	});
	const dictDocIds2 = dictionaries['dict-1'].documents.map((doc) => {
		return doc.docId;
	});
	const dictDocIds = [...dictDocIds1, ...dictDocIds2];

	let {
		docId,
		resDoc,
		ceteiData,
		crossRef,
		params
	}: {
		docId: TDocKeys | undefined;
		resDoc: TResolvedPosthum | TResolvedUnpublished | TResolvedPublished | null;
		ceteiData: any;
		crossRef: Partial<
			Record<
				| 'cited_documents'
				| 'linked_documents'
				| 'cited_entities'
				| 'linked_entities'
				| 'dict-1'
				| 'dict-2'
				| 'versions',
				TCrossRefDocumentsExtended
			>
		>;
		params: any;
	} = $props();

	let stateMetadata = $state<string | null>('eckdaten');
	const dictGenre_current = Object.values(dict_docGenreTypes).find(
		(a) => a.id_singular === resDoc?.item?.metadata.type_genre
	);
</script>

{#snippet metadataButton(state: string, text: string)}
	<button
		class={['preset-btn-round --ghost font-bold', stateMetadata === state && '--active']}
		onclick={() => {
			if (stateMetadata !== state) {
				stateMetadata = state;
			}
		}}>{text}</button
	>
{/snippet}
{#snippet metadataEntry(label: string, content: string | null | undefined)}
	<tr class="mb-5 flex flex-col @lg:mb-0 @lg:block">
		<td class="w-60 p-0 align-top font-bold @lg:py-2">{label}:</td>
		<td class="p-0 text-left align-top @lg:py-2">{@html content}</td>
	</tr>
{/snippet}
{#snippet metadataEntryWithRegLink(label: string, content: TResolvedRegister[] | null | undefined)}
	<tr class="mb-5 flex flex-col @lg:mb-0 @lg:block">
		<td class="w-60 p-0 align-top font-bold @lg:py-2">{label}:</td>
		<td class="p-0 text-left align-top @lg:py-2">
			<div class="flex flex-wrap gap-4">
				{#each content ? content : [] as cont (cont)}
					<a
						class="preset-btn-round --linkarrow"
						data-type="entity"
						data-entitytype={cont.regType}
						href={resolve(`/register/${cont.regKey as string}`)}
						target="_blank"
						rel="noopener noreferrer"
					>
						{cont?.item?.name || ''}
					</a>
				{/each}
			</div>
		</td>
	</tr>
{/snippet}
{#snippet metadataCrossRefDoc(label: string, content: TResolvedTextDoc[] | null | undefined)}
	<h4 class="h6">{label}</h4>
	<div class="grid h-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
		<!-- <div
		class="grid h-full grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
	> -->
		{#each content ? content : [] as cont (cont)}
			<a
				href={resolveDocPath(cont.docId as string)}
				class="flex items-start justify-start gap-5 rounded-card p-5 hover:bg-background-hover md:flex-col md:items-center md:justify-center"
			>
				{#if cont.item}
					<IIIF_Thumb
						url={cont.item.iiif.urls_IIIF_images?.[0]}
						iiif_imageAPI_width={400}
						classesContainer=""
						classes="h-[120px]"
					/>
					<p class="flex flex-col gap-2 text-left md:text-center">
						<span>{cont.item.metadata.title_editorial}</span>
					</p>
				{:else}
					<div class="flex h-[120px] w-[120px] flex-col items-center justify-center text-center">
						<p>{cont.docId}</p>
						<p class="text-muted-foreground">(no Metadata yet)</p>
					</div>
				{/if}
			</a>
		{/each}
	</div>
{/snippet}

{#if resDoc?.item}
	<div class="w-full grid-cols-[1fr_2fr] px-10">
		<div class="w-full">
			<!-- Category Backlinks -->
			<h2 class="font-serif text-2xl font-bold text-blue-500">
				<!-- Genre -->
				{#if dictDocIds1.includes(resDoc.item.slug)}
					<a
						class="underline"
						href={`/edition/${dictGenre_current?.slug}?dictionary=piccolo_dizionario`}
						>Piccolo Dizionario</a
					>
				{:else if dictDocIds2.includes(resDoc.item.slug)}
					<a
						class="underline"
						href={`/edition/${dictGenre_current?.slug}?dictionary=dizionario_eliminabile`}
						>Dizionario Eliminabile</a
					>
				{:else}
					<a class="underline" href={`/edition/${dictGenre_current?.slug}`}
						>{dictGenre_current?.label_singular}</a
					>
				{/if}
				<span class="mx-2"> | </span>
				<!-- DocType -->
				<span>{dictDocs[resDoc.docType]?.label_singular}</span>
			</h2>

			<!-- Document Title -->
			<h1 class="font-serif text-2xl font-bold md:text-4xl lg:text-5xl xl:text-6xl">
				{resDoc.item.metadata.title_editorial}
				{#if resDoc.item.tei.suffix_version}
					<span class="text-[20px]">Version {resDoc.item.tei.suffix_version}</span>
				{/if}
			</h1>

			<!-- Audio -->
			{#if currentFilesAudio.value?.slug}
				<button
					class="group hover:bg-mute my-10 grid h-max w-max max-w-110 grid-cols-[auto_1fr] items-center justify-center gap-10 rounded-lg border border-foreground p-5"
					aria-label="play audio"
					onclick={() => {
						currentlyPlayingAudio.value = currentFilesAudio.value;
						isAudioPlayerVisible.value = true;
					}}
				>
					<div
						class={[
							'flex h-12 w-12 items-center justify-center rounded-full p-1 text-4xl text-foreground group-hover:text-5xl',
							isAudioPlayerVisible.value &&
							currentlyPlayingAudio.value?.slug === currentFilesAudio.value.slug
								? 'text-5xl'
								: ''
						]}
					>
						<i class="fa-solid fa-headphones"></i>
					</div>
					<p class="text-sm">Listen to the Audio Document linked to this document.</p>
				</button>
			{/if}
		</div>

		<!-- Versions -->
		<!-- //! REWRITE THIS FULL FEATURE -->
		<!-- <div class="w-full">
			<div data-dom="global_comment" class="h-full overflow-auto pr-6 pb-20">
				<ul class="">
					{#if crossRef.versions}
						{#each Object.keys(crossRef.versions) as type (type)}
							{#each crossRef.versions[type] as version (version)}
								<li class="preset-btn-doc --sm">
									<a href={resolveDocPath(version.item.slug)}
										>{version.item.metadata.title_editorial} ({version.item.tei.suffix_version})</a
									>
								</li>
							{/each}
						{/each}
					{/if}
				</ul>
			</div>
		</div> -->
	</div>

	<!-- Metadata -->
	<div class="w-full">
		<ResponsiveAccordion titleMeta="Metadati">
			{#snippet metadataContent()}
				<div class="h-full" data-dom="metadata">
					<div class="preset-btn-list --spacing-sm">
						{@render metadataButton('eckdaten', 'Dati principali')}
						{@render metadataButton('sources', 'Indicazioni sulle fonti')}
						{@render metadataButton('crossRefEntities', 'Riferimenti')}
						{@render metadataButton('crossRefDocs', 'Riferimenti incrociati')}
						{@render metadataButton('citation', 'Indicazioni per la citazione')}
						{@render metadataButton('download', 'Link di download')}
						<!-- {@render metadataButton('all', 'Tutto (temporaneo)')} -->
					</div>

					<div class={['@container mt-5 h-full w-full overflow-auto pt-5 pb-20']}>
						{#if stateMetadata === 'eckdaten'}
							<table>
								<tbody class="flex flex-col items-start gap-2">
									{@render metadataEntry('Titolo completo', resDoc.item!.metadata.title_full)}
									{@render metadataEntry('Data di pubblicazione', resDoc.item!.metadata.pubDate)}
									{@render metadataEntry(
										'Luogo di pubblicazione',
										'pubPlace' in resDoc.item!.metadata ? resDoc.item!.metadata.pubPlace : undefined
									)}
									{@render metadataEntry(
										'Dettagli della pubblicazione',
										resDoc.item!.metadata.pubDetails
									)}
								</tbody>
							</table>
						{:else if stateMetadata === 'sources'}
							<table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry('Luogo di archiviazione', resDoc.item!.metadata.archive)}
									{@render metadataEntry(
										"Collocazione nell'archivio",
										resDoc.item!.metadata.archiveCollation
									)}
								</tbody>
							</table>
						{:else if stateMetadata === 'crossRefEntities'}
							{#if crossRef.cited_entities && Object.keys(crossRef.cited_entities).length}
								<!-- //! replace Sachbegriffe with dict-entry (also below in h5)  -->
								<h5 class="h5">Riferimenti presenti nel testo</h5>
								<table>
									<tbody class="flex flex-col gap-2" data-dom="crossRef">
										{#each ['people', 'places', 'orgs', 'works'] as const as type (type)}
											{#if crossRef.cited_entities?.[type]?.length}
												{@render metadataEntryWithRegLink(
													dictReg[type].label_plural,
													crossRef.cited_entities?.[type]
												)}
											{/if}
										{/each}
									</tbody>
								</table>
							{/if}
							{#if crossRef.linked_entities && Object.keys(crossRef.linked_entities).length}
								<h5
									class={[
										'h5',
										crossRef.cited_entities &&
											Object.keys(crossRef.cited_entities).length &&
											'mt-5 md:mt-20'
									]}
								>
									Riferimenti collegati
								</h5>
								<table>
									<tbody class="flex flex-col gap-2" data-dom="crossRef">
										{#each ['people', 'places', 'orgs', 'works'] as const as type (type)}
											{#if crossRef.linked_entities?.[type]?.length}
												{@render metadataEntryWithRegLink(
													dictReg[type].label_plural,
													crossRef.linked_entities?.[type]
												)}
											{/if}
										{/each}
									</tbody>
								</table>
							{/if}
						{:else if stateMetadata === 'crossRefDocs'}
							{#if crossRef.cited_documents && Object.keys(crossRef.cited_documents).length}
								<h5 class="h5">Riferimenti incrociati presenti nel testo</h5>
								<div>
									{#each ['posthum', 'unpublished', 'published', 'audio'] as const as type (type)}
										{#if crossRef.cited_documents?.[type]?.length}
											{@render metadataCrossRefDoc(
												dictDocs[type].label_plural,
												crossRef.cited_documents?.[type]
											)}
										{/if}
									{/each}
								</div>
							{/if}
							{#if crossRef.linked_documents && Object.keys(crossRef.linked_documents).length}
								<h5
									class={[
										'h5',
										crossRef.cited_documents &&
											Object.keys(crossRef.cited_documents).length &&
											'mt-5 md:mt-20'
									]}
								>
									Riferimenti incrociati assegnati dal team editoriale
								</h5>
								<div>
									{#each ['posthum', 'unpublished', 'published', 'audio'] as const as type (type)}
										{#if crossRef.linked_documents?.[type]?.length}
											{@render metadataCrossRefDoc(
												dictDocs[type].label_plural,
												crossRef.linked_documents?.[type]
											)}
										{/if}
									{/each}
								</div>
							{/if}
						{:else if stateMetadata === 'citation'}
							<table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry(
										'Questo documento',
										`AUTHOR et al. 2028 "Arcipelago Ceresa. Edizione digitale degli inediti, dispersi, postumi. Gender, plurilinguismo, transnazionalità", ${resDoc.item!.metadata.title_editorial}`
									)}
									{@render metadataEntry(
										'Pagina attualmente visualizzata',
										`AUTHOR et al. 2028 "Arcipelago Ceresa. Edizione digitale degli inediti, dispersi, postumi. Gender, plurilinguismo, transnazionalità", ${resDoc.item!.metadata.title_editorial}, Pagina ${params.page}`
									)}
								</tbody>
							</table>
						{:else if stateMetadata === 'download'}
							<table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry(
										'XML',
										`<a href="" target="_blank" rel="noopener noreferrer">Documento XML</a>`
									)}
								</tbody>
							</table>
						{:else if stateMetadata === 'all'}
							<div class="h-auto">
								<div data-dom="metadata_table" class="">
									{#each Object.entries(resDoc.item!.metadata) as entry (entry)}
										{#if entry[0] !== 'crossReferences' && entry[1]}
											{@render metadataEntry(entry[0], String(entry[1]))}
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/snippet}
		</ResponsiveAccordion>
	</div>
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	/* CrossReferences */
	:global([data-dom='global_comment']) {
		:global(tei-p) {
			@apply mt-0;
		}
	}
	:global([data-dom='crossRef']) {
		/* Entity Colors */
		:global([data-entitytype='people']) {
			@apply bg-(--color-rs-person-20);
		}
		:global([data-entitytype='places']) {
			@apply bg-(--color-rs-place-20);
		}
		:global([data-entitytype='orgs']) {
			@apply bg-(--color-rs-org-20);
		}
		:global([data-entitytype='unpublished']),
		:global([data-entitytype='published']),
		:global([data-entitytype='posthum']) {
			@apply bg-(--color-rs-doc-20);
		}
		:global([data-entitytype='works']) {
			@apply bg-(--color-rs-work-20);
		}
	}
</style>
