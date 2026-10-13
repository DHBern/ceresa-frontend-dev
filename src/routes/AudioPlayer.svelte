<script lang="ts">
	import { isAudioPlayerVisible } from '$lib/globals/ui-states.svelte';
	import { Slider } from 'bits-ui';

	// Props
	let { audioSrc, chapters } = $props();

	// State
	let isPlaying = $state(false);
	let duration = $state(0);
	let currentChapterIndex = $state(0);
	let isDragging = $state(false);
	let sliderValue = $state.raw(0);
	let audioElement: HTMLAudioElement | null = $state(null);

	// Derived
	let currentChapter = $derived(chapters[currentChapterIndex] ?? null);

	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Which chapter does a given time belong to?
	function chapterIndexForTime(time: number) {
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
	function togglePlay() {
		if (!audioElement) return;
		if (isPlaying) {
			audioElement.pause();
			isPlaying = false;
		} else {
			audioElement.play().catch(() => {});
			isPlaying = true;
		}
	}
	function prevChapter() {
		if (currentChapterIndex > 0) seekTo(chapters[currentChapterIndex - 1].time);
	}
	function nextChapter() {
		if (currentChapterIndex < chapters.length - 1) seekTo(chapters[currentChapterIndex + 1].time);
	}
</script>

<!-- Close button -->
<button
	class="absolute top-5 right-5 text-lg text-black"
	aria-label="close audio player"
	onclick={() => {
		isAudioPlayerVisible.value = false;
	}}><i class="fa-solid fa-xmark"></i></button
>
<div class="flex w-full justify-center">
	<div class="relative w-full max-w-md space-y-3 rounded-lg p-4">
		<!-- Header: chapter name + time -->
		<div class="flex items-center justify-between">
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
			<div class="relative h-4 w-full">
				{#if duration > 0}
					{#each chapters as chapter, i (chapter.chapId)}
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

		<!-- Control buttons -->
		<div class="flex items-center justify-center gap-3">
			<button
				onclick={prevChapter}
				disabled={currentChapterIndex === 0}
				class="rounded-full p-2 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
				title="Previous Chapter"
			>
				<i class="fa-solid fa-backward text-foreground"></i></button
			>

			<button
				onclick={togglePlay}
				class="rounded-full bg-purple-600 p-3 text-white transition-colors hover:bg-purple-500"
				title={isPlaying ? 'Pause' : 'Play'}
			>
				{#if isPlaying}
					<i class="fa-solid fa-pause text-foreground"></i>
				{:else}
					<i class="fa-solid fa-play text-foreground"></i>
				{/if}
			</button>

			<button
				onclick={nextChapter}
				disabled={currentChapterIndex >= chapters.length - 1}
				class="rounded-full p-2 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
				title="Next Chapter"
			>
				<i class="fa-solid fa-foreward text-foreground"></i>
			</button>
		</div>

		<!-- Hidden audio element -->
		<audio bind:this={audioElement}></audio>
	</div>
</div>
