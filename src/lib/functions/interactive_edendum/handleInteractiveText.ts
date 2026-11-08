import { DRAWER_SNAP_POINTS } from '$lib/globals/constants.svelte';
import {
	activeRegisterTab,
	drawerSnapPoint,
	drawerSnapPoint_DEFAULT,
	selectedTextNode,
	showDrawer
} from '$lib/globals/ui-states.svelte';
import { openRegisters } from '$lib/globals/ui-states.svelte';
import type { TRegKeysFlat } from '$lib/types/register/TRegister';
import { tick } from 'svelte';
import { findRegTypeByRegKey } from '../ease_of_use/findRegTypeByRegKey';
import { scrollContainerTo } from '../ease_of_use/scrollContainerTo';

// -------------------------------------------------
// Scroll
// -------------------------------------------------
function scrollRegister(elItem: HTMLElement) {
	const elContainer = document.querySelector('[data-dom=containerRegister]');
	scrollContainerTo(elContainer as HTMLElement, elItem);
}
function scrollNotes(elItem: HTMLElement) {
	const elContainer = document.querySelector('[data-dom=containerAnnotations]');
	scrollContainerTo(elContainer as HTMLElement, elItem);
}
function scrollWindow(
	elItem: HTMLElement | null,
	elContainer: HTMLElement,
	spacing: number = 0
): void {
	//  Smoothly scrolls the viewport so that a specific element (`elItem`) is visible,
	//  while ensuring the document never scrolls past its natural boundaries.
	//  This ensures that the sticky sidebar does not move, since standard scrolling would
	//  overshoot the top/bottom of the content if the target element is near the beginning/end.

	if (!elItem) return;

	const refRect = elItem.getBoundingClientRect();

	// Calculate the bottom/top edge of the container relative to the viewport
	const containerBottomRelative = elContainer?.getBoundingClientRect().bottom ?? 0;
	const containerTopRelative = elContainer?.getBoundingClientRect().top ?? 0;

	// Determine the minimum/maximum valid scroll position
	const minValidScrollY = containerTopRelative;
	const maxValidScrollY = containerBottomRelative - window.innerHeight;

	// Calculate the desired scroll position within the min/max boundaries
	const targetRelativeY = Math.max(
		Math.min(refRect.top - spacing, maxValidScrollY),
		minValidScrollY
	);

	// Convert to absolute document coordinates
	const targetAbsoluteY = targetRelativeY + window.scrollY;

	window.scrollTo({
		left: window.scrollX, // Preserve horizontal position
		top: targetAbsoluteY,
		behavior: 'smooth'
	});
}

// -------------------------------------------------
// Handle Clicks and Sidebar
// -------------------------------------------------

// Reset .active Nodes
function resetAllActiveNodesInText() {
	const nodes = document.querySelectorAll(
		`tei-text .active, [data-dom=containerAnnotations] .active`
	);
	nodes.forEach((el) => {
		el.classList.remove('active');
	});
}

// Referencing Strings (tei-rs)
function selectAllRsNodesInText(key: TRegKeysFlat) {
	resetAllActiveNodesInText(); // Remove old highlights
	const nodes = document.querySelectorAll(`tei-text tei-rs[key=${key}]`);
	nodes.forEach((el) => {
		el.classList.add('active');
	});
}

// Notes (.note-mark, .footnote)
function activateNoteInText(key: string) {
	resetAllActiveNodesInText(); // Remove old highlights
	const footnotesInText = document.querySelectorAll(`tei-text .footnote[data-noteid=${key}]`);
	const marksInText = document.querySelectorAll(`tei-text .note-mark[data-noteid=${key}]`);
	const annotationsInSidebar = document.querySelectorAll(
		`[data-dom=containerAnnotations] li[data-noteid=${key}]`
	);
	[...footnotesInText, ...marksInText, ...annotationsInSidebar].forEach((el) => {
		el.classList.add('active');
	});

	// focus first mark
	(marksInText[0] as HTMLElement).focus();
}

// Open Sidebar
async function openRegDrawer(key: TRegKeysFlat) {
	showDrawer.value = true;

	//! HACK Opening the drawer directly on an intermediate snap point does not work, unless we first set drawerSnapPoint.value to another value and back.
	drawerSnapPoint.value = DRAWER_SNAP_POINTS[0];
	await tick();
	drawerSnapPoint.value = drawerSnapPoint_DEFAULT;

	activeRegisterTab.value = 'register';
	const regType = findRegTypeByRegKey(key);
	if (regType && !openRegisters.list.includes(regType)) {
		openRegisters.list = [...openRegisters.list, regType];
	}
}
function openNoteDrawer() {
	showDrawer.value = true;
	activeRegisterTab.value = 'notes';
}

// Scroll Text and Sidebar
function scrollText(elItem: HTMLElement) {
	const elContainer = document.querySelector('[data-textflow=fluid]');
	scrollWindow(elItem, elContainer as HTMLElement, 200);
}

