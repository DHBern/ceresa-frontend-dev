<script lang="ts">
	import type { Snippet } from 'svelte';
	import DropdownRegFilters from '$lib/components/ui/DropdownRegFilters.svelte';
	import DropdownRegSorting from '$lib/components/ui/DropdownRegSorting.svelte';
	import {
		DOC_LIST_NONE,
		type TDocRow,
		type TDocSortBy
	} from '$lib/types/documents/TDict_DocTypesGenre';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data, children }: { data: PageData; children: Snippet } = $props();

	const SECTIONS = ['posthum', 'unpublished', 'published'] as const;
	const NONE = DOC_LIST_NONE;
	// Flatten into comparable rows
	const rows = $derived.by(() => {
		const out: TDocRow[] = [];
		for (const section of SECTIONS) {
			const sec = data.documents[section];
			for (const [key, item] of Object.entries(sec)) {
				if (item.metadata.type_genre !== data.typeGenre) continue;
				out.push({
					docType: section,
					key,
					slug: item.slug ?? key, //! slug optional -> fallback to key
					name: item.metadata.title_editorial ?? item.slug ?? key,
					title: item.metadata.title_editorial ?? null,
					dateFrom: item.metadata.date?.from ?? null,
					language: item.metadata.language ?? null,
					pubPlace: item.publication.pubPlace ?? null,
					typeEditoriale: item.metadata.type_editorial ?? null,
					hasAudio: (item.crossReferences.linked_documents?.audio?.length ?? 0) > 0
				});
			}
		}
		return out;
	});

	// ----- Filter state -----
	let selDocTypes = $state<string[]>([]);
	let selEditoriale = $state<string[]>([]);
	let selLanguages = $state<string[]>([]);
	let selPubPlace = $state<string[]>([]);
	let hasAudioOnly = $state(false);
	let sortBy = $state<TDocSortBy>('name');
	let groupItems = $state(false); //! kept for the shared component API, ignored here

	// Reset filters when navigating between genre routes (layout persists)
	$effect(() => {
		void data.docTypeGenreSlug;
		selDocTypes = [];
		selEditoriale = [];
		selLanguages = [];
		selPubPlace = [];
		hasAudioOnly = false;
	});

	// ----- Dynamically derived options (+ "senza ..." pseudo-values) -----
	const docTypeOptions = $derived([
		{ value: 'posthum', label: data.uiLabels.docTypes.posthum },
		{ value: 'unpublished', label: data.uiLabels.docTypes.unpublished },
		{ value: 'published', label: data.uiLabels.docTypes.published }
	]);

	function buildOptions(get: (r: TDocRow) => string | null, noneLabel: string) {
		const set = new Set<string>();
		for (const r of rows) if (get(r)) set.add(get(r)!);
		return [...set]
			.sort((a, b) => a.localeCompare(b, 'it'))
			.map((v) => ({ value: v, label: v }))
			.concat([{ value: NONE, label: noneLabel }]);
	}

	const editorialeOptions = $derived(
		buildOptions((r) => r.typeEditoriale, data.uiLabels.none_labels.editoriale)
	);
	const languageOptions = $derived.by(() =>
		buildOptions((r) => r.language, data.uiLabels.none_labels.language).map((o) => ({
			value: o.value,
			label: data.uiLabels.languages[o.value] ?? o.label
		}))
	);
	const pubPlaceOptions = $derived(
		buildOptions((r) => r.pubPlace, data.uiLabels.none_labels.pubPlace)
	);

	// ----- Filtering -----
	function matchesMulti(itemValue: string | null, selected: string[]): boolean {
		if (!selected.length) return true;
		if (itemValue == null || itemValue === '') return selected.includes(NONE);
		return selected.includes(itemValue);
	}

	const filteredRows = $derived(
		rows.filter(
			(r) =>
				matchesMulti(r.docType, selDocTypes) &&
				matchesMulti(r.typeEditoriale, selEditoriale) &&
				matchesMulti(r.language, selLanguages) &&
				matchesMulti(r.pubPlace, selPubPlace) &&
				(!hasAudioOnly || r.hasAudio)
		)
	);

	// ----- Sorting (implicit secondary sorts, null dates last) -----
	const sortedRows = $derived.by(() => {
		const arr = [...filteredRows];
		const cmpName = (a: TDocRow, b: TDocRow) => a.name.localeCompare(b.name, 'it');
		const cmpDateAsc = (a: TDocRow, b: TDocRow) => {
			if (!a.dateFrom && !b.dateFrom) return 0;
			if (!a.dateFrom) return 1;
			if (!b.dateFrom) return -1;
			return a.dateFrom.localeCompare(b.dateFrom);
		};
		arr.sort((a, b) => {
			if (sortBy === 'name') return cmpName(a, b) || cmpDateAsc(a, b);
			if (sortBy === 'date-asc') return cmpDateAsc(a, b) || cmpName(a, b);
			if (!a.dateFrom && !b.dateFrom) return cmpName(a, b);
			if (!a.dateFrom) return 1;
			if (!b.dateFrom) return -1;
			return b.dateFrom.localeCompare(a.dateFrom) || cmpName(a, b);
		});
		return arr;
	});
