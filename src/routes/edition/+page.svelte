<script lang="ts">
	import { resolve } from '$app/paths';
	import { dict_docGenreTypes } from '$lib/dictionaries/dict_docGenreTypes.json';
</script>

<div class={['z-100 mx-auto flex max-w-300 flex-col gap-10 bg-background px-10']}>
	<!-- Navigation -->
	<h1 class={['h1 text-center whitespace-nowrap transition-all duration-200']}>Documenti</h1>

	<div class={['flex flex-col gap-5']}>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat.
		</p>
	</div>

	<div class={['grid grid-cols-1 md:grid-cols-2 gap-10 py-5']}>
		<!-- Posthumous -->
		{#each Object.keys(dict_docGenreTypes) as genreKey}
			<div class="flex flex-col gap-7">
				<h2 class="h2">{dict_docGenreTypes[genreKey].label_plural}</h2>
				<p class="clamp-5">{dict_docGenreTypes[genreKey].description}</p>
				<div class="flex flex-wrap justify-start gap-2">
					<a class="preset-btn-round --normal" href={resolve(`/edition/${dict_docGenreTypes[genreKey].slug}`)}>
						<i class="fa-arrow-right fa-solid mr-4" aria-hidden="true"></i>See documents</a>
				</div>
			</div>
		{/each}

	</div>
</div>
