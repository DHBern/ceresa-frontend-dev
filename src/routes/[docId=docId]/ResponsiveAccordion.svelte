<script>
	import { Accordion } from 'bits-ui';

	const { titleMeta = 'Metadaten', metadataContent } = $props();
	let value = $state('');
</script>

<div class="mt-10 flex flex-col">
	<!-- Metadata Accordion -->
	<Accordion.Root type="single" bind:value class="w-full border-y border-y-dark-40 shadow-sm">
		<Accordion.Item value="meta">
			<Accordion.Trigger
				class="group flex w-full items-center justify-center gap-2 p-4 text-left hover:bg-dark-90 focus:ring-2 focus:outline-none data-[state=open]:rounded-b-none data-[state=open]:bg-dark-90"
			>
				<span class="font text-base font-bold">{titleMeta}</span>
				<span class="duration-100 group-data-[state=open]:rotate-180">
					{#if value === 'meta'}
						<i class={['fa-solid fa-minus']}></i>
					{:else}
						<i class={['fa-solid fa-plus']}></i>
					{/if}
				</span>
			</Accordion.Trigger>

			<Accordion.Content
				class="max-h-[40vh] overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
			>
				<div class="h-full overflow-hidden bg-background p-4">
					{@render metadataContent()}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
