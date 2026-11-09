<script>
	import { resolve } from '$app/paths';
</script>

<div class="mx-auto mt-13 flex w-full max-w-300 flex-col items-center justify-center">
	<h1 class="h1">
		<strong>Arcipelago Ceresa:</strong> Edizione digitale degli inediti, dispersi, postumi. Gender, plurilinguismo,
		transnazionalità
	</h1>
	<div class="mt-0 -rotate-3 bg-green-500 px-15 py-2 text-center font-bold text-white">
		<h2 class="text-6xl">Versione Alpha</h2>
		<p class="mt-5 text-4xl">Lavori in corso!</p>
	</div>
</div>
<div class="mx-auto mt-13 w-full max-w-300">
	<h2 class="h2">Documenti appartenenti al prototipo</h2>

	<h4 class="h4 mt-10 tracking-wide text-neutral-500">Opere postume</h4>
	<ul class="mt-2 divide-y divide-neutral-200">
		<li>
			<a
				href={resolve('/posthum_0003')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Anima [1] (Piccolo dizionario) A-1-b_6-2_AC001a
			</a>
		</li>
		<li>
			<a
				href={resolve('/posthum_0004')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Anima [2] (Piccolo dizionario) A-1-b_6-2_AC001b
			</a>
		</li>
		<li>
			<a
				href={resolve('/posthum_0055')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Anima [3] (Piccolo dizionario) A-1-b_6-5_AC006
			</a>
		</li>
		<li>
			<a
				href={resolve('/posthum_0050')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Aborto [1] (Piccolo dizionario) A-1-b_6-5_AC003a
			</a>
		</li>
		<li>
			<a
				href={resolve('/posthum_0051')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Aborto [2] (Piccolo dizionario) A-1-b_6-5_AC003b
			</a>
		</li>
		<li>
			<a
				href={resolve('/posthum_0052')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Aborto [3] (Piccolo dizionario) A-1-b_6-5_AC003c
			</a>
		</li>
	</ul>

	<h4 class="h4 mt-10 tracking-wide text-neutral-500">Opere edite</h4>
	<ul class="mt-2 divide-y divide-neutral-200">
		<li>
			<a
				href={resolve('/published_0011')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Carson McCullers. Eine junge amerikanische Schriftstellerin setzt sich durch (A-5-a_13)
				<span class="text-sm text-neutral-400">(newspaper article)</span>
			</a>
		</li>
		<li>
			<a
				href={resolve('/published_0001')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Gli altri, prima parte (A-1-a_1-4)
				<span class="text-sm text-neutral-400">(short story in a journal)</span>
			</a>
		</li>
	</ul>

	<h4 class="h4 mt-10 tracking-wide text-neutral-500">Opere inedite</h4>
	<ul class="mt-2 divide-y divide-neutral-200">
		<li>
			<a
				href={resolve('/unpublished_0016')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Eloise (ultime) (A-1-b_7-8) à 3ff. <span class="text-sm text-neutral-400">(typoscript)</span
				>
			</a>
		</li>
		<li>
			<a
				href={resolve('/unpublished_0001')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Prefazione per "Gli altri" (A-1-a_1-1) à 2ff.
				<span class="text-sm text-neutral-400">(manuscript)</span>
			</a>
		</li>
		<li>
			<a
				href={resolve('/unpublished_0017')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				Vittorini et la nouvelle prose italienne (A-5-b_1) à 5ff.
				<span class="text-sm text-neutral-400">(typoscript, many manuscript corrections)</span>
			</a>
		</li>
		<li>
			<a
				href={resolve('/unpublished_0007')}
				class="hover:text-primary block py-2 text-neutral-700 transition-colors"
			>
				La strega (A-1-b_1-2) à 4ff. <span class="text-sm text-neutral-400">(manuscript)</span>
			</a>
		</li>
	</ul>
</div>
