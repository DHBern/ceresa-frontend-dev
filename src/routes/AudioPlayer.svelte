<script>
	import { Slider } from 'bits-ui';

	// Props with $props rune
	let { audioSrc, chapters } = $props();

	// Reactive state with $state rune
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let currentChapterIndex = $state(0);
	let isDragging = $state(false);

	// Derived values with $derived rune
	let currentChapter = $derived(chapters[currentChapterIndex] || null);
	let progressPercent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	// Ref to audio element
	let audioElement;

	// Format time helper
	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Get chapter label for slider marks
	let chapterMarks = $derived.by(() => {
		return chapters.map((chapter) => ({
			value: chapter.time,
			label: chapter.chapName,
			id: chapter.chapId
		}));
	});

	// Effect to set up audio when component mounts
	$effect(() => {
		if (audioElement) {
			// Load audio source
			audioElement.src = audioSrc;

			// Set up event listeners
			audioElement.addEventListener('timeupdate', () => {
				if (!isDragging) {
					currentTime = audioElement.currentTime;

					// Update current chapter index based on time
					for (let i = chapters.length - 1; i >= 0; i--) {
						if (currentTime >= chapters[i].time) {
							currentChapterIndex = i;
							break;
						}
					}
				}
			});

			audioElement.addEventListener('loadedmetadata', () => {
				duration = audioElement.duration;
			});

			audioElement.addEventListener('ended', () => {
				isPlaying = false;
			});

			// Cleanup
			return () => {
				audioElement.removeEventListener('timeupdate', () => {});
				audioElement.removeEventListener('loadedmetadata', () => {});
				audioElement.removeEventListener('ended', () => {});
			};
		}
	});

	// Toggle play/pause
	function togglePlay() {
		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
		isPlaying = !isPlaying;
	}

	// Go to previous chapter
	function prevChapter() {
		if (currentChapterIndex > 0) {
			currentChapterIndex--;
			goToChapter(currentChapterIndex);
		}
	}

	// Go to next chapter
	function nextChapter() {
		if (currentChapterIndex < chapters.length - 1) {
			currentChapterIndex++;
			goToChapter(currentChapterIndex);
		}
	}

	// Jump to specific chapter by index
	function goToChapter(index) {
		const chapter = chapters[index];
		if (chapter && audioElement) {
			audioElement.currentTime = chapter.time;
			currentTime = chapter.time;
			if (!isPlaying) {
				isPlaying = true;
				audioElement.play();
			}
		}
	}

	// Handle slider value change
	function handleSliderChange(value) {
		if (audioElement) {
			audioElement.currentTime = value;
			currentTime = value;
		}
	}

	// Handle chapter mark click on slider
	function goToChapterMark(chapterTime) {
		if (audioElement) {
			audioElement.currentTime = chapterTime;
			currentTime = chapterTime;

			// Find and set the chapter index
			for (let i = 0; i < chapters.length; i++) {
				if (chapters[i].time === chapterTime) {
					currentChapterIndex = i;
					break;
				}
			}

			if (!isPlaying) {
				isPlaying = true;
				audioElement.play();
			}
		}
	}
</script>

<div class="w-full max-w-md space-y-3 rounded-lg bg-gray-800 p-4">
	<!-- Progress Section -->
	<div class="space-y-1 bg-red-200">
		<!-- Chapter Name Display -->
		<div class="flex items-center justify-between">
			<span class="truncate text-sm font-medium text-white">
				{currentChapter?.chapName || 'No chapter'}
			</span>
			<span class="min-w-[80px] text-right text-xs text-gray-400">
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>
		</div>

		<!-- Slider with Chapter Marks -->
		<div class="relative">
			<Slider.Root
				type="single"
				bind:value={currentTime}
				max={duration}
				step={0.1}
				class="w-full"
				onValueChange={handleSliderChange}
			/>

			<!-- Chapter Mark Labels -->
			{#each chapterMarks as mark, idx (mark.id)}
				{#if mark.value <= duration}
					<button
						class="group absolute top-6 -translate-x-1/2 transform cursor-pointer text-xs"
						style:left="{(mark.value / duration) * 100}%"
						onclick={() => goToChapterMark(mark.value)}
					>
						<span
							class="z-10 hidden rounded bg-gray-700 px-2 py-1 whitespace-nowrap text-white group-hover:block"
						>
							{mark.label}
						</span>
					</button>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Control Buttons -->
	<div class="flex items-center justify-center gap-3">
		<button
			onclick={prevChapter}
			disabled={currentChapterIndex === 0}
			class="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
			title="Previous Chapter"
		>
			⏮️
		</button>

		<button
			onclick={togglePlay}
			class="rounded-full bg-purple-600 p-3 transition-colors hover:bg-purple-500"
			title={isPlaying ? 'Pause' : 'Play'}
		>
			{#if isPlaying}
				⏸️
			{:else}
				▶️
			{/if}
		</button>

		<button
			onclick={nextChapter}
			disabled={currentChapterIndex >= chapters.length - 1}
			class="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
			title="Next Chapter"
		>
			⏭️
		</button>
	</div>

	<!-- Hidden Audio Element -->
	<audio bind:this={audioElement}></audio>
</div>
