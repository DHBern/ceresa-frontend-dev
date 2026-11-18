<script lang="ts">
	import CETEI from 'CETEIcean';
	import { behaviors, removeNotesFromMaintext, extractPage } from '$lib/CETEIcean/behaviors';
	import { attachTextInteractions } from '$lib/functions/interactive_edendum/handleInteractiveText';

	const c = new CETEI();
	let { textData, page } = $props();

	const setupCustomElements = (element: HTMLElement) => {
		c.addBehaviors(behaviors(document));

		let processed = false;
		const attachInteractions = () => {
			if (!element.querySelector('tei-rs, .footnote, .note-mark')) return;
			if (!processed) {
				c.processPage();
				processed = true;
			}
			attachTextInteractions(element);
		};

		const observer = new MutationObserver(attachInteractions);
		observer.observe(element, { childList: true, subtree: true });
		attachInteractions();
		return () => observer.disconnect();
	};

	let serializedWithoutNotes: string | null = $state(null);
	$effect(() => {
		// Run this in an effect to guarantee it only runs on mount.
		serializedWithoutNotes = removeNotesFromMaintext(extractPage(textData.serialized, page));
	});
</script>

<div
	data-textflow="diplomatic"
	class="relative mx-auto max-w-200 overflow-y-auto pl-5"
	{@attach setupCustomElements}
>
	{@html serializedWithoutNotes}
</div>
