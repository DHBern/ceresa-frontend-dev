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
	published: true,
});

// UI
export const isMobile = $state({ value: false });
