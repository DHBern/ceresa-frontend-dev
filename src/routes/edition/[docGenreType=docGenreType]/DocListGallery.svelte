<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolveDocPath } from '$lib/functions/ease_of_use/resolveDocPath';
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import { printDateRange } from '$lib/functions/ease_of_use/dateFunctions';
	import { DOC_EDTYPE_STYLES, DOCTYPE_STYLES } from '$lib/globals/constants.svelte';
	import { galleryViewType } from '$lib/globals/ui-states.svelte';
	import edTypes from '$lib/dictionaries/dict_docEdTypes.json';
	import docsDictionary from '$lib/dictionaries/dict_docs.json';
	import genreDictionary from '$lib/dictionaries/dict_docGenreTypes.json';
	import type { TDocColumn, TDocRow } from '$lib/types/documents/TDict_DocGenreTypes';

	type SequenceDocument = {
		slug?: string | null;
		metadata: {
			title_editorial: string | null;
			date: { from: string | null; to: string | null } | null;
			language: string | null;
			type_editorial: string | null;
		};
		archival: { signature: string | null };
		publication: { pub_place?: string | null };
		iiif: { urls_IIIF_images?: string[] | null };
		crossReferences: { linked_documents?: { audio?: string[] } | null };
	};

	let {
		containerClasses = '',
		seq,
		data,
		rows,
		header,
		galleryControls
	}: {
		containerClasses?: string;
		seq?: { docs: string[] | null } | null;
		data?: { docs: Record<string, SequenceDocument>; seqSlug: string | null };
		rows?: TDocRow[];
		header?: Snippet<[TDocColumn, string]>;
		galleryControls?: Snippet;
	} = $props();

	const entries = $derived.by(() => {
		if (rows) return rows;
		if (!seq?.docs || !data) return [];
		return seq.docs.map((key): TDocRow => {
			const item = data.docs[key];
			const docType = key.startsWith('posthum_')
				? 'posthum'
				: key.startsWith('unpublished_')
					? 'unpublished'
					: 'published';
			return {
				key,
				docType,
				slug: item?.slug || key,
				name: item?.metadata.title_editorial || item?.archival.signature || key,
				title: item?.metadata.title_editorial || null,
				dateFrom: item?.metadata.date?.from ?? null,
				dateTo: item?.metadata.date?.to ?? null,
				language: item?.metadata.language ?? null,
				pubPlace: item?.publication.pub_place ?? null,
				typeEditoriale: item?.metadata.type_editorial ?? null,
				hasAudio: (item?.crossReferences.linked_documents?.audio?.length ?? 0) > 0,
				imageUrl: item?.iiif.urls_IIIF_images?.[0] ?? null
			};
		});
	});

	const columns = 'grid-cols-[16rem_minmax(18rem,1fr)_12rem_10rem_19rem_9rem_14rem]';
	const iconColumns = 'grid-cols-[16rem_7rem_minmax(18rem,1fr)_12rem_10rem_19rem_9rem_14rem]';
	const tableWidth = $derived(
		galleryViewType.value === 'iconList' ? 'min-w-[114rem]' : 'min-w-[106rem]'
	);
	let tableHeader = $state<HTMLDivElement>();
	let tableBody = $state<HTMLDivElement>();

	function syncHorizontalScroll(source: HTMLDivElement, target: HTMLDivElement | undefined) {
		if (target && target.scrollLeft !== source.scrollLeft) target.scrollLeft = source.scrollLeft;
	}

	function editorialLabel(value: string | null): string {
		return value
			? (edTypes.dict_docEdTypes[value as keyof typeof edTypes.dict_docEdTypes]
					?.label_short_singular ?? value)
			: '–';
	}

	function displayDate(from: string | null, to: string | null): string {
		const yearRange = from === to ? from?.match(/^(\d{4})\/(\d{4})$/) : null;
		return (
			(yearRange ? printDateRange(yearRange[1], yearRange[2]) : printDateRange(from, to)) ||
			genreDictionary.labels.row.noDate
		);
	}
</script>

