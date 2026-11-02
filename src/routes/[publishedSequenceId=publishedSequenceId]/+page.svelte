<script lang="ts">
	import { resolve } from '$app/paths';
	import DocumentsNav from '$lib/components/DocumentsNav.svelte';
	import { ScrollState } from 'runed';
	import type { TSeqPublishedKeys } from '$lib/types/TSequences.js';
	import { doc_sequences as seqAll } from '$lib/data/doc_sequences.json';
	import DocListGallery from '../DocListGallery.svelte';
	import type { TPublishedKeys } from '$lib/types/documents/TPublishedKeys';

	let { data } = $props();

	// Thresholds
	const SHOW_THRESHOLD = 100;
	const HIDE_THRESHOLD = 370; // Must scroll higher to hide

	let isNavHidden = $state(false);

	// React to scroll changes
	$effect(() => {
		const y = scroll.y; // Replace with your actual scroll value source

		if (y > HIDE_THRESHOLD) {
			isNavHidden = true;
		} else if (y < SHOW_THRESHOLD) {
			isNavHidden = false;
		}
	});

	// Scroll State
	const scroll = new ScrollState({
		element: () => document
	});

	// Sequence shorthand
	const seq = $derived(data.seqSlug ? data.sequences[data.seqSlug] : undefined);
</script>

<!-- Series -->
{#snippet keyList(keys: (TSeqPublishedKeys | 'separator')[])}
	<div class={['preset-btn-list --spacing-sm items-center justify-center']}>
		{#each keys as key (key)}
			{#if key.includes('separator')}
				<div class="px-4 text-xl text-background-contrast">/</div>
			{:else}
				<a
					class={['preset-btn-round --sm duration-200', data.seqSlug === key && '--active']}
					href={resolve(`/${key as string}`)}>{data.sequences[key as TSeqPublishedKeys].name}</a
				>
			{/if}
		{/each}
	</div>
{/snippet}

<div
	data-dom="topStickyElement"
	class={['sticky top-0 z-100 -mt-10 flex flex-col gap-2 bg-background px-10 pt-10']}
>
	<!-- Navigation -->
	<DocumentsNav docType="published" />
	<h1 class={['h3 mb-5 text-center whitespace-nowrap transition-all duration-200']}>
		{@html data.seqSlug ? seq?.preamble : ''}
	</h1>

	<!-- Series Keys -->
	<div class={['hidden lg:block']}>
		<div
			class={[
				'transition-opacity duration-500',
				isNavHidden ? 'h-0 overflow-y-hidden opacity-0' : 'h-0 lg:h-max'
			]}
		>
			{@render keyList(Object.keys(seqAll.published) as TSeqPublishedKeys[])}
		</div>
	</div>
</div>

<div class="px-10">
	<!-- Intro -->
	<div class={['mx-auto mt-5 mb-30 flex max-w-300 flex-col gap-5 px-10 lg:mt-30']}>
		<h5 class="h5">Überblickskommentar</h5>
		<p>
			{@html seq && 'intro' in seq
				? seq.intro
				: '' +
					' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}
		</p>
	</div>

	<!-- Documents List / Gallery -->
	<DocListGallery containerClasses="h-full" {data} {seq}></DocListGallery>
</div>
