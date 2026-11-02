<script lang="ts">
	import { resolve } from '$app/paths';
	import IIIF_Thumb from '$lib/components/IIIF_Thumb.svelte';
	import { printDateRange } from '$lib/functions/ease_of_use/dateFunctions';

	import { galleryViewType } from '$lib/globals/ui-states.svelte';
	import type { TPublishedKeys } from '$lib/types/documents/TPublishedKeys';
	import type { TUnpublishedKeys } from '$lib/types/documents/TUnpublishedKeys';
	import type { TPosthumKeys } from '$lib/types/documents/TPosthumKeys';
	type TKeys = TPublishedKeys | TUnpublishedKeys | TPosthumKeys;

	let { containerClasses, seq, data } = $props();
</script>

<div class={[containerClasses, 'relative pt-30']}>
	<div class="absolute top-0 right-0 flex gap-2">
		<button
			aria-label="show as gallery"
			class={[
				'preset-btn-round rounded-xl border-none p-2',
				galleryViewType.value === 'gallery' && 'bg-dark-10'
			]}
			onclick={() => {
				galleryViewType.value = 'gallery';
			}}
		>
			<i class="fa-solid fa-table-cells-large text-4xl"></i>
		</button>
		<button
			aria-label="show as list with previews"
			class={[
				'preset-btn-round rounded-xl border-none p-2',
				galleryViewType.value === 'iconList' && 'bg-dark-10'
			]}
			onclick={() => {
				galleryViewType.value = 'iconList';
			}}
		>
			<i class="fa-solid fa-list text-4xl"></i>
		</button>
		<button
			aria-label="show as plain list"
			class={[
				'preset-btn-round rounded-xl border-none p-2',
				galleryViewType.value === 'list' && 'bg-dark-10'
			]}
			onclick={() => {
				galleryViewType.value = 'list';
			}}
		>
			<i class="fa-solid fa-bars text-4xl"></i>
		</button>
	</div>

	<!-- Gallery -->
	{#if galleryViewType.value === 'gallery'}
		<div class={['grid h-full grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-3']}>
			{#each seq?.docs as TKeys[] as docKey (docKey)}
				{@const item = data.docs[docKey as TKeys]}
				<a
					href={resolve(`/${docKey as string}`) + `?seq=${data.seqSlug}`}
					class="flex items-start justify-start gap-5 rounded-card p-5 hover:bg-dark-10 md:flex-col md:items-center md:justify-center"
				>
					{#if item}
						<IIIF_Thumb
							url={item.manuscript?.iiif_urls[0]}
							iiif_imageAPI_width={600}
							classesContainer=""
							classes="h-90"
							imgClasses="h-90"
						/>
						<p class="flex flex-col gap-2 text-left md:text-center">
							<span>{item.name}</span>
							<span>{printDateRange(item.date.from, item.date.to)}</span>
						</p>
					{:else}
						<div class="flex h-50 w-50 flex-col items-center justify-center text-center">
							<p>{docKey}</p>
							<p class="text-muted-foreground">(noch keine Metadaten)</p>
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{:else if galleryViewType.value === 'iconList'}
		<ul class="flex flex-col border-t-2">
			{#each seq?.docs as TKeys[] as docKey (docKey)}
				{@const item = data.docs[docKey as TKeys]}
				<a class="h-full w-full" href={resolve(`/${docKey as string}`) + `?seq=${data.seqSlug}`}>
					<li class="border-b-2 py-4 pl-4 hover:bg-dark-10">
						{#if item}
							<div class="flex gap-5">
								<IIIF_Thumb
									url={item.manuscript?.iiif_urls[0]}
									iiif_imageAPI_width={100}
									classesContainer=""
									classes="h-40"
									imgClasses="h-40"
								/>
								<div class="text-lg">
									<p>{item.name}</p>
									<p>{printDateRange(item.date.from, item.date.to)}</p>
								</div>
							</div>
						{:else}
							<div class="text-lg"><p>{docKey}</p></div>
						{/if}
					</li>
				</a>
			{/each}
		</ul>
	{:else if galleryViewType.value === 'list'}
		<ul class="flex flex-col border-t-2">
			{#each seq?.docs as TKeys[] as docKey (docKey)}
				{@const item = data.docs[docKey as TKeys]}
				<a class="h-full w-full" href={resolve(`/${docKey as string}`) + `?seq=${data.seqSlug}`}>
					<li class="border-b-2 py-4 hover:bg-dark-10">
						{#if item}
							<span>{item.name} <span>{printDateRange(item.date.from, item.date.to)}</span></span>
						{:else}
							<span>{docKey}</span>
						{/if}
					</li>
				</a>
			{/each}
		</ul>
	{/if}
</div>
