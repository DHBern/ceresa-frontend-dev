<script lang="ts">
	import { resolveDocPath } from '$lib/functions/ease_of_use/resolveDocPath';
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import { printDateRange } from '$lib/functions/ease_of_use/dateFunctions';
	import { DOC_EDTYPE_STYLES, DOCTYPE_STYLES } from '$lib/globals/constants.svelte';
	import { galleryViewType } from '$lib/globals/ui-states.svelte';
	import edTypes from '$lib/dictionaries/dict_docEdTypes.json';
	import docsDictionary from '$lib/dictionaries/dict_docs.json';
	import genreDictionary from '$lib/dictionaries/dict_docGenreTypes.json';
	import type { TDocRow } from '$lib/types/documents/TDict_DocGenreTypes';

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
		rows
	}: {
		containerClasses?: string;
		seq?: { docs: string[] | null } | null;
		data?: { docs: Record<string, SequenceDocument>; seqSlug: string | null };
		rows?: TDocRow[];
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

	const columns =
		'grid-cols-[8rem_minmax(18rem,3fr)_minmax(10rem,1fr)_minmax(8rem,1fr)_minmax(12rem,1fr)_8rem_minmax(12rem,1fr)]';
	const iconColumns =
		'grid-cols-[8rem_7rem_minmax(18rem,3fr)_minmax(10rem,1fr)_minmax(8rem,1fr)_minmax(12rem,1fr)_8rem_minmax(12rem,1fr)]';

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

{#snippet edTypeLabel(row: TDocRow)}
	<span
		class={[
			'w-fit rounded-full px-2 py-1 text-xs',
			row.typeEditoriale && DOC_EDTYPE_STYLES[row.typeEditoriale]
		]}>{editorialLabel(row.typeEditoriale)}</span
	>
{/snippet}

{#snippet docTypeLabel(row: TDocRow)}
	<span
		class={[
			'w-fit rounded-full px-2 py-1 text-xs',
			row.docType && DOCTYPE_STYLES[row.docType]
		]}>{docsDictionary.dict_docs[row.docType].label_singular}</span
	
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

<div class={[containerClasses, 'relative pt-30']}>
	<div class="absolute top-0 right-0 flex gap-2">
		<button
			aria-label="Mostra come galleria"
			title="Mostra come galleria"
			class={[
				'preset-btn-round rounded-xl border-none p-2',
				galleryViewType.value === 'gallery' && 'bg-background-hover'
			]}
			onclick={() => (galleryViewType.value = 'gallery')}
			><i class="fa-solid fa-table-cells-large text-4xl"></i></button
		>
		<button
			aria-label="Mostra come elenco con anteprime"
			title="Mostra come elenco con anteprime"
			class={[
				'preset-btn-round rounded-xl border-none p-2',
				galleryViewType.value === 'iconList' && 'bg-background-hover'
			]}
			onclick={() => (galleryViewType.value = 'iconList')}
			><i class="fa-solid fa-list text-4xl"></i></button
		>
		<button
			aria-label="Mostra come elenco semplice"
			title="Mostra come elenco semplice"
			class={[
				'preset-btn-round rounded-xl border-none p-2',
				galleryViewType.value === 'list' && 'bg-background-hover'
			]}
			onclick={() => (galleryViewType.value = 'list')}
			><i class="fa-solid fa-bars text-4xl"></i></button
		>
	</div>

	{#if entries.length === 0}
		<p class="p-3 opacity-60">{genreDictionary.labels.empty}</p>
	{:else if galleryViewType.value === 'gallery'}
		<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
			{#each entries as row (row.docType + '/' + row.key)}
				<a
					href={resolveDocPath(row.slug) +
						(data?.seqSlug ? `?seq=${encodeURIComponent(data.seqSlug)}` : '')}
					class="flex items-start gap-5 rounded-card p-5 hover:bg-background-hover"
				>
					<IIIF_Thumb
						url={row.imageUrl}
						iiif_imageAPI_width={600}
						classesContainer="shrink-0"
						classes="h-60 w-50"
						imgClasses="h-60 w-50"
					/>
					<div class="flex min-w-0 flex-col gap-2">
						{@render docTypeLabel(row)}
						{@render edTypeLabel(row)}
						<span class={['font-bold text-lg', !row.title && 'text-muted-foreground']}>{row.name}</span>
						<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
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
		<div class="overflow-x-auto">
			<div
				class={galleryViewType.value === 'iconList' ? 'min-w-[92rem]' : 'min-w-[84rem]'}
			>
				<div
					class={[
						'grid items-center gap-4 border-b-2 px-4 py-2 text-sm font-semibold',
						galleryViewType.value === 'iconList' ? iconColumns : columns
					]}
				>
					<span>{genreDictionary.labels.filters.docType}</span>
					{#if galleryViewType.value === 'iconList'}
						<span>Anteprima</span>
					{/if}
					<span>Titolo</span>
					<span>Data</span>
					<span>{genreDictionary.labels.filters.language}</span>
					<span>{genreDictionary.labels.filters.pubPlace}</span>
					<span>Audio</span>
					<span>{genreDictionary.labels.filters.editoriale}</span>
				</div>
				<ul>
					{#each entries as row (row.docType + '/' + row.key)}
						<li class="border-b-2">
							<a
								href={resolveDocPath(row.slug) +
									(data?.seqSlug ? `?seq=${encodeURIComponent(data.seqSlug)}` : '')}
								class={[
									'grid items-center gap-4 px-4 py-4 text-sm hover:bg-background-hover',
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
	{/if}
</div>
