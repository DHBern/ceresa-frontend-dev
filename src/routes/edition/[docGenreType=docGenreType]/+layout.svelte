<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Accordion, DropdownMenu } from 'bits-ui';
	import {
		DOC_LIST_NONE,
		type TDocRow,
		type TDocColumn
	} from '$lib/types/documents/TDict_DocGenreTypes';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import DocListGallery from '../../DocListGallery.svelte';
	import edTypes from '$lib/dictionaries/dict_docEdTypes.json';

	let { data, children }: { data: PageData; children: Snippet } = $props();

	const SECTIONS = ['posthum', 'unpublished', 'published'] as const;
	const NONE = DOC_LIST_NONE;
	// Flatten into comparable rows
	const rows = $derived.by(() => {
		const out: TDocRow[] = [];
		for (const section of SECTIONS) {
			const sec = data.documents[section];
			for (const [key, item] of Object.entries(sec)) {
				if (item.metadata.type_genre !== data.genreType) continue;
				out.push({
					docType: section,
					key,
					slug: item.slug ?? key, //! slug optional -> fallback to key
					name: item.metadata.title_editorial || item.archival.signature || key,
					title: item.metadata.title_editorial ?? null,
					dateFrom: item.metadata.date?.from ?? null,
					dateTo: item.metadata.date?.to ?? null,
					language: item.metadata.language ?? null,
					pubPlace: item.publication.pub_place ?? null,
					typeEditoriale: item.metadata.type_editorial ?? null,
					hasAudio: (item.crossReferences.linked_documents?.audio?.length ?? 0) > 0,
					imageUrl: item.iiif.urls_IIIF_images?.[0] ?? null
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
	let sortColumn = $state<TDocColumn>('name');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let filtersAccordionValue = $state('filters');

	// Reset filters when navigating between genre routes (layout persists)
	$effect(() => {
		void data.docGenreTypeSlug;
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
		buildOptions((r) => r.typeEditoriale, data.uiLabels.none_labels.editoriale).map((option) => ({
			...option,
			label:
				edTypes.dict_docEdTypes[option.value as keyof typeof edTypes.dict_docEdTypes]
					?.label_short_singular ?? option.label
		}))
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

	type Filter = {
		column: Exclude<TDocColumn, 'name' | 'date'>;
		label: string;
		options: { value: string; label: string }[];
		selected: string[];
	};

	const filters: Filter[] = $derived([
		{
			column: 'docType',
			label: data.uiLabels.filters.docType,
			options: docTypeOptions,
			selected: selDocTypes
		},
		{
			column: 'typeEditoriale',
			label: data.uiLabels.filters.editoriale,
			options: editorialeOptions,
			selected: selEditoriale
		},
		{
			column: 'language',
			label: data.uiLabels.filters.language,
			options: languageOptions,
			selected: selLanguages
		},
		{
			column: 'pubPlace',
			label: data.uiLabels.filters.pubPlace,
			options: pubPlaceOptions,
			selected: selPubPlace
		},
		{
			column: 'hasAudio',
			label: 'Audio',
			options: [{ value: 'audio', label: data.uiLabels.filters.hasAudio }],
			selected: hasAudioOnly ? ['audio'] : []
		}
	]);

	function setSelection(column: Filter['column'], values: string[]) {
		switch (column) {
			case 'docType':
				selDocTypes = values;
				break;
			case 'typeEditoriale':
				selEditoriale = values;
				break;
			case 'language':
				selLanguages = values;
				break;
			case 'pubPlace':
				selPubPlace = values;
				break;
			case 'hasAudio':
				hasAudioOnly = values.includes('audio');
				break;
		}
	}

	function toggleFilter(filter: Filter, value: string) {
		setSelection(
			filter.column,
			filter.selected.includes(value)
				? filter.selected.filter((selected) => selected !== value)
				: [...filter.selected, value]
		);
	}

	const sortColumns: { column: TDocColumn; label: string }[] = $derived([
		{ column: 'name', label: 'Titolo' },
		{ column: 'date', label: 'Data' },
		...filters.map(({ column, label }) => ({ column, label }))
	]);

	function sortLabel(row: TDocRow, column: Exclude<TDocColumn, 'date'>): string | null {
		if (column === 'docType') return data.uiLabels.docTypes[row.docType];
		if (column === 'language')
			return row.language ? (data.uiLabels.languages[row.language] ?? row.language) : null;
		if (column === 'typeEditoriale')
			return row.typeEditoriale
				? (edTypes.dict_docEdTypes[row.typeEditoriale as keyof typeof edTypes.dict_docEdTypes]
						?.label_short_singular ?? row.typeEditoriale)
				: null;
		if (column === 'hasAudio') return row.hasAudio ? '1' : '0';
		return row[column] || null;
	}

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
		const compare = (a: string | null, b: string | null, direction = 1) => {
			if (!a && !b) return 0;
			if (!a) return 1;
			if (!b) return -1;
			return a.localeCompare(b, 'it') * direction;
		};
		arr.sort((a, b) => {
			const direction = sortDirection === 'asc' ? 1 : -1;
			const primary =
				sortColumn === 'date'
					? compare(a.dateFrom, b.dateFrom, direction)
					: compare(sortLabel(a, sortColumn), sortLabel(b, sortColumn), direction);
			return primary || (sortColumn === 'name' ? compare(a.dateFrom, b.dateFrom) : cmpName(a, b));
		});
		return arr;
	});
</script>

{#snippet header(column: TDocColumn, label: string)}
	{@const filter = filters.find((item) => item.column === column)}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left hover:bg-background-hover"
			aria-label={`${label}: ordina e filtra`}
		>
			<span>{label}</span>
			<span class="flex items-center gap-1">
				{#if sortColumn === column}
					<i
						class={sortDirection === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}
						aria-hidden="true"
					></i>
					<span class="sr-only"
						>{sortDirection === 'asc' ? 'Ordinamento crescente' : 'Ordinamento decrescente'}</span
					>
				{/if}
				{#if filter?.selected.length}
					<i class="fa-solid fa-filter" aria-hidden="true"></i>
					<span class="sr-only">{filter.selected.length} filtri attivi</span>
				{/if}
				<i class="fa-solid fa-chevron-down text-xs" aria-hidden="true"></i>
			</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content
				side="bottom"
				align="start"
				sideOffset={4}
				class="z-50 max-w-[90vw] min-w-56 rounded-lg border bg-background p-2 text-sm shadow-lg"
			>
				<!-- Filters -->
				{#if filter}
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading class="px-2 py-1 font-semibold"
							>Filtra* per {label.toLocaleLowerCase('it')}</DropdownMenu.GroupHeading
						>
						<DropdownMenu.Item
							class="cursor-pointer rounded px-2 py-2 data-highlighted:bg-background-hover"
							closeOnSelect={false}
							onSelect={() => setSelection(filter.column, [])}
							>{data.uiLabels.all} / Cancella filtro</DropdownMenu.Item
						>
						<DropdownMenu.CheckboxGroup
							value={filter.selected}
							onValueChange={(values) => setSelection(filter.column, values)}
							class="max-h-72 overflow-y-auto"
						>
							{#each filter.options as option (option.value)}
								<DropdownMenu.CheckboxItem
									value={option.value}
									closeOnSelect={false}
									class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 data-highlighted:bg-background-hover"
								>
									{#snippet children({ checked })}
										<i
											class={checked ? 'fa-regular fa-square-check' : 'fa-regular fa-square'}
											aria-hidden="true"
										></i>
										<span class="block first-letter:uppercase">{option.label}</span>
									{/snippet}
								</DropdownMenu.CheckboxItem>
							{/each}
						</DropdownMenu.CheckboxGroup>
					</DropdownMenu.Group>
					<DropdownMenu.Separator class="my-2 border-t" />
				{/if}
				<!-- Sorting -->
				<DropdownMenu.Group>
					{#each ['asc', 'desc'] as direction (direction)}
						<DropdownMenu.Item
							class="cursor-pointer rounded px-2 py-2 data-highlighted:bg-background-hover"
							onSelect={() => {
								sortColumn = column;
								sortDirection = direction === 'asc' ? 'asc' : 'desc';
							}}
						>
							{direction === 'asc' ? 'Crescente' : 'Decrescente'}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
{/snippet}

{#snippet galleryControls()}
	<section aria-label="Filtri">
		<div class="flex flex-wrap gap-2 min-[1280px]:hidden">
			{#each filters as filter (filter.column)}
				<div class="w-max max-w-full text-sm font-semibold">
					{@render header(filter.column, filter.label)}
				</div>
			{/each}
		</div>
		<div class="desktop-filters hidden min-[1280px]:block">
			<Accordion.Root
				type="single"
				bind:value={filtersAccordionValue}
				class="w-full border-y border-y-dark-40 shadow-sm"
			>
				<Accordion.Item value="filters">
					<Accordion.Trigger
						class="group flex w-full items-center justify-center gap-2 p-4 text-left hover:bg-dark-90 focus:ring-2 focus:outline-none data-[state=open]:rounded-b-none data-[state=open]:bg-dark-90"
					>
						<span class="text-base font-bold">Filtri</span>
						{#if filters.some((filter) => filter.selected.length)}
							<i class="fa-solid fa-filter" aria-hidden="true"></i>
							<span class="sr-only">Filtri attivi</span>
						{/if}
						<i
							class={filtersAccordionValue === 'filters' ? 'fa-solid fa-minus' : 'fa-solid fa-plus'}
							aria-hidden="true"
						></i>
					</Accordion.Trigger>
					<Accordion.Content
						class="overflow-hidden bg-background data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
					>
						<div class="edition-content py-4">
							<div class="grid grid-cols-5 grid-rows-[auto_1fr] gap-x-4 gap-y-2">
								{#each filters as filter (filter.column)}
									<div
										class="row-span-2 grid min-w-0 grid-rows-subgrid"
										role="group"
										aria-labelledby={`filter-${filter.column}`}
									>
										<h2 id={`filter-${filter.column}`} class="text-left text-lg font-bold">
											{filter.label}
											{#if filter.selected.length}
												<i class="fa-solid fa-filter" aria-hidden="true"></i>
												<span class="sr-only">{filter.selected.length} filtri attivi</span>
											{/if}
										</h2>
										<div class="flex flex-col gap-1">
											<button
												type="button"
												class="w-fit text-left text-sm underline disabled:no-underline disabled:opacity-60"
												disabled={!filter.selected.length}
												onclick={() => setSelection(filter.column, [])}>{data.uiLabels.all}</button
											>
											{#each filter.options as option (option.value)}
												<label class="flex cursor-pointer items-start gap-2 text-sm">
													<input
														type="checkbox"
														class="mt-1 shrink-0 accent-foreground"
														checked={filter.selected.includes(option.value)}
														onchange={() => toggleFilter(filter, option.value)}
													/>
													<span class="block first-letter:uppercase">{option.label}</span>
												</label>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</section>
	<section class="mt-4 mb-4 flex flex-wrap items-center justify-end gap-2" aria-label="Ordinamento">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="flex w-max items-center gap-2 rounded-full border px-3 py-1 text-left"
			>
				Ordinamento: <span class="font-bold"
					>{sortColumns.find((item) => item.column === sortColumn)?.label}</span
				>
				<i
					class={sortDirection === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}
					aria-hidden="true"
				></i>
				<span class="sr-only">{sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}</span>
				<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					side="bottom"
					align="end"
					sideOffset={4}
					class="z-50 max-w-[90vw] min-w-56 rounded-lg border bg-background p-2 text-sm shadow-lg"
				>
					<DropdownMenu.RadioGroup
						value={sortColumn}
						onValueChange={(value) => {
							const selected = sortColumns.find((item) => item.column === value);
							if (selected) sortColumn = selected.column;
						}}
					>
						{#each sortColumns as { column, label } (column)}
							<DropdownMenu.RadioItem
								value={column}
								class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 data-highlighted:bg-background-hover"
							>
								{#snippet children({ checked })}
									<i
										class={checked ? 'fa-regular fa-circle-dot' : 'fa-regular fa-circle'}
										aria-hidden="true"
									></i>
									{label}
								{/snippet}
							</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
					<DropdownMenu.Separator class="my-2 border-t" />
					<DropdownMenu.RadioGroup
						value={sortDirection}
						onValueChange={(value) => {
							if (value === 'asc' || value === 'desc') sortDirection = value;
						}}
					>
						{#each ['asc', 'desc'] as direction (direction)}
							<DropdownMenu.RadioItem
								value={direction}
								class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 data-highlighted:bg-background-hover"
							>
								{#snippet children({ checked })}
									<i
										class={direction === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}
										aria-hidden="true"
									></i>
									<span>{direction === 'asc' ? 'Crescente' : 'Decrescente'}</span>
									{#if checked}<i class="fa-solid fa-check ml-auto" aria-hidden="true"></i>{/if}
								{/snippet}
							</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	</section>
{/snippet}

<div class="edition-page">
	<div class="edition-content">
		<nav class="flex flex-wrap gap-2" aria-label="Generi testuali">
			{#each Object.values(data.genreTypes) as type (type.slug)}
				{@const isCurrent = type.slug === data.docGenreTypeSlug}
				<a
					href={resolve(`/edition/${type.slug}`)}
					class={['preset-btn-round --sm', isCurrent && '--active']}
					aria-current={isCurrent ? 'page' : undefined}
				>
					{type.label_plural}
				</a>
			{/each}
		</nav>
		<h1 class="h1 my-4">{data.genreTypeLabel}</h1>
		<main class="mt-4">
			<DocListGallery rows={sortedRows} {header} {galleryControls} />
		</main>
		{@render children()}
	</div>
</div>

<style>
	.edition-page {
		container: edition-page / inline-size;
	}

	.edition-content {
		width: 100%;
		max-width: 108rem;
		margin-inline: auto;
		padding-inline: 1rem;
	}

	@media (width >= 640px) {
		.edition-content {
			padding-inline: 1.5rem;
		}
	}

	@media (width >= 1024px) {
		.edition-content {
			padding-inline: 2rem;
		}
	}

	.desktop-filters {
		width: 100cqw;
		margin-inline: calc((100% - 100cqw) / 2);
	}
</style>
