<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveDocPath } from '$lib/functions/ease_of_use/resolveDocPath';
	import { resolveIIIFUrl } from '$lib/functions/ease_of_use/resolveIIIFUrl';
	import type {
		TCrossRefDocumentsExtended,
		TCrossRefEntitiesExtended,
		TDocKeys,
		TDocTypes
	} from '$lib/types/documents/TDocuments';
	import type { TRegKeysFlat, TRegTypes } from '$lib/types/register/TRegister';
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
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import {
		currentFilesAudio,
		currentlyPlayingAudio,
		isAudioPlayerVisible
	} from '$lib/globals/ui-states.svelte';
	import { doc_sequences } from '$lib/data/doc_sequences.json';
	import { printDateRange } from '$lib/functions/ease_of_use/dateFunctions';
	import { DOCTYPE_STYLES } from '$lib/globals/constants.svelte';

	let {
		docId,
		resDoc,
		ceteiData,
		crossRef,
		versions,
		params
	}: {
		docId: TDocKeys | undefined;
		resDoc: TResolvedPosthum | TResolvedUnpublished | TResolvedPublished | null;
		ceteiData: any;
		versions: TResolvedTextDoc[];
		crossRef: {
			cited_documents?: TCrossRefDocumentsExtended;
			linked_documents?: TCrossRefDocumentsExtended;
			cited_entities?: TCrossRefEntitiesExtended;
			linked_entities?: TCrossRefEntitiesExtended;
		};
		params: any;
	} = $props();

	let stateMetadata = $state<string | null>('eckdaten');
	const dictGenre_current = Object.values(dict_docGenreTypes).find(
		(a) => a.id_singular === resDoc?.item?.metadata.type_genre
	);

	function formatMetadataValue(value: unknown): string | null {
		if (
			value === null ||
			value === undefined ||
			value === '' ||
			value === 'TUnset' ||
			value === 'unset'
		)
			return null;
		if (Array.isArray(value)) {
			return value.length
				? value.map((entry) => formatMetadataValue(entry) ?? 'Non disponibile').join(', ')
				: null;
		}
		if (typeof value === 'object') {
			const date = value as Record<string, unknown>;
			if ('from' in date || 'to' in date) {
				const formattedFrom = formatMetadataValue(date.from);
				const formattedTo = formatMetadataValue(date.to);
				if (formattedFrom === null && formattedTo === null) return null;
				const from = formattedFrom ?? 'Non disponibile';
				const to = formattedTo ?? 'Non disponibile';
				return from === to ? from : `${from} – ${to}`;
			}
			return Object.values(date)
				.map((entry) => formatMetadataValue(entry) ?? 'Non disponibile')
				.join(', ');
		}
		return String(value);
	}

	function getProperty(value: unknown, key: string): unknown {
		if (typeof value !== 'object' || value === null || !(key in value)) return undefined;
		return (value as Record<string, unknown>)[key];
	}

	function formatDateValue(value: unknown): string | null {
		if (typeof value === 'string') return printDateRange(value, value) || null;
		if (typeof value !== 'object' || value === null) return null;
		const from = getProperty(value, 'from');
		const to = getProperty(value, 'to');
		return (
			printDateRange(
				typeof from === 'string' ? from : undefined,
				typeof to === 'string' ? to : undefined
			) || null
		);
	}

	function getDocumentFieldValue(item: unknown, section: string, field: string): unknown {
		const value = getProperty(getProperty(item, section), field);
		return ['date', 'pub_date', 'date_author_normalised'].includes(field)
			? formatDateValue(value)
			: value;
	}

	function isHttpUrl(value: unknown): value is string {
		return typeof value === 'string' && /^https?:\/\//i.test(value);
	}

	function getFirstIIIFImage(item: unknown): string | undefined {
		const url = getProperty(getProperty(item, 'iiif'), 'filename_or_url_preview');
		return typeof url === 'string' ? (resolveIIIFUrl(url) ?? undefined) : undefined;
	}

	function getCrossRefTitle(item: unknown, fallback: string): string {
		const metadata = getProperty(item, 'metadata');
		const title =
			getProperty(metadata, 'title_editorial') ??
			getProperty(metadata, 'title') ??
			getProperty(item, 'name');
		return typeof title === 'string' && title ? title : fallback;
	}

	function getCrossRefEntityName(item: unknown): string {
		const name = getProperty(item, 'name');
		return typeof name === 'string' ? name : '';
	}

	function hasEntityReferences(
		references: typeof crossRef.cited_entities | typeof crossRef.linked_entities
	): boolean {
		return Object.values(references ?? {}).some((entries) => Boolean(entries?.length));
	}

	function formatAudioChapters(value: unknown): string | null {
		if (!Array.isArray(value) || !value.length) return null;
		return value
			.map((chapter) => {
				const name = formatMetadataValue(getProperty(chapter, 'chapName'));
				const time = getProperty(chapter, 'time');
				const formattedTime =
					typeof time === 'number'
						? `${Math.floor(time / 60)
								.toString()
								.padStart(2, '0')}:${Math.floor(time % 60)
								.toString()
								.padStart(2, '0')}`
						: (formatMetadataValue(time) ?? 'Non disponibile');
				return `${name ?? 'Capitolo senza titolo'} (${formattedTime})`;
			})
			.join(', ');
	}
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
{#snippet metadataValue(value: unknown)}
	{@const formattedValue = formatMetadataValue(value)}
	{#if formattedValue === null}
		<span class="text-muted-foreground italic">Non disponibile</span>
	{:else if isHttpUrl(value)}
		<a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
	{:else if Array.isArray(value)}
		<ul class="flex flex-col gap-1">
			{#each value as entry, index (`${index}`)}
				<li>
					{#if isHttpUrl(entry)}
						<a href={entry} target="_blank" rel="noopener noreferrer">{entry}</a>
					{:else if formatMetadataValue(entry) === null}
						<span class="text-muted-foreground italic">Non disponibile</span>
					{:else}
						{formatMetadataValue(entry)}
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		{formattedValue}
	{/if}
{/snippet}
{#snippet metadataEntry(label: string, content: unknown)}
	<tr class="grid min-w-0 grid-cols-1 content-start">
		<td class="block w-full min-w-0 p-0 align-top font-bold">{label}:</td>
		<td class="block w-full min-w-0 p-0 text-left align-top break-words">
			{@render metadataValue(content)}
		</td>
	</tr>
{/snippet}
{#snippet metadataEntryWithRegLink(
	label: string,
	content:
		| {
				item: object | string | null;
				regType: TRegTypes | null;
				regKey: TRegKeysFlat;
		  }[]
		| null
		| undefined
)}
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
						{getCrossRefEntityName(cont.item)}
					</a>
				{/each}
			</div>
		</td>
	</tr>
{/snippet}
{#snippet metadataCrossRefDoc(
	label: string,
	content:
		| {
				item: object | string | null;
				docType: TDocTypes | null;
				docKey: TDocKeys;
		  }[]
		| null
		| undefined
)}
	<h4 class="h6">{label}</h4>
	<div class="grid h-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
		{#each content ?? [] as cont (cont.docKey)}
			<a
				href={resolveDocPath(cont.docKey)}
				class="flex items-start justify-start gap-5 rounded-card p-5 hover:bg-background-hover md:flex-col md:items-center md:justify-center"
			>
				{#if cont.item}
					<IIIF_Thumb
						url={getFirstIIIFImage(cont.item)}
						iiif_imageAPI_width={400}
						classesContainer=""
						classes="h-[120px]"
					/>
					<p class="flex flex-col gap-2 text-left md:text-center">
						<span>{getCrossRefTitle(cont.item, cont.docKey)}</span>
					</p>
				{:else}
					<div class="flex h-[120px] w-[120px] flex-col items-center justify-center text-center">
						<p>{cont.docKey}</p>
						<p class="text-muted-foreground">(Metadati non disponibili)</p>
					</div>
				{/if}
			</a>
		{/each}
	</div>
{/snippet}
{#snippet metadataVersionDocs(content: TResolvedTextDoc[])}
	<h4 class="h6">Versioni</h4>
	<div class="grid h-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
		{#each content as version (version.docId)}
			<a
				href={resolveDocPath(version.docId)}
				class="flex items-start justify-start gap-5 rounded-card p-5 hover:bg-background-hover md:flex-col md:items-center md:justify-center"
			>
				<IIIF_Thumb
					url={getFirstIIIFImage(version.item)}
					iiif_imageAPI_width={400}
					classesContainer=""
					classes="h-[120px]"
				/>
				<p class="flex flex-col gap-2 text-left md:text-center">
					<span>{version.item?.metadata.title_editorial ?? version.docId}</span>
				</p>
			</a>
		{/each}
	</div>
{/snippet}

{#if resDoc?.item}
	<div class="w-full grid-cols-[1fr_2fr] px-10">
		<div class="w-full">
			<!-- Category Backlinks -->
			<h2 class={['mb-2 font-sans text-xl font-bold']}>
				<!-- DocType -->
				<span
					class={[
						'mb-2 w-max rounded-sm px-3 py-1 font-sans text-xl font-bold',
						DOCTYPE_STYLES[resDoc?.docType]
					]}
					>{dictDocs[resDoc.docType]?.label_singular}
					<span class="mx-2">|</span>
					<!-- Separator -->
					<!-- Genre -->
					{#if doc_sequences.dictionaries['piccolo'].docs.includes(resDoc.item.slug)}
						<a class="" href={resolve(doc_sequences.dictionaries['piccolo'].url_overview)}
							>Piccolo Dizionario</a
						>
					{:else if doc_sequences.dictionaries['eliminabile'].docs.includes(resDoc.item.slug)}
						<a class="" href={resolve(doc_sequences.dictionaries['eliminabile'].url_overview)}
							>Dizionario Eliminabile</a
						>
					{:else}
						<a class="" href={resolve(`/edition/${dictGenre_current?.slug}`)}
							>{dictGenre_current?.label_singular}</a
						>
					{/if}
				</span>
			</h2>

			<!-- Document Title -->
			<h1 class="font-serif text-2xl font-bold md:text-4xl lg:text-5xl xl:text-6xl">
				{resDoc.item.metadata.title_editorial}
			</h1>

			{#if versions.length}
				<div class="mt-15 items-center gap-3" aria-label="Altre versioni">
					<span class="font-bold">Altre versioni:</span>
					<ul class="gap-3">
						{#each versions as version (version.docId)}
							<li class="mt-3">
								<a
									class="preset-btn-round --ghost --linkarrow"
									href={resolveDocPath(version.docId)}
								>
									{version.item?.metadata.title_editorial}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Audio -->
			{#if currentFilesAudio.value?.slug}
				<button
					class={[
						'group hover:bg-mute my-10 grid h-max w-max max-w-[80vw] grid-cols-[auto_1fr] items-center justify-center gap-10 rounded-lg border border-foreground p-5 md:max-w-110',
						isAudioPlayerVisible.value &&
						currentlyPlayingAudio.value?.slug === currentFilesAudio.value.slug
							? 'pointer-events-none bg-muted'
							: ''
					]}
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
					<p class="text-left text-sm">Listen to the Audio Document linked to this document.</p>
				</button>
			{/if}
		</div>
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
						{#if currentFilesAudio.value?.slug}
							{@render metadataButton('audio', 'Metadati audio')}
						{/if}
						<!-- {@render metadataButton('all', 'Tutto (temporaneo)')} -->
					</div>

					<div class={['@container mt-5 h-full w-full overflow-auto pt-5 pb-20']}>
						{#if stateMetadata === 'eckdaten'}
							<table>
								<tbody class="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2 2xl:grid-cols-3">
									{#each Object.entries(dictDocs[resDoc.docType].metadata) as [field, definition] (field)}
										{@render metadataEntry(
											definition.label,
											getDocumentFieldValue(resDoc.item, 'metadata', field)
										)}
									{/each}
									{@render metadataEntry(dictDocs[resDoc.docType].slug.label, resDoc.item!.slug)}
									{#each Object.entries(dictDocs[resDoc.docType].publication) as [field, definition] (field)}
										{@render metadataEntry(
											definition.label,
											getDocumentFieldValue(resDoc.item, 'publication', field)
										)}
									{/each}
								</tbody>
							</table>
						{:else if stateMetadata === 'sources'}
							<table>
								<tbody class="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2 2xl:grid-cols-3">
									{#each Object.entries(dictDocs[resDoc.docType].archival) as [field, definition] (field)}
										{@render metadataEntry(
											definition.label,
											getDocumentFieldValue(resDoc.item, 'archival', field)
										)}
									{/each}
									{#each Object.entries(dictDocs[resDoc.docType].document) as [field, definition] (field)}
										{@render metadataEntry(
											definition.label,
											getDocumentFieldValue(resDoc.item, 'document', field)
										)}
									{/each}
								</tbody>
							</table>
						{:else if stateMetadata === 'crossRefEntities'}
							{#if hasEntityReferences(crossRef.cited_entities)}
								<!-- //! replace Sachbegriffe with dict-entry (also below in h5)  -->
								<h5 class="h5">Riferimenti presenti nel testo</h5>
								<table>
									<tbody
										class="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2 2xl:grid-cols-3"
										data-dom="crossRef"
									>
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
							{#if hasEntityReferences(crossRef.linked_entities)}
								<h5 class={['h5', hasEntityReferences(crossRef.cited_entities) && 'mt-5 md:mt-20']}>
									Riferimenti collegati
								</h5>
								<table>
									<tbody
										class="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2 2xl:grid-cols-3"
										data-dom="crossRef"
									>
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
							{#if !hasEntityReferences(crossRef.cited_entities) && !hasEntityReferences(crossRef.linked_entities)}
								<p class="text-muted-foreground italic">
									Nessun riferimento a persone, luoghi, organizzazioni o opere.
								</p>
							{/if}
						{:else if stateMetadata === 'crossRefDocs'}
							<!-- <table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry(
										dictDocs[resDoc.docType].crossReferences.linked_documents.label,
										resDoc.item!.crossReferences.linked_documents
									)}
								</tbody>
							</table> -->
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
									{#each ['posthum', 'unpublished', 'published'] as const as type (type)}
										{#if crossRef.linked_documents?.[type]?.length}
											{@render metadataCrossRefDoc(
												dictDocs[type].label_plural,
												crossRef.linked_documents?.[type]
											)}
										{/if}
									{/each}
								</div>
							{/if}
							{#if versions.length}
								{@render metadataVersionDocs(versions)}
							{/if}
						{:else if stateMetadata === 'citation'}
							<table>
								<tbody class="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2">
									{@render metadataEntry(
										'Questo documento',
										`AUTHOR et al. 2028 "Arcipelago Ceresa. Edizione digitale degli inediti, dispersi, postumi. Gender, plurilinguismo, transnazionalità", ${resDoc.item!.metadata.title_editorial}`
									)}
									<!-- {@render metadataEntry(
										'Pagina attualmente visualizzata',
										`AUTHOR et al. 2028 "Arcipelago Ceresa. Edizione digitale degli inediti, dispersi, postumi. Gender, plurilinguismo, transnazionalità", ${resDoc.item!.metadata.title_editorial}, Pagina ${params.page}`
									)} -->
								</tbody>
							</table>
						{:else if stateMetadata === 'download'}
							<table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry(
										dictDocs[resDoc.docType].iiif.url_IIIF_manifest.label,
										resDoc.item!.iiif.url_IIIF_manifest
									)}
								</tbody>
							</table>
						{:else if stateMetadata === 'audio'}
							<table>
								<tbody class="grid grid-cols-1 gap-x-20 gap-y-5 lg:grid-cols-2 2xl:grid-cols-3">
									{@render metadataEntry('Titolo', getProperty(currentFilesAudio.value, 'name'))}
									{@render metadataEntry(
										'Titolo della traccia',
										getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'title')
									)}
									{@render metadataEntry(
										'Titolo completo',
										getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'title_full')
									)}
									{@render metadataEntry(
										'Data',
										formatDateValue(getProperty(currentFilesAudio.value, 'date'))
									)}
									{@render metadataEntry(
										'Data di pubblicazione',
										formatDateValue(
											getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'pubDate')
										)
									)}
									{@render metadataEntry(
										'Sede di pubblicazione',
										getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'pubPlace')
									)}
									{@render metadataEntry(
										'Fondo archivistico/biblioteca',
										getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'archive')
									)}
									{@render metadataEntry(
										"Collocazione nell'archivio",
										getProperty(
											getProperty(currentFilesAudio.value, 'metadata'),
											'archiveCollation'
										)
									)}
									{@render metadataEntry(
										'Tipologia testuale',
										getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'type_testuale')
									)}
									{@render metadataEntry(
										'Note',
										getProperty(getProperty(currentFilesAudio.value, 'metadata'), 'note')
									)}
									{@render metadataEntry(
										'Percorso del file audio',
										getProperty(getProperty(currentFilesAudio.value, 'audioMaterial'), 'path')
									)}
									{@render metadataEntry(
										'Nome del file audio',
										getProperty(getProperty(currentFilesAudio.value, 'audioMaterial'), 'filename')
									)}
									{@render metadataEntry(
										'Capitoli audio',
										formatAudioChapters(
											getProperty(
												getProperty(
													getProperty(currentFilesAudio.value, 'audioMaterial'),
													'metadata'
												),
												'chapters'
											)
										)
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
