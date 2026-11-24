<script>
	import { resolve } from '$app/paths';
</script>

<main class="overflow-hidden px-5 text-base">
	<section class="mx-auto mt-13 flex w-full flex-col items-center justify-center">
		<h1 class="max-w-300 font-serif font-bold">
			<span class="h1 text-green-500">Arcipelago Ceresa. </span><br />
			<span class="h2">
				Edizione digitale degli inediti, dispersi, postumi. Gender, plurilinguismo, transnazionalità
			</span>
		</h1>
		<!-- </section> -->
		<!-- <section> -->
		<div class="mt-1 -rotate-3 bg-green-500 px-915 py-3 text-center font-bold text-white">
			<h2 class="md:text-6xl text-3xl">
				Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;Versione&nbsp;Alpha&nbsp;&nbsp;
			</h2>
			<p class="md:mt-5 mt-2 md:text-4xl text-xl">
				Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;Lavori&nbsp;in&nbsp;corso&nbsp;&nbsp;!!&nbsp;&nbsp;
			</p>
		</div>
	</section>
	<!-- Shortcuts -->
	<section class="mx-auto mt-20 flex max-w-300 max-w-full max-w-max flex-wrap justify-center gap-5">
		<div class="flex flex-wrap items-center gap-5">
			<a
				href={resolve('/edition')}
				class="mx-auto flex w-max md:max-w-170 max-w-80 items-center rounded-xl border-4 md:border-6 border-green-500 p-4 md:px-10 md:py-8 text-center text-xs md:text-2xl font-bold uppercase"
			>
				<i class="fa-solid fa-arrow-right mr-4"></i>
				<span> Edizione </span>
			</a>
			<a
				href={resolve('/register')}
				class="mx-auto flex w-max md:max-w-170 max-w-80 items-center rounded-xl border-4 md:border-6 border-green-500 p-4 md:px-10 md:py-8 text-center text-xs md:text-2xl font-bold uppercase"
			>
				<i class="fa-solid fa-arrow-right mr-4"></i>
				<span> Registri </span>
			</a>
		</div>
		<a
			href="#links_prototypes"
			class="mx-auto flex w-max md:max-w-170 max-w-80 items-center rounded-xl border-4 md:border-6 border-green-500 p-4 md:px-10 md:py-8 text-center text-xs md:text-2xl font-bold uppercase"
		>
			<i class="fa-solid fa-arrow-down mx-4"></i>
			<span> Link ai prototipi </span>
			<i class="fa-solid fa-arrow-down mx-4"></i>
		</a>
	</section>

	<!-- Introduction -->
	<section class="mx-auto mt-13 text-xs md:text-sm max-w-300">
		<p>
			Il progetto Arcipelago Ceresa intende realizzare un’edizione digitale degli scritti inediti,
			dispersi e postumi della scrittrice italo-svizzera Alice Ceresa (1923&ndash;2001), sviluppando
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
	</section>

	<section id="links_prototypes" class="mx-auto mt-13 w-full max-w-300">
		<h2 class="h2">Prototipi</h2>

		<h4 class="h4 mt-10 tracking-wide">Opere postume</h4>
		<ul class="mt-2 divide-y divide-neutral-200">
			<li>
				<a
					href={resolve('/posthum_A-1-b_6-2_AC001_a')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Anima [1] (Piccolo dizionario) <span class="text-muted-foreground">(dattiloscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_6-2_AC001_b')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Anima [2] (Piccolo dizionario) <span class="text-muted-foreground"
						>(dattiloscritto + audio)</span
					>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_6-5_AC003_b')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Aborto [1] (Piccolo dizionario) <span class="text-muted-foreground"
						>(dattiloscritto + audio)</span
					>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_6-5_AC003_c')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Aborto [2] (Piccolo dizionario) <span class="text-muted-foreground">(manoscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/posthum_A-1-b_6-5_AC003_a')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Aborto (liberalizzazione del) (Piccolo dizionario) <span class="text-muted-foreground"
						>(manoscritto)</span
					>
				</a>
			</li>
		</ul>

		<h4 class="h4 mt-10 tracking-wide">Opere edite</h4>
		<ul class="mt-2 divide-y divide-neutral-200">
			<li>
				<a
					href={resolve('/published_A-5-a_13')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Carson McCullers. Eine junge amerikanische Schriftstellerin setzt sich durch
					<span class="text-muted-foreground">(testo a stampa + traduzione editoriale)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/published_A-1-a_1-4')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Gli altri, prima parte
					<span class="text-muted-foreground">(testo a stampa)</span>
				</a>
			</li>
		</ul>

		<h4 class="h4 mt-10 tracking-wide">Opere inedite</h4>
		<ul class="mt-2 divide-y divide-neutral-200">
			<li>
				<a
					href={resolve('/unpublished_A-1-b_7-8')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Eloise (ultime) <span class="text-muted-foreground">(dattiloscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-a_1-1')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Prefazione per "Gli altri"
					<span class="text-muted-foreground">(manoscritto)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-5-b_1')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					Vittorini et la nouvelle prose italienne
					<span class="text-muted-foreground">(dattiloscritto + traduzione editoriale)</span>
				</a>
			</li>
			<li>
				<a
					href={resolve('/unpublished_A-1-b_1-2')}
					class="hover:text-primary block py-2 text-foreground transition-colors"
				>
					La strega <span class="text-sm text-muted-foreground">(manoscritto)</span>
				</a>
			</li>
		</ul>
	</section>
</main>