</script>

<!-- Genre navigation -->
<nav class="flex flex-wrap gap-2" aria-label="Generi testuali">
	{#each Object.values(data.typesGenre) as type (type.slug)}
		{@const isCurrent = type.slug === data.docTypeGenreSlug}
		<a
			href={resolve(`/edition/${type.slug}`)}
			class={['preset-btn-round --sm', isCurrent && '--active']}
			aria-current={isCurrent ? 'page' : undefined}
		>
			{type.label_plural}
		</a>
	{/each}
</nav>

<h1 class="h1 my-4">{data.typeGenreLabel}</h1>
<!-- Filter + sorting panel -->
<section class="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtri e ordinamento">
	<DropdownRegFilters
		mode="multi"
		items={docTypeOptions.map((o) => o.value)}
		getLabel={(v) => docTypeOptions.find((o) => o.value === v)?.label ?? v}
		bind:selectedFilterMulti={selDocTypes}
	/>
	<DropdownRegFilters
		mode="multi"
		items={editorialeOptions.map((o) => o.value)}
		getLabel={(v) => editorialeOptions.find((o) => o.value === v)?.label ?? v}
		bind:selectedFilterMulti={selEditoriale}
	/>
	<DropdownRegFilters
		mode="multi"
		items={languageOptions.map((o) => o.value)}
		getLabel={(v) => languageOptions.find((o) => o.value === v)?.label ?? v}
		bind:selectedFilterMulti={selLanguages}
	/>
	<DropdownRegFilters
		mode="multi"
		items={pubPlaceOptions.map((o) => o.value)}
		getLabel={(v) => pubPlaceOptions.find((o) => o.value === v)?.label ?? v}
		bind:selectedFilterMulti={selPubPlace}
	/>
	<label class="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1">
		<input type="checkbox" bind:checked={hasAudioOnly} class="accent-current" />
		{data.uiLabels.filters.hasAudio}
	</label>
</section>
<section class="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtri e ordinamento">
	<DropdownRegSorting bind:registerSortBy={sortBy} bind:registerGroupItems={groupItems} />
</section>

<main class="mt-4">
	<ul class="divide-y">
		{#each sortedRows as row (row.docType + '/' + row.key)}
			<li>
				<a
					href="/{row.slug}"
					class="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 p-3 hover:bg-amber-100 md:grid-cols-[minmax(12rem,2fr)_6rem_5rem_repeat(2,minmax(8rem,1fr))_auto]"
				>
					<span class="font-medium">
						{row.name}
						{#if row.title}<span class="ml-1 text-sm opacity-70">({row.title})</span>{/if}
					</span>
					<span class="text-sm tabular-nums">{row.dateFrom ?? data.uiLabels.row.noDate}</span>
					<span class="text-sm"
						>{row.language ? (data.uiLabels.languages[row.language] ?? row.language) : '–'}</span
					>
					<span class="text-sm">{row.typeEditoriale ?? '–'}</span>
					<span class="text-sm">{row.pubPlace ?? '–'}</span>
					<span class="flex items-center gap-2 text-sm">
						<span class="rounded-full border px-2 py-0.5 text-xs"
							>{data.uiLabels.docTypes[row.docType]}</span
						>
						{#if row.hasAudio}
							<span class="rounded-full border px-2 py-0.5 text-xs">
								<i class="fa-solid fa-headphones mr-1"></i>{data.uiLabels.filters.hasAudio}
							</span>
						{/if}
					</span>
				</a>
			</li>
		{:else}
			<li class="p-3 opacity-60">{data.uiLabels.empty}</li>
		{/each}
	</ul>
</main>
{@render children()}