{#snippet columnHeader(column: TDocColumn, label: string)}
	{#if header}
		{@render header(column, label)}
	{:else}
		<span>{label}</span>
	{/if}
{/snippet}

{#snippet edTypeLabel(row: TDocRow)}
	<span
		class={[
			'w-fit rounded-full px-2 py-1 text-xs',
			row.typeEditoriale && DOC_EDTYPE_STYLES[row.typeEditoriale]
		]}>{editorialLabel(row.typeEditoriale)}</span
	>
{/snippet}

{#snippet docTypeLabel(row: TDocRow)}
	<span class={['w-fit rounded-full px-2 py-1 text-xs', row.docType && DOCTYPE_STYLES[row.docType]]}
		>{docsDictionary.dict_docs[row.docType].label_singular}</span
	>
{/snippet}

{#snippet listValues(row: TDocRow)}
	<span class={['font-bold', !row.title && 'text-muted-foreground']}>{row.name}</span>
	<span class="tabular-nums">{displayDate(row.dateFrom, row.dateTo)}</span>
	<span
		>{row.language
			? (genreDictionary.labels.languages[
					row.language as keyof typeof genreDictionary.labels.languages
				] ?? row.language)
			: '–'}</span
	>
	<span>{row.pubPlace || '–'}</span>
	<span
		>{#if row.hasAudio}<i class="fa-solid fa-headphones mr-1"></i>{genreDictionary.labels.filters
				.hasAudio}{:else}–{/if}</span
	>
{/snippet}

<div class={containerClasses}>
	<div class="mb-6 flex justify-center">
		<div class="preset-tabs-list flex h-10" role="group" aria-label="Visualizzazione dei documenti">
			<button
				type="button"
				aria-label="Mostra come galleria"
				title="Mostra come galleria"
				aria-pressed={galleryViewType.value === 'gallery'}
				data-state={galleryViewType.value === 'gallery' ? 'active' : 'inactive'}
				class="preset-tabs-trigger --left flex w-12 items-center justify-center"
				onclick={() => (galleryViewType.value = 'gallery')}
				><i class="fa-solid fa-table-cells-large" aria-hidden="true"></i></button
			>
			<button
				type="button"
				aria-label="Mostra come elenco con anteprime"
				title="Mostra come elenco con anteprime"
				aria-pressed={galleryViewType.value === 'iconList'}
				data-state={galleryViewType.value === 'iconList' ? 'active' : 'inactive'}
				class="preset-tabs-trigger --center flex w-12 items-center justify-center border-l border-dark-40"
				onclick={() => (galleryViewType.value = 'iconList')}
				><i class="fa-solid fa-list" aria-hidden="true"></i></button
			>
			<button
				type="button"
				aria-label="Mostra come elenco semplice"
				title="Mostra come elenco semplice"
				aria-pressed={galleryViewType.value === 'list'}
				data-state={galleryViewType.value === 'list' ? 'active' : 'inactive'}
				class="preset-tabs-trigger --right flex w-12 items-center justify-center border-l border-dark-40"
				onclick={() => (galleryViewType.value = 'list')}
				><i class="fa-solid fa-bars" aria-hidden="true"></i></button
			>
		</div>
	</div>

	{#if galleryViewType.value === 'gallery' && galleryControls}
		{@render galleryControls()}
	{/if}

	{#if entries.length === 0 && galleryViewType.value === 'gallery'}
		<p class="p-3 opacity-60">{genreDictionary.labels.empty}</p>
	{:else if galleryViewType.value === 'gallery'}
		<div class="gallery-grid grid gap-5">
			{#each entries as row (row.docType + '/' + row.key)}
				<a
					href={resolveDocPath(row.slug) +
						(data?.seqSlug ? `?seq=${encodeURIComponent(data.seqSlug)}` : '')}
					class="flex min-w-0 flex-col items-start gap-5 rounded-card p-5 hover:bg-background-hover sm:flex-row"
				>
					<IIIF_Thumb
						url={row.imageUrl}
						iiif_imageAPI_width={600}
						classesContainer="shrink-0"
						classes="h-60 w-50"
						imgClasses="h-60 w-50"
					/>
					<div class="flex min-w-0 flex-1 flex-col gap-2">
						<div class="flex items-start gap-2">
							{@render docTypeLabel(row)}
							{@render edTypeLabel(row)}
						</div>
						<span class={['text-lg font-bold break-words', !row.title && 'text-muted-foreground']}
							>{row.name}</span
						>
						<dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm break-words">
							<dt>Data</dt>
							<dd>{displayDate(row.dateFrom, row.dateTo)}</dd>
							<dt>{genreDictionary.labels.filters.language}</dt>
							<dd>
								{row.language
									? (genreDictionary.labels.languages[
											row.language as keyof typeof genreDictionary.labels.languages
										] ?? row.language)
									: '–'}
							</dd>
							<dt>{genreDictionary.labels.filters.pubPlace}</dt>
							<dd>{row.pubPlace || '–'}</dd>
							<dt>{genreDictionary.labels.filters.docType}</dt>
							<dd>{docsDictionary.dict_docs[row.docType].label_singular}</dd>
							{#if row.hasAudio}<dt>Audio</dt>
								<dd>
									<i class="fa-solid fa-headphones mr-1"></i>{genreDictionary.labels.filters
										.hasAudio}
								</dd>{/if}
						</dl>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class={[
				'doc-table',
				galleryViewType.value === 'iconList' ? 'doc-table--icons' : 'doc-table--list'
			]}
		>
			<div
				bind:this={tableHeader}
				onscroll={(event) => syncHorizontalScroll(event.currentTarget, tableBody)}
				class="doc-table-header sticky top-0 z-20 overflow-x-auto bg-background"
			>
				<div
					class={[
						'grid items-center gap-x-4 gap-y-4 border-b-2 px-4 py-2 text-sm font-semibold',
						tableWidth,
						galleryViewType.value === 'iconList' ? iconColumns : columns
					]}
				>
					{@render columnHeader('docType', genreDictionary.labels.filters.docType)}
					{#if galleryViewType.value === 'iconList'}
						<span>Anteprima</span>
					{/if}
					{@render columnHeader('name', 'Titolo')}
					{@render columnHeader('date', 'Data')}
					{@render columnHeader('language', genreDictionary.labels.filters.language)}
					{@render columnHeader('pubPlace', genreDictionary.labels.filters.pubPlace)}
					{@render columnHeader('hasAudio', 'Audio')}
					{@render columnHeader('typeEditoriale', genreDictionary.labels.filters.editoriale)}
				</div>
			</div>
			<div
				bind:this={tableBody}
				onscroll={(event) => syncHorizontalScroll(event.currentTarget, tableHeader)}
				class="overflow-x-auto"
			>
				<div class={tableWidth}>
					{#if entries.length === 0}
						<p class="p-3 opacity-60">{genreDictionary.labels.empty}</p>
					{/if}
					<ul>
						{#each entries as row (row.docType + '/' + row.key)}
							<li class="border-b-2">
								<a
									href={resolveDocPath(row.slug) +
										(data?.seqSlug ? `?seq=${encodeURIComponent(data.seqSlug)}` : '')}
									class={[
										'grid items-center gap-x-4 gap-y-4 px-4 py-4 text-sm hover:bg-background-hover',
										galleryViewType.value === 'iconList' ? iconColumns : columns
									]}
								>
									{@render docTypeLabel(row)}
									{#if galleryViewType.value === 'iconList'}
										<IIIF_Thumb
											url={row.imageUrl}
											iiif_imageAPI_width={100}
											classesContainer=""
											classes="h-24 w-20"
											imgClasses="h-24 w-20"
										/>
									{/if}
									{@render listValues(row)}
									{@render edTypeLabel(row)}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Keep horizontal scrolling without making the table a vertical sticky scroll container. */
	.doc-table-header {
		scrollbar-width: none;
	}

	.doc-table-header::-webkit-scrollbar {
		display: none;
	}

	.gallery-grid {
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(100%, max(36rem, calc((100% - 2.5rem) / 3))), 1fr)
		);
	}

	@container edition-page (width > 0px) {
		.doc-table--list {
			--doc-table-min-width: 106rem;
		}

		.doc-table--icons {
			--doc-table-min-width: 114rem;
		}

		.doc-table {
			--doc-table-width: max(100%, min(var(--doc-table-min-width), 100cqw));
			width: var(--doc-table-width);
			margin-inline: calc((100% - var(--doc-table-width)) / 2);
		}
	}
</style>
