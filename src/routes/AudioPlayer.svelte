<script lang="ts">
	import {
		currentFilesAudio,
		currentlyPlayingAudio,
		isAudioPlayerVisible
	} from '$lib/globals/ui-states.svelte';
	import { Slider } from 'bits-ui';
	import { resolve } from '$app/paths';
	import { resolveDocPath } from '$lib/functions/ease_of_use/resolveDocPath';
	import { documents } from '$lib/data/documents.json';

	// Props
	let audioSrc = $derived(
		(currentlyPlayingAudio.value?.audioMaterial?.path || '') +
			'/' +
			(currentlyPlayingAudio.value?.audioMaterial?.filename || '')
	);
	let chapters = $derived([
		{ id: '0', chapName: '', time: 0 },
		...(currentlyPlayingAudio.value?.audioMaterial.metadata.chapters || [])
	]);

	// State
	let isPlaying = $state(false);
	let duration = $state(0);
	let currentChapterIndex = $state(0);
	let isDragging = $state(false);
	let sliderValue = $state.raw(0);
	let audioElement: HTMLAudioElement | null = $state(null);

	// Derived
	let currentChapter = $derived(chapters?.[currentChapterIndex] ?? null);
	let referringDocuments = $derived(
		(['posthum', 'unpublished', 'published'] as const).flatMap((type) =>
			Object.values(documents[type]).filter((doc) => {
				const references = doc.crossReferences;
				return (
					('linked_documents' in references &&
						references.linked_documents?.audio?.includes(
							currentlyPlayingAudio.value?.slug ?? ''
						)) ||
					('cited_documents' in references &&
						references.cited_documents?.audio?.includes(currentlyPlayingAudio.value?.slug ?? ''))
				);
			})
		)
	);

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

	// Play if audioFile changed
	$effect(() => {
		const _listen = currentlyPlayingAudio.value?.slug; // listen to changes here
		playAudio();
	});

	function handleEscape(ev: KeyboardEvent) {
		if (ev.key === 'Escape' && isAudioPlayerVisible.value) {
			isPlaying = false;
			isAudioPlayerVisible.value = false;
		}
	}
</script>

<!-- <svelte:document onkeydown={handleEscape} /> -->

<div class="mx-auto w-full max-w-7xl px-5 py-4">
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0 text-sm">
			<p class="mt-0 font-bold">{currentlyPlayingAudio.value?.metadata.title}</p>
			<p class="mt-1 text-xs break-words">
				<strong>Linked Documents: </strong>
				{#each ['posthum', 'unpublished', 'published', 'audio'] as const as type (type)}
					{@const linkedDocs =
						currentlyPlayingAudio.value?.crossReferences?.linked_documents?.[type]}
					{#each linkedDocs as linkedDoc (linkedDoc)}
						<a href={resolve(linkedDoc)} class="mr-2 underline">{linkedDoc}</a>
					{/each}
				{/each}
				{#each referringDocuments as doc (doc.slug)}
					<a href={resolveDocPath(doc.slug)} class="mr-2 underline"
						>{doc.metadata.title_editorial}</a
					>
				{/each}
			</p>
		</div>
		<button
			class="preset-btn-circle --color-light shrink-0 border border-foreground"
			aria-label="close audio player"
			onclick={() => {
				isAudioPlayerVisible.value = false;
			}}><i class="fa-solid fa-xmark" aria-hidden="true"></i></button
		>
	</div>
	{#if currentFilesAudio.value?.slug && currentFilesAudio.value?.slug !== currentlyPlayingAudio.value?.slug}
		<button
			class="preset-btn-round --sm mt-3 max-w-full text-center whitespace-normal"
			onclick={() => {
				currentlyPlayingAudio.value = currentFilesAudio.value;
			}}>Switch to visible document's audio</button
		>
	{/if}
	<div class="mt-4 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
		<!-- Control buttons -->
		<div class="flex shrink-0 items-center gap-2">
			<button
				onclick={() => {
					if (isPlaying) pauseAudio();
					else playAudio();
				}}
				class="preset-btn-circle --color-dark"
				title={isPlaying ? 'Pause' : 'Play'}
				aria-label={isPlaying ? 'Pause' : 'Play'}
			>
				{#if isPlaying}
					<i class="fa-solid fa-pause" aria-hidden="true"></i>
				{:else}
					<i class="fa-solid fa-play" aria-hidden="true"></i>
				{/if}
			</button>
			<button
				onclick={prevChapter}
				disabled={currentChapterIndex === 0}
				class="preset-btn-circle --color-light border border-foreground disabled:cursor-default disabled:opacity-40"
				title="Previous Chapter"
				aria-label="Previous Chapter"
			>
				<i class="fa-solid fa-turn-up -rotate-90" aria-hidden="true"></i></button
			>

			<button
				onclick={nextChapter}
				disabled={currentChapterIndex >= chapters.length - 1}
				class="preset-btn-circle --color-light border border-foreground disabled:cursor-default disabled:opacity-40"
				title="Next Chapter"
				aria-label="Next Chapter"
			>
				<i class="fa-solid fa-turn-down -rotate-90" aria-hidden="true"></i>
			</button>
		</div>

		<!-- Position Indicator and Chapters -->
		<div class="min-w-0 flex-1">
			<div class="w-full">
				<!-- Header: chapter name + time -->
				<div class="flex w-full items-center justify-between gap-3">
					<span class="shrink-0 text-xs tabular-nums">
						{formatTime(sliderValue)} / {formatTime(duration)}
					</span>
				</div>
				<!-- Slider with chapter markers -->
				<div class="mt-2">
					<div class="relative">
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
						>
							<span
								class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-foreground/20"
							>
								<Slider.Range class="absolute h-full bg-foreground" />
							</span>
							<Slider.Thumb
								index={0}
								aria-label="Audio position"
								class="z-20 block size-[18px] cursor-pointer rounded-full border-2 border-foreground bg-background focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-hidden"
							/>
						</Slider.Root>
						<div class="pointer-events-none absolute inset-x-[9px] top-1/2 z-10 h-0">
							{#if duration > 0}
								{#each chapters as chapter (chapter.id)}
									{#if chapter.chapName && chapter.time >= 0 && chapter.time <= duration}
										<button
											class="pointer-events-auto absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
											style={`left: ${(chapter.time / duration) * 100}%`}
											onclick={() => seekTo(chapter.time)}
											aria-label="Jump to {chapter.chapName} on timeline"
											title="Jump to {chapter.chapName}"
										>
											<span class="size-2 rounded-full border border-foreground bg-background"
											></span>
										</button>
									{/if}
								{/each}
							{/if}
						</div>
					</div>
					<div class="mt-2 flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Chapters">
						{#each chapters as chapter, i (chapter.id)}
							{#if chapter.chapName && duration > 0 && chapter.time >= 0 && chapter.time <= duration}
								<button
									class={[
										'preset-btn-round --xs shrink-0',
										currentChapterIndex === i && '--active'
									]}
									onclick={() => seekTo(chapter.time)}
									title="Jump to {chapter.chapName}"
									aria-label="Jump to {chapter.chapName}"
								>
									{chapter.chapName}
								</button>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Hidden audio element -->
		<audio bind:this={audioElement}></audio>
	</div>
</div>
