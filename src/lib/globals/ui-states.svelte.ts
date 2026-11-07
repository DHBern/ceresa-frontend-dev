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
type TgalleryViewType = 'gallery' | 'list' | 'iconList';
export const galleryViewType: { value: TgalleryViewType } = $state({ value: 'iconList' });

export const registerSortBy = $state({ value: 'name' });
export const registerGroupItems = $state({ value: true });

import type { TDocItemsAudio } from '$lib/types/documents/TDocuments';
// Register in Sidebar
import { type TRegTypes } from '$lib/types/register/TRegister';
export const openRegisters: { list: TRegTypes[] } = $state({ list: [] });

// Sidebar Toggle
export const showSide = $state({ value: true });
export const activeRegisterTab: { value: 'register' | 'notes' } = $state({ value: 'notes' });

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
export const currentFilesAudio: { value: TDocItemsAudio | null } = $state({ value: null });
export const currentlyPlayingAudio: { value: TDocItemsAudio | null } = $state({ value: null });
