<script lang="ts">
	import {
		currentFilesAudio,
		currentlyPlayingAudio,
		isAudioPlayerVisible
	} from '$lib/globals/ui-states.svelte';
	import { Slider } from 'bits-ui';

	// Props
	let audioSrc = $derived(
		(currentlyPlayingAudio.value?.audioMaterial?.path || '') +
			'/' +
			(currentlyPlayingAudio.value?.audioMaterial?.filename || '')
	);
	let chapters = $derived(currentlyPlayingAudio.value?.audioMaterial.metadata.chapters);

	// State
	let isPlaying = $state(false);
	let duration = $state(0);
	let currentChapterIndex = $state(0);
	let isDragging = $state(false);
	let sliderValue = $state.raw(0);
	let audioElement: HTMLAudioElement | null = $state(null);

	// Derived
	let currentChapter = $derived(chapters?.[currentChapterIndex] ?? null);

	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Which chapter does a given time belong to?
	function chapterIndexForTime(time: number) {
		if (!chapters) return 0;
		for (let i = chapters.length - 1; i >= 0; i--) {
			if (time >= chapters[i].time) return i;
		}
		return 0;
	}

	// Central seek: moves the audio element, the slider and the chapter state
	function seekTo(time: number, { play = true } = {}) {
		if (!audioElement) return;
		audioElement.currentTime = time;
		sliderValue = time;
		currentChapterIndex = chapterIndexForTime(time);
		if (play && !isPlaying) {
			isPlaying = true;
			audioElement.play().catch(() => (isPlaying = false));
		}
	}

	// --- audio element listeners (named, so cleanup actually works) ---
	function onTimeUpdate() {
		if (isDragging || !audioElement) return;
		const t = audioElement.currentTime;
		// light throttle: only write state if it moved noticeably
		if (Math.abs(t - sliderValue) > 0.2) sliderValue = t;
		const idx = chapterIndexForTime(t);
		if (idx !== currentChapterIndex) currentChapterIndex = idx;
	}
	function onLoadedMetadata() {
		if (audioElement) duration = audioElement.duration;
	}
	function onEnded() {
		isPlaying = false;
	}

	$effect(() => {
		const el = audioElement;
		if (!el) return;
		el.src = audioSrc;
		el.addEventListener('timeupdate', onTimeUpdate);
		el.addEventListener('loadedmetadata', onLoadedMetadata);
		el.addEventListener('ended', onEnded);
		return () => {
			el.removeEventListener('timeupdate', onTimeUpdate);
			el.removeEventListener('loadedmetadata', onLoadedMetadata);
			el.removeEventListener('ended', onEnded);
		};
	});

	// --- controls ---
	function pauseAudio() {
		if (!audioElement) return;
		audioElement.pause();
		isPlaying = false;
	}
	function playAudio() {
		if (!audioElement) return;
		audioElement.play().catch(() => {});
		isPlaying = true;
	}
	function prevChapter() {
		if (currentChapterIndex > 0) seekTo(chapters[currentChapterIndex - 1].time);
	}
	function nextChapter() {
		if (currentChapterIndex < chapters.length - 1) seekTo(chapters[currentChapterIndex + 1].time);
	}

	// --- effects ---
	// Play if audioFile changed
	$effect(() => {
		currentlyPlayingAudio.value?.slug; // listen to changes here
		playAudio();
	});
</script>

<!-- Close button -->
<button
	class="absolute top-3 right-3 z-99999999999 bg-foreground text-lg text-black"
	aria-label="close audio player"
	onclick={() => {
		isAudioPlayerVisible.value = false;
	}}><i class="fa-solid fa-xmark"></i></button
>

