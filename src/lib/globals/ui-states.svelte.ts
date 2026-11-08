import { DRAWER_SNAP_POINTS } from './constants.svelte';
import type { TDocItemsAudio } from '$lib/types/documents/TDocuments';
import { type TRegKeysFlat, type TRegTypes } from '$lib/types/register/TRegister';

// sorting and grouping
type TgalleryViewType = 'gallery' | 'list' | 'iconList';
export const galleryViewType: { value: TgalleryViewType } = $state({ value: 'iconList' });

export const registerSortBy = $state({ value: 'name' });
export const registerGroupItems = $state({ value: true });

// Register in Sidebar
export const openRegisters: { list: TRegTypes[] } = $state({ list: [] });

// Sidebar Toggle
export const showDrawer = $state({ value: false });
export const drawerSnapPoint_DEFAULT = DRAWER_SNAP_POINTS[1];
export const drawerSnapPoint: { value: string | number | null } = $state({
	value: drawerSnapPoint_DEFAULT
});
export const activeRegisterTab: { value: 'register' | 'notes' } = $state({ value: 'notes' });
export const activeRegType: { value: TRegTypes | undefined } = $state({ value: undefined });
export const activeRegItem = $state({ value: '' });

export const selectedTextNode: {
	key: TRegKeysFlat | undefined | null;
	el: HTMLElement | undefined | null;
	els: HTMLElement[] | undefined | null;
} = $state({
	key: null,
	el: null,
	els: null
});

export function setDrawerSmall() {
	showDrawer.value = true;
	drawerSnapPoint.value = DRAWER_SNAP_POINTS[0];
}
export function setDrawerMedium() {
	showDrawer.value = true;
	drawerSnapPoint.value = DRAWER_SNAP_POINTS[1];
}
export function setDrawerLarge() {
	showDrawer.value = true;
	drawerSnapPoint.value = DRAWER_SNAP_POINTS[2];
}

// Sequence Toggles
export const isOpenSeqPanel = $state({ state: false });
export const sequenceToggle = $state({
	posthum: true,
	unpublished: true,
	published: true
});

// UI

// Audio
export const isAudioPlayerVisible = $state({ value: false });
export const isAudioPlaying = $state({ value: false });
export const currentFilesAudio: { value: TDocItemsAudio | null } = $state({ value: null });
export const currentlyPlayingAudio: { value: TDocItemsAudio | null } = $state({ value: null });
