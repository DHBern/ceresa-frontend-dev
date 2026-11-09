<script>
	import { resolve } from '$app/paths';
</script>

<div class="mx-auto mt-13 flex w-full max-w-300 flex-col items-center justify-center">
	<h1 class="h1">
		<strong>Arcipelago Ceresa:</strong> Digital Edition of Unpublished, Dispersed, and Posthumous Texts.
		Gender, Multilingualism, Transnationality
	</h1>
	<h2 class="mt-0 -rotate-3 text-6xl font-bold text-green-500">Alpha-Version</h2>
	<p class="mt-5 -rotate-3 text-4xl font-bold text-green-500">Work in Progress!</p>
</div>

<div class="mx-auto mt-13 w-full max-w-300">
	<h2 class="h2">Documents for Prototype</h2>
	<h4 class="h4 mt-10">Posthumous</h4>
	<ul>
		<li><a href={resolve('/posthum_0003')}>Anima [1] (Piccolo dizionario) A-1-b_6-2_AC001a</a></li>
		<li><a href={resolve('/posthum_0004')}>Anima [2] (Piccolo dizionario) A-1-b_6-2_AC001b</a></li>
		<li><a href={resolve('/posthum_0055')}>Anima [3] (Piccolo dizionario) A-1-b_6-5_AC006</a></li>
		<li><a href={resolve('/posthum_0050')}>Aborto [1] (Piccolo dizionario) A-1-b_6-5_AC003a</a></li>
		<li><a href={resolve('/posthum_0051')}>Aborto [2] (Piccolo dizionario) A-1-b_6-5_AC003b</a></li>
		<li><a href={resolve('/posthum_0052')}>Aborto [3] (Piccolo dizionario) A-1-b_6-5_AC003c</a></li>
	</ul>

	<h4 class="h4 mt-10">Edited</h4>
	<ul>
		<li>
			<a href={resolve('/published_0011')}>
				Carson McCullers. Eine junge amerikanische Schriftstellerin setzt sich durch (A-5-a_13)
				(newspaper article)
			</a>
		</li>
		<li>
			<a href={resolve('/published_0001')}
				>Gli altri, prima parte (A-1-a_1-4) (short story in a journal)</a
			>
		</li>
	</ul>
	<h4 class="h4 mt-10">Unpublished</h4>
	<ul>
		<li>
			<a href={resolve('/unpublished_0016')}>Eloise (ultime) (A-1-b_7-8) à 3ff. (typoscript)</a>
		</li>
		<li>
			<a href={resolve('/unpublished_0001')}
				>Prefazione per “Gli altri” (A-1-a_1-1) à 2ff. (manuscript)</a
			>
		</li>
		<li>
			<a href={resolve('/unpublished_0017')}>
				Vittorini et la nouvelle prose italienne (A-5-b_1) à 5ff. (typoscript, many manuscript
				corrections)
			</a>
		</li>
		<li><a href={resolve('/unpublished_0007')}>La strega (A-1-b_1-2) à 4ff. (manuscript)</a></li>
	</ul>
</div>
