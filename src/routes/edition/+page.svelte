<script lang="ts">
	import { resolve } from '$app/paths';
	import { dict_docGenreTypes } from '$lib/dictionaries/dict_docGenreTypes.json';
</script>

<div class={['z-100 mx-auto flex max-w-300 flex-col bg-background px-10']}>
	<!-- Title and Intro -->
	<h1 class={['h1 text-center whitespace-nowrap transition-all duration-200']}>Edizione</h1>
	<p class="mx-auto max-w-prose">
		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
		labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
		laboris nisi ut aliquip ex ea commodo consequat.
	</p>

	<!-- Genre Sections -->
	<section class={['mt-15 grid grid-cols-1 gap-y-20 md:gap-x-40 2xl:gap-x-20 2xl:grid-cols-3 py-5 md:grid-cols-2']}>
		<!-- Posthumous -->
		{#each Object.values(dict_docGenreTypes) as genre}
			<div class="flex max-w-prose flex-col">
				<h2 class="h4">{genre.label_plural}</h2>
				<p class="line-clamp-5">{genre.description}</p>
				<div class="mt-5 flex flex-wrap justify-start gap-2">
					<a
						class="preset-btn-round --normal"
						href={resolve(`/edition/${genre.slug}`)}
					>
						<i class="fa-arrow-right fa-solid mr-4" aria-hidden="true"></i>Vedi documenti</a
					>
				</div>
			</div>
		{/each}
	</section>
</div>
