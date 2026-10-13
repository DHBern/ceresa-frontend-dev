export const selectedTextNode: {
	key: string;
	el: HTMLElement | undefined | null;
	els: HTMLElement[] | undefined | null;
} = $state({
	key: '',
	el: null,
	els: null
});

// sorting and grouping
export const registerSortBy = $state({ value: 'name' });
export const registerGroupItems = $state({ value: true });

import type { TAudio } from '$lib/types/documents/TDocuments';
// Register in Sidebar
import { type TRegTypes } from '$lib/types/register/TRegister';
export const openRegisters: { list: TRegTypes[] } = $state({ list: [] });

// Sidebar Toggle
type TActiveRegisterTab = 'register' | 'notes';
export const activeRegisterTab: { value: TActiveRegisterTab } = $state({ value: 'notes' });

// Sequence Toggles
export const isOpenSeqPanel = $state({ state: false });
export const sequenceToggle = $state({
	posthum: true,
	unpublished: true,
	published: true
});

// UI
export const isMobile = $state({ value: false });

// Audio
export const isAudioPlayerVisible = $state({ value: false });
export const isAudioPlaying = $state({ value: false });
export const currentFilesAudio: { value: TAudio | null } = $state({ value: null });
export const currentlyPlayingAudio: { value: TAudio | null } = $state({ value: null });