export function findTextNodes(key: TRegKeysFlat | undefined | null): HTMLElement[] | undefined {
	if (!key) return;
	const candidates = document.querySelectorAll(
		`[data-textflow=fluid] tei-text tei-rs[key="${key}"]`
	);
	const nodeList = Array.from(candidates).filter((el): el is HTMLElement => {
		// Return true ONLY if there is NO cetei-original ancestor
		return !el.closest('cetei-original') && el instanceof HTMLElement;
	});
	return nodeList;
}

// Exports
export function clearAllHighlights() {
	// selectedTextNode.key = null; //! FIX this breaks buttons in Register when just CHANGING between keys
	// selectedTextNode.el = null;
	// selectedTextNode.els = null;
	resetAllActiveNodesInText();
}

export function handleRegisterClick(key: TRegKeysFlat | undefined | null) {
	if (!key) return;
	const regElement = document.querySelector(`[data-dom=containerRegister] [data-regkey=${key}]`);
	(regElement as HTMLElement).focus();
	selectedTextNode.key = key;
	selectAllRsNodesInText(key);
	const elSpans = findTextNodes(key);

	selectedTextNode.el = elSpans?.[0];
	selectedTextNode.els = elSpans;

	// focus first element and scroll
	if (elSpans) {
		elSpans[0].focus();
		scrollText(elSpans[0] as HTMLElement);
	}
}

export function selectTextelement(el: HTMLElement | undefined | null): void {
	if (!el) return;
	scrollText(el);
	resetAllActiveNodesInText();
	el.classList.add('active');
}

export function selectFirstTextelement(key: TRegKeysFlat | undefined | null): void {
	if (!key) return;
	const elSpans = findTextNodes(key);
	if (!elSpans || !selectedTextNode.el) return;
	selectedTextNode.el = elSpans[0];
	scrollText(selectedTextNode.el as HTMLElement);
	resetAllActiveNodesInText();
	selectedTextNode.el.classList.add('active');
}

export function handleJumpToSibling(
	key: TRegKeysFlat | undefined | null,
	direction: 'next' | 'prev'
): void {
	if (!key) return;
	const elSpans = findTextNodes(key);
	if (!elSpans || !selectedTextNode.el) return;

	let currentIndex = -1;

	// Find the index of the currently selected element
	for (let i = 0; i < elSpans.length; i++) {
		if (elSpans[i] === selectedTextNode.el) {
			currentIndex = i;
			break;
		}
	}

	// If the current element wasn't found in the list, do nothing
	if (currentIndex === -1) return;

	const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

	// Check if the calculated index is within bounds
	if (newIndex >= 0 && newIndex < elSpans.length) {
		selectedTextNode.el = elSpans[newIndex];
		scrollText(selectedTextNode.el as HTMLElement);
	}
	// Wrap around logic: if next index is out of bounds, go to the opposite end
	else if (direction === 'prev' && currentIndex === 0) {
		selectedTextNode.el = elSpans[elSpans.length - 1];
		scrollText(selectedTextNode.el as HTMLElement);
	} else if (direction === 'next' && currentIndex === elSpans.length - 1) {
		selectedTextNode.el = elSpans[0];
		scrollText(selectedTextNode.el as HTMLElement);
	}
	resetAllActiveNodesInText();
	selectedTextNode.el.classList.add('active');
}

export function handleAnnotationClick(noteId: TRegKeysFlat | undefined | null) {
	if (!noteId) return;
	selectedTextNode.key = noteId;
	activateNoteInText(noteId);
	const elSpan = document.querySelector(
		`[data-textflow=fluid] tei-text span.note-mark[data-noteid=${noteId}]`
	);
	scrollText(elSpan as HTMLElement);
}

export function handleRefStringClick(elSpan: HTMLElement | undefined | null) {
	const key = elSpan?.getAttribute('key') as TRegKeysFlat;
	if (!elSpan || !key) return;
	selectedTextNode.key = key;
	selectedTextNode.el = elSpan as HTMLElement;
	selectedTextNode.els = findTextNodes(key);

	// render active
	resetAllActiveNodesInText();
	elSpan.classList.add('active');

	openRegDrawer(key);

	const regElement = document.querySelector(`[data-dom=containerRegister] [data-regkey=${key}]`);
	if (regElement) {
		scrollRegister(regElement as HTMLElement);
		(regElement as HTMLElement).focus();
	}
}
export function handleFootnoteClick(key: TRegKeysFlat | undefined | null) {
	if (!key) return;
	selectedTextNode.key = key;
	openNoteDrawer();
	activateNoteInText(key);
	const annotElement = document.querySelector(
		`[data-dom=containerAnnotations] li[data-noteid=${key}]`
	);
	scrollNotes(annotElement as HTMLElement);
}