<div class="relative w-full px-5 pt-2 [--heightOfButton:35px]">
	{#if currentFilesAudio.value?.slug && currentFilesAudio.value?.slug !== currentlyPlayingAudio.value?.slug}
		<button
			class="absolute -top-[calc(var(--heightOfButton)*3/4)] left-[50%] z-1 mx-auto h-(--heightOfButton) w-max translate-x-[-50%] rounded-t-xl bg-foreground px-10 text-center text-sm text-black underline"
			aria-label="close audio player"
			onclick={() => {
				currentlyPlayingAudio.value = currentFilesAudio.value;
			}}>Switch to visible document's audio</button
		>
	{/if}
	<div class="z-5 text-xs text-background">
		<p><strong>{currentlyPlayingAudio.value?.metadata.title}</strong></p>
		<p>
			<strong>Linked Documents: </strong>
			{#each ['posthum', 'unpublished', 'published', 'audio'] as const as type (type)}
				{@const linkedDocs = currentlyPlayingAudio.value?.crossReferences?.linkedDocuments?.[type]}
				{#each linkedDocs as linkedDoc (linkedDoc)}
					<a href={linkedDoc} class="mx-2">{linkedDoc}</a>
				{/each}
			{/each}
		</p>
	</div>
	<div class="relative flex w-full items-center justify-between space-y-3 rounded-lg p-2">
		<!-- Control buttons -->
		<div class="flex items-center justify-center gap-3">
			<button
				onclick={() => {
					if (isPlaying) pauseAudio();
					else playAudio();
				}}
				class="rounded-full bg-purple-600 p-5 text-2xl text-white transition-colors hover:bg-purple-500"
				title={isPlaying ? 'Pause' : 'Play'}
			>
				{#if isPlaying}
					<i class="fa-solid fa-pause text-foreground"></i>
				{:else}
					<i class="fa-solid fa-play text-foreground"></i>
				{/if}
			</button>
			<button
				onclick={prevChapter}
				disabled={currentChapterIndex === 0}
				class="rounded-full bg-gray-400 p-2 transition-colors not-disabled:hover:bg-purple-200 disabled:cursor-default disabled:opacity-50"
				title="Previous Chapter"
			>
				<i class="fa-solid fa-backward text-foreground"></i></button
			>

			<button
				onclick={nextChapter}
				disabled={currentChapterIndex >= chapters.length - 1}
				class="rounded-full bg-gray-400 p-2 transition-colors not-disabled:hover:bg-purple-200 disabled:cursor-default disabled:opacity-50"
				title="Next Chapter"
			>
				<i class="fa-solid fa-forward text-foreground"></i>
			</button>
		</div>

		<!-- Position Indicator and Chapters -->
		<div class="flex w-full justify-center">
			<div class="mx-10 w-full max-w-200">
				<!-- Header: chapter name + time -->
				<div class="flex w-full items-center justify-between">
					<span class="truncate text-sm font-medium">
						{currentChapter?.chapName ?? 'No chapter'}
					</span>
					<span class="text-xs text-gray-400">
						{formatTime(sliderValue)} / {formatTime(duration)}
					</span>
				</div>
				<!-- Slider with chapter markers -->
				<div class="pb-4">
					<Slider.Root
						type="single"
						bind:value={sliderValue}
						max={duration || 1}
						step={0.1}
						onpointerdown={() => (isDragging = true)}
						onValueCommit={(v) => {
							isDragging = false;
							seekTo(v);
						}}
						class="relative flex w-full touch-none items-center select-none"
						trackPadding={3}
					>
						{#snippet children()}
							<span
								class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-gray-300"
							>
								<Slider.Range class="absolute h-full bg-purple-600" />
							</span>
							<Slider.Thumb
								index={0}
								class="block size-[18px] cursor-pointer rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-purple-600 focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:outline-hidden"
							/>
						{/snippet}
					</Slider.Root>
					<!-- Chapter markers: clickable, positioned proportionally along the track -->
					<div class="relative mt-2 h-4 w-full">
						{#if duration > 0}
							{#each chapters as chapter, i (chapter.id)}
								{#if chapter.time <= duration}
									{@const pct = (chapter.time / duration) * 100}
									<!-- clamp so edge labels don't overflow the container -->
									{@const clamped = Math.min(Math.max(pct, 3), 97)}
									<button
										class={[
											'absolute -translate-x-1/2 rounded px-1 text-xs whitespace-nowrap transition-colors',
											currentChapterIndex === i
												? 'font-semibold text-purple-600'
												: 'text-gray-500 hover:text-gray-800'
										]}
										style={`left: ${clamped}%`}
										onclick={() => seekTo(chapter.time)}
										title="Jump to {chapter.chapName}"
									>
										{chapter.chapName}
									</button>
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Hidden audio element -->
		<audio bind:this={audioElement}></audio>
	</div>
</div>
