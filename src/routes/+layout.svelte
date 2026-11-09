<script lang="ts">
	import '@fortawesome/fontawesome-free/css/solid.min.css';
	import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from './Nav.svelte';
	import { asset } from '$app/paths';
	import { ModeWatcher } from 'mode-watcher';
	import { currentlyPlayingAudio, isAudioPlayerVisible } from '$lib/globals/ui-states.svelte';

	let { children } = $props();

	import AudioPlayer from './AudioPlayer.svelte';
	import { slide } from 'svelte/transition';
</script>

<ModeWatcher defaultMode="dark" />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex flex-col">
	<Nav />
</div>

<div class="min-h-screen pt-10 pb-20">{@render children()}</div>

{#if isAudioPlayerVisible.value}
	<aside
		in:slide={{ duration: 300 }}
		out:slide={{ duration: 300 }}
		class="fixed bottom-0 z-9999999999 w-screen bg-foreground"
	>
		{#if currentlyPlayingAudio.value}
			<AudioPlayer />
		{/if}
	</aside>
{/if}
<footer
	class="flex min-h-30 flex-col items-center justify-center gap-5 bg-dark-90 p-10 text-background-contrast"
>
	<p class="font-serif text-lg font-bold">Questo sito web è attualmente in versione alpha.</p>
	<p>
		<a
			class=" underline"
			href="https://arcipelago-ceresa.digitaleditions.ch/"
			target="blank"
			rel="noopener noreferrer">arcipelago-ceresa.digitaleditions.ch</a
		>
	</p>

	<div class="mt-10 flex w-full justify-around gap-10">
		<a href="https://data.snf.ch/grants/grant/10000500">
			<img class="h-16 object-contain" src={asset('/logos/logo-snf.png')} alt="logo" />
		</a>
		<a href="https://www.roma.unibe.ch/">
			<img
				class="h-16 object-contain"
				width="100px;"
				src={asset('/logos/logo-unibe.svg')}
				alt="logo"
			/>
		</a>
		<a href="https://www.ds.uzh.ch">
			<img class="h-16 object-contain" src={asset('/logos/logo-uzh.png')} alt="logo" />
		</a>
		<a href="https://dh.unibe.ch">
			<img
				class="h-16 object-contain"
				width="100px;"
				src={asset('/logos/logo-dh-unibe.png')}
				alt="logo"
			/>
		</a>
		<a href="https://dsl.unibe.ch">
			<img
				class="h-16 object-contain"
				width="100px;"
				src={asset('/logos/logo-dsl.png')}
				alt="logo"
			/>
		</a>
	</div>
</footer>
