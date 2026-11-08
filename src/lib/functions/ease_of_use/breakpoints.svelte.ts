import { browser } from '$app/environment';
import { MediaQuery } from 'svelte/reactivity';

// Tailwind default breakpoints
export const TAILWIND_BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536
} as const;

export type TBreakpointLabel = keyof typeof TAILWIND_BREAKPOINTS;

// One MediaQuery signal per breakpoint
const queries = Object.fromEntries(
	Object.entries(TAILWIND_BREAKPOINTS).map(([name, px]) => [
		name,
		new MediaQuery(`(max-width: ${px - 0.02}px)`)
	])
) as Record<TBreakpointLabel, MediaQuery>;

export function isBreakpointBelow(breakpointLabel: TBreakpointLabel): boolean {
	if (!browser) return false;
	return queries[breakpointLabel].current;
}
