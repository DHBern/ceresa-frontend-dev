<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TDocKeys } from '$lib/types/documents/TDocuments';
	import type {
		TResolvedPosthum,
		TResolvedUnpublished,
		TResolvedPublished,
		TResolvedDoc
	} from '$lib/functions/ease_of_use/resolveDoc';
	import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';
	import { dict_docs as dictDocs } from '$lib/dictionaries/dict_docs.json';
	import ResponsiveAccordion from './ResponsiveAccordion.svelte';
	import { printDateRange } from '$lib/functions/ease_of_use/dateFunctions';
	import type { TResolvedRegister } from '$lib/functions/ease_of_use/resolveReg';
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';

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
			Record<'citedDocuments' | 'linkedDocuments' | 'citedEntities' | 'linkedEntities', any>
		>;
		params: any;
	} = $props();

	let globalComment = $derived.by(() => {
		const match = ceteiData.serialized.match(/<tei-notesstmt\b[^>]*>(.*?)<\/tei-notesstmt>/s);
		return match ? match[1] : '';
	});

	let stateMetadata = $state<string | null>('eckdaten');
</script>

{#snippet metadataButton(state: string, text: string)}
	<button
		class={['preset-btn-round --lg', stateMetadata === state && '--active']}
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
{#snippet metadataCrossRefDoc(label: string, content: TResolvedDoc[] | null | undefined)}
	<h4 class="h6">{label}</h4>
	<div class="grid h-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
		<!-- <div
		class="grid h-full grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
	> -->
		{#each content ? content : [] as cont (cont)}
			<a
				href={resolve(`/${cont.docId as string}`)}
				class="flex items-start justify-start gap-5 rounded-card p-5 hover:bg-dark-10 md:flex-col md:items-center md:justify-center"
			>
				{#if cont.item}
					<IIIF_Thumb
						url={cont.item.manuscript?.iiif_urls[0]}
						iiif_imageAPI_width={400}
						classesContainer=""
						classes="h-[120px]"
					/>
					<p class="flex flex-col gap-2 text-left md:text-center">
						<span>{cont.item.name}</span>
					</p>
				{:else}
					<div class="flex h-[120px] w-[120px] flex-col items-center justify-center text-center">
						<p>{cont.docId}</p>
						<p class="text-muted-foreground">(noch keine Metadaten)</p>
					</div>
				{/if}
			</a>
		{/each}
	</div>
{/snippet}

{#if resDoc?.item}
	<div class="w-full px-10">
		<h1 class="h1 text-center">
			<span>{resDoc.item.name}</span>
		</h1>
		<h3 class="h3 mt-2 text-center">
			<!-- <span>{printDateRange(resDoc.item.date.from, resDoc.item.date.to)}</span> -->
			<a
				href={`https://dav.arcipelago-ceresa.digitaleditions.ch/preview/oxy.html?url=../data/sources/tei/${resDoc.item.tei.path}/${resDoc.item.tei.filename}`}
				target="_blank"
				rel="noopener noreferrer">{resDoc.item.tei.filename.replace('.xml', '')}</a
			>
		</h3>
		<!-- Global Comment -->
		<ResponsiveAccordion titleOverview="Überblickskommentar" titleMeta="Metadaten">
			<!-- (1) Übersichtskommentar -->
			{#snippet overviewContent()}
				<div data-dom="global_comment" class="h-full overflow-auto pr-6 pb-20">
					{@html globalComment}
				</div>
				<!-- <ScrollArea
					orientation="vertical"
					type="hover"
					viewportClasses="h-full w-full"
					data-dom="global_comment"
					class="bg-background-alt relative h-full overflow-hidden px-4 pb-20 xl:px-0"
				>
					{@html globalComment}
				</ScrollArea> -->
			{/snippet}

			<!-- (2) Metadata Table -->
			{#snippet metadataContent()}
				<div class="h-full" data-dom="metadata">
					<div class="preset-btn-list --spacing-normal">
						{@render metadataButton('eckdaten', 'Eckdaten')}
						{@render metadataButton('sources', 'Quellenangaben')}
						{@render metadataButton('crossRefEntities', 'Referenzierung')}
						{@render metadataButton('crossRefDocs', 'Querverweise')}
						{@render metadataButton('citation', 'Zitierhinweise')}
						{@render metadataButton('download', 'Download-Links')}
						<!-- {@render metadataButton('all', 'Alles (Temporär)')} -->
					</div>

					<div class={['@container mt-5 h-full w-full overflow-auto pt-5 pb-50']}>
						{#if stateMetadata === 'eckdaten'}
							<table>
								<tbody class="flex flex-col items-start gap-2">
									{@render metadataEntry('Voller Titel', resDoc.item!.metadata.title_full)}
									{@render metadataEntry('Publikationsdatum', resDoc.item!.metadata.pubDate)}
									{@render metadataEntry(
										'Publikationsort',
										'pubPlace' in resDoc.item!.metadata ? resDoc.item!.metadata.pubPlace : undefined
									)}
									{@render metadataEntry('Publikationsdetails', resDoc.item!.metadata.pubDetails)}
								</tbody>
							</table>
						{:else if stateMetadata === 'sources'}
							<table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry('Archivierungsort', resDoc.item!.metadata.archive)}
									{@render metadataEntry(
										'Archive Collation',
										resDoc.item!.metadata.archiveCollation
									)}
								</tbody>
							</table>
						{:else if stateMetadata === 'crossRefEntities'}
							{#if crossRef.citedEntities && Object.keys(crossRef.citedEntities).length}
								<!-- //! replace Sachbegriffe with dict-entry (also below in h5)  -->
								<h5 class="h5">Im Text enthaltene Referenzen</h5>
								<table>
									<tbody class="flex flex-col gap-2" data-dom="crossRef">
										{#each ['people', 'places', 'events', 'orgs', 'bibls', 'keywords'] as const as type (type)}
											{#if crossRef.citedEntities?.[type]?.length}
												{@render metadataEntryWithRegLink(
													dictReg[type].label_plural,
													crossRef.citedEntities?.[type]
												)}
											{/if}
										{/each}
									</tbody>
								</table>
							{/if}
							{#if crossRef.linkedEntities && Object.keys(crossRef.linkedEntities).length}
								<h5
									class={[
										'h5',
										crossRef.citedEntities &&
											Object.keys(crossRef.citedEntities).length &&
											'mt-5 md:mt-20'
									]}
								>
									Verlinkte Referenzen
								</h5>
								<table>
									<tbody class="flex flex-col gap-2" data-dom="crossRef">
										{#each ['people', 'places', 'events', 'orgs', 'bibls', 'keywords'] as const as type (type)}
											{#if crossRef.linkedEntities?.[type]?.length}
												{@render metadataEntryWithRegLink(
													dictReg[type].label_plural,
													crossRef.linkedEntities?.[type]
												)}
											{/if}
										{/each}
									</tbody>
								</table>
							{/if}
						{:else if stateMetadata === 'crossRefDocs'}
							{#if crossRef.citedDocuments && Object.keys(crossRef.citedDocuments).length}
								<h5 class="h5">Im Text enthaltene Querverweise</h5>
								<div>
									{#each ['posthum', 'unpublished', 'published'] as const as type (type)}
										{#if crossRef.citedDocuments?.[type]?.length}
											{@render metadataCrossRefDoc(
												dictDocs[type].label_plural,
												crossRef.citedDocuments?.[type]
											)}
										{/if}
									{/each}
								</div>
							{/if}
							{#if crossRef.linkedDocuments && Object.keys(crossRef.linkedDocuments).length}
								<h5
									class={[
										'h5',
										crossRef.citedDocuments &&
											Object.keys(crossRef.citedDocuments).length &&
											'mt-5 md:mt-20'
									]}
								>
									Durch Editionsteam vergebene Querverweise
								</h5>
								<div>
									{#each ['posthum', 'unpublished', 'published'] as const as type (type)}
										{#if crossRef.linkedDocuments?.[type]?.length}
											{@render metadataCrossRefDoc(
												dictDocs[type].label_plural,
												crossRef.linkedDocuments?.[type]
											)}
										{/if}
									{/each}
								</div>
							{/if}
						{:else if stateMetadata === 'citation'}
							<table>
								<tbody class="flex flex-col gap-2">
									{#if resDoc.docType === 'posthum'}
										{@render metadataEntry(
											'Dieser Brief',
											`AUTHOR et al. 2028 "Annemarie Schwarzenbach: Digitale Edition der Kleinen Formen und Briefe. Reisetexte, Intermedialität, Netzwerke", ${resDoc.item!.name} (${docId})`
										)}
										{@render metadataEntry(
											'Aktuell sichtbare Seite',
											`AUTHOR et al. 2028 "Annemarie Schwarzenbach: Digitale Edition der Kleinen Formen und Briefe. Reisetexte, Intermedialität, Netzwerke", ${resDoc.item!.name} (${docId}),  Seite ${params.page}`
										)}
									{:else}
										{@render metadataEntry(
											'Dieses Dokument',
											`AUTHOR et al. 2028 "Annemarie Schwarzenbach: Digitale Edition der Kleinen Formen und Briefe. Reisetexte, Intermedialität, Netzwerke", ${resDoc.item!.metadata.title_full}`
										)}
										{@render metadataEntry(
											'Aktuell sichtbare Seite',
											`AUTHOR et al. 2028 "Annemarie Schwarzenbach: Digitale Edition der Kleinen Formen und Briefe. Reisetexte, Intermedialität, Netzwerke", ${resDoc.item!.metadata.title_full},  Seite ${params.page}`
										)}
									{/if}
								</tbody>
							</table>
						{:else if stateMetadata === 'download'}
							<table>
								<tbody class="flex flex-col gap-2">
									{@render metadataEntry(
										'XML',
										`<a href="https://dav.annemarie-schwarzenbach.ch/data/sources/tei/unpublished/02/${docId}.xml" target="_blank" rel="noopener noreferrer">XML-Dokument</a>`
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
		:global([data-entitytype='events']) {
			@apply bg-(--color-rs-event-20);
		}
		:global([data-entitytype='orgs']) {
			@apply bg-(--color-rs-org-20);
		}
		:global([data-entitytype='unpublished']),
		:global([data-entitytype='published']),
		:global([data-entitytype='posthum']) {
			@apply bg-(--color-rs-doc-20);
		}
		:global([data-entitytype='bibls']) {
			@apply bg-(--color-rs-bibl-20);
		}
		:global([data-entitytype='keywords']) {
			@apply bg-(--color-rs-keyword-20);
		}
	}
</style>
