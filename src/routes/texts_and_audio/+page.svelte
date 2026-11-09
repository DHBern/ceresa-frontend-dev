<script lang="ts">
	import { resolve } from '$app/paths';
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

	<div class={['grid grid-cols-3 gap-10 py-5']}>
		<!-- Posthumous -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Opere postume</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				<a class="preset-btn-round --normal" href={resolve('/posthumous')}>Opere postume</a>
			</div>
		</div>

		<!-- Unpublished -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Opere inedite</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				<a class="preset-btn-round --normal" href={resolve('/unpublished')}>Opere inedite</a>
			</div>
		</div>

		<!-- Published -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Opere edite</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				<a class="preset-btn-round --normal" href={resolve('/published')}>Opere edite</a>
			</div>
		</div>

		<!-- Piccolo Dizionario -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Piccolo Dizionario</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				<a class="preset-btn-round --normal" href={resolve('/piccolo_dizionario')}
					>Piccolo Dizionario</a
				>
			</div>
		</div>

		<!-- Audio Documents -->
		<div class="flex flex-col gap-7">
			<h2 class="h2 text-center">Documenti sonori</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				<a class="preset-btn-round --normal" href={resolve('/audio_documents')}>Documenti sonori</a>
			</div>
		</div>
	</div>
</div>
