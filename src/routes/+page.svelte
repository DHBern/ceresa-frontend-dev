<script>
	import { resolve } from '$app/paths';
</script>

<div class="overflow-hidden">
	<div class="mx-auto mt-13 flex w-full max-w-300 flex-col items-center justify-center">
		<h1 class="h1">
			<strong>Arcipelago Ceresa:</strong> Edizione digitale degli inediti, dispersi, postumi. Gender,
			plurilinguismo, transnazionalità
		</h1>
		<div class="mt-0 -rotate-3 bg-green-500 px-915 py-3 text-center font-bold text-white">
			<h2 class="text-6xl">
				Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;
			</h2>
			<p class="mt-5 text-4xl">
				Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;
			</p>
		</div>
	</div>

	<a
		href="#links_prototypes"
		class="mx-auto mt-10 flex w-max max-w-170 items-center rounded-xl border-4 border-purple-200 px-10 py-8 text-center text-2xl font-bold uppercase"
	>
		<i class="fa-solid fa-arrow-down mx-4"></i>
		<span> Link ai prototipi </span>
		<i class="fa-solid fa-arrow-down mx-4"></i>
	</a>

	<div class="mx-auto mt-13 flex w-full max-w-300 flex-col items-center justify-center">
		<p>
			Il progetto Arcipelago Ceresa intende realizzare un’edizione digitale degli scritti inediti,
			dispersi e postumi della scrittrice italo-svizzera Alice Ceresa (1923-2001), sviluppando
			contestualmente nuove indagini critiche sulla sua opera.
		</p>
		<p>
			Figura di straordinaria originalità nel panorama letterario del Novecento, Alice Ceresa si
			distingue per il suo plurilinguismo e per un’attività culturale che si dispiega in un
			orizzonte transnazionale. Anticipatrice di temi centrali nel dibattito queer e gender, conduce
			una ricerca formale instancabilmente sperimentale che la colloca tra le voci più innovative
			della sua generazione. Il suo archivio custodisce numerosi testi inediti, mentre il corpus
			degli scritti editi rimane ancora oggi in larga parte difficilmente accessibile al pubblico
			contemporaneo.
		</p>
		<p>
			L’edizione digitale, realizzata in stretta collaborazione con il Data Science Lab (DSL)
			dell’Università di Berna e l’Archivio svizzero di letteratura (ASL), renderà disponibile non
			solo una ricca selezione di scritti inediti e dispersi, ma anche una nuova versione dei testi
			postumi, includendo inoltre letture radiofoniche dell’epoca.
		</p>
		<p>
			Il lavoro editoriale si accompagnerà a quattro progetti di ricerca dedicati ad aspetti ancora
			poco esplorati della produzione ceresiana, ma di particolare rilievo per gli studi
			contemporanei. I progetti indagheranno, da un lato, il plurilinguismo e la dimensione
			transnazionale dell’autrice; dall’altro, la relazione che si istituisce nella sua scrittura
			tra la decostruzione dei generi letterari e quella dei ruoli di genere.
		</p>
	</div>

	<div id="links_prototypes" class="mx-auto mt-13 w-full max-w-300">
		<h2 class="h2">Documenti appartenenti al prototipo</h2>

		<h4 class="h4 mt-10 tracking-wide">Opere postume</h4>
		<ul class="mt-2 divide-y divide-neutral-200">
			<li>
				<a
					href={resolve('/posthum_A-1-b_6-2_AC001_a')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Anima [1] (Piccolo dizionario) <span class="text-neutral-400">(dattiloscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_6-2_AC001_b')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Anima [2] (Piccolo dizionario) <span class="text-neutral-400"
						>(dattiloscritto + audio)</span
					>
				</a>
			</li>
			<li>
				<a
					href={resolve('/posthum_A-1-b_6-5_AC003_a')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Aborto [1] (Piccolo dizionario) <span class="text-neutral-400">(manoscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_6-5_AC003_b')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Aborto [2] (Piccolo dizionario) <span class="text-neutral-400"
						>(dattiloscritto + audio)</span
					>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_6-5_AC003_c')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Aborto [3] (Piccolo dizionario) <span class="text-neutral-400">(manoscritto)</span>
				</a>
			</li>
		</ul>

		<h4 class="h4 mt-10 tracking-wide">Opere edite</h4>
		<ul class="mt-2 divide-y divide-neutral-200">
			<li>
				<a
					href={resolve('/published_A-5-a_13')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Carson McCullers. Eine junge amerikanische Schriftstellerin setzt sich durch
					<span class="text-neutral-400">(testo a stampa + traduzione editoriale)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/published_A-1-a_1-4')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Gli altri, prima parte
					<span class="text-neutral-400">(testo a stampa)</span>
				</a>
			</li>
		</ul>

		<h4 class="h4 mt-10 tracking-wide">Opere inedite</h4>
		<ul class="mt-2 divide-y divide-neutral-200">
			<li>
				<a
					href={resolve('/unpublished_A-1-b_7-8')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Eloise (ultime) <span class="text-neutral-400">(dattiloscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-a_1-1')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Prefazione per "Gli altri"
					<span class="text-neutral-400">(manoscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-5-b_1')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					Vittorini et la nouvelle prose italienne
					<span class="text-neutral-400">(dattiloscritto + traduzione editoriale)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_1-2')}
					class="hover:text-primary block py-2 text-neutral-700 transition-colors"
				>
					La strega <span class="text-sm text-neutral-400">(manoscritto)</span>
				</a>
			</li>
		</ul>
	</div>
</div>
