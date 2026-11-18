<script lang="ts">
	import CETEI from 'CETEIcean';
	import { behaviors, removeNotesFromMaintext, extractPage } from '$lib/CETEIcean/behaviors';
	import { attachTextInteractions } from '$lib/functions/interactive_edendum/handleInteractiveText';
	import { browser } from '$app/environment';
	import type { ProcessedTEI } from './processTEI';

	const c = new CETEI();
	let {
		textData,
		page,
		openDrawer
	}: { textData: ProcessedTEI | null; page: number; openDrawer: () => void } = $props();

	const setupCustomElements = (element: HTMLElement) => {
		c.addBehaviors(behaviors(document));
		c.processPage();
		attachTextInteractions(element, openDrawer);
	};

	let serializedWithoutNotes = $derived(
		browser && textData ? removeNotesFromMaintext(extractPage(textData.serialized, page)) : null
	);
</script>

{#if serializedWithoutNotes !== null}
	{#key serializedWithoutNotes}
		<div
			data-textflow="diplomatic"
			class="relative mx-auto max-w-200 overflow-y-auto pl-5"
			{@attach setupCustomElements}
		>
			{@html serializedWithoutNotes}
		</div>
	{/key}
{/if}
