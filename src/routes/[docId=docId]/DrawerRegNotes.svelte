<script lang="ts">
	import { register as reg } from '$lib/data/register.json';
	import {
		activeRegisterTab,
		drawerSnapPoint,
		setDrawerSmall,
		setDrawerMedium,
		setDrawerLarge,
		selectedTextNode,
		showDrawer as showDrawer,
		drawerSnapPoint_DEFAULT
	} from '$lib/globals/ui-states.svelte';
	import * as Drawer from '$lib/components/shadcn-ui/drawer/index.js';
	import DrawerReg from './DrawerReg.svelte';
	import Annotations from './Annotations.svelte';
	import { DRAWER_SNAP_POINTS } from '$lib/globals/constants.svelte';
	import { handleJumpToSibling } from '$lib/functions/interactive_edendum/handleInteractiveText';
	import { resolveReg } from '$lib/functions/ease_of_use/resolveReg';

	let { ceteiData, docItem } = $props();

	async function handleEscape(ev: KeyboardEvent) {
		if (ev.key === 'Escape' && !isDrawerSmall) {
			ev.preventDefault();
			ev.stopPropagation();
			setDrawerSmall();
		}
	}

	function closeAndResetDrawer() {
		showDrawer.value = false;
	}

	let isDrawerSmall = $derived(drawerSnapPoint.value === DRAWER_SNAP_POINTS[0]);
	let isDrawerMedium = $derived(drawerSnapPoint.value === DRAWER_SNAP_POINTS[1]);
	let isDrawerLarge = $derived(drawerSnapPoint.value === DRAWER_SNAP_POINTS[2]);
</script>

<Drawer.Root
	snapPoints={DRAWER_SNAP_POINTS}
	bind:activeSnapPoint={drawerSnapPoint.value}
	bind:open={showDrawer.value}
	modal={false}
	dismissible={isDrawerSmall}
	direction="bottom"
>
	<Drawer.Content
		class="z-99999999999991 mx-auto h-full w-[98vw] border border-foreground bg-background data-[vaul-drawer-direction=bottom]:max-h-[97%]"
		onkeydown={handleEscape}
	>
		<div class="grid w-full grid-cols-[1fr_auto] px-5">
			<!-- Header -->
			<div>
				{#if isDrawerSmall}
					<button
						class="preset-btn-round --ghost"
						aria-label="close drawer"
						onclick={() => {
							setDrawerMedium();
							activeRegisterTab.value = 'register';
						}}
						><i class="fa-solid fa-arrow-up align-center"></i><span class="ml-2"
							>Torna al registro</span
						></button
					>
				{/if}
			</div>
			<div class="flex gap-2">
				{#if isDrawerMedium}
					<button
						class="preset-btn-round --square --ghost"
						aria-label="close drawer"
						onclick={() => {
							setDrawerLarge();
							activeRegisterTab.value = 'register';
						}}
						><i class="fa-solid fa-up-right-and-down-left-from-center align-center"></i><span
							class="ml-2"
						></span></button
					>
				{:else if isDrawerLarge}
					<button
						class="preset-btn-round --square --ghost"
						aria-label="close drawer"
						onclick={() => {
							setDrawerMedium();
							activeRegisterTab.value = 'register';
						}}
						><i class="fa-solid fa-down-left-and-up-right-to-center align-center"></i><span
							class="ml-2"
						></span></button
					>
				{/if}
				<button
					class="preset-btn-round --square --ghost"
					aria-label="close drawer"
					onclick={closeAndResetDrawer}
					><i class="fa-solid fa-xmark align-center"></i>
				</button>
			</div>
		</div>
		<!-- Content -->
		<div class="h-full w-full px-5">
			{#if isDrawerSmall}
				<div class="pb-30">
					{#if selectedTextNode.key}
						<div class="align-center flex flex-col items-center justify-center gap-2">
							<h1 class="h4">{resolveReg(reg, selectedTextNode.key)?.item?.name}</h1>
							<div class="flex items-center gap-3">
								<button
									class={[
										'flex h-9 w-9 items-center justify-center rounded-button hover:bg-background-hover hover:text-background-contrast',
										(selectedTextNode.els?.length || 0) <= 1 &&
											'pointer-events-none cursor-pointer text-muted-foreground'
									]}
									disabled={(selectedTextNode.els?.length || 0) <= 1}
									aria-label="select previous match"
									onclick={(ev) => {
										ev.stopPropagation();
										handleJumpToSibling(selectedTextNode.key, 'prev');
									}}><i class="fa-arrow-left-long fa-regular align-center"></i></button
								>
								<p>
									Occorrenza {(selectedTextNode.els as HTMLElement[])?.findIndex((el) => {
										return el === selectedTextNode.el;
									}) + 1} of {selectedTextNode.els?.length}
								</p>
								<button
									class={[
										'flex h-9 w-9 items-center justify-center rounded-button hover:bg-background-hover',
										(selectedTextNode.els?.length || 0) <= 1 &&
											'pointer-events-none cursor-pointer text-muted-foreground'
									]}
									disabled={(selectedTextNode.els?.length || 0) <= 1}
									aria-label="select next match"
									onclick={(ev) => {
										ev.stopPropagation();
										handleJumpToSibling(selectedTextNode.key, 'next');
									}}><i class="fa-arrow-right-long fa-regular align-center"></i></button
								>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="h-full pb-20">
					{#if activeRegisterTab.value === 'notes'}
						<Annotations {ceteiData} />
					{:else if activeRegisterTab.value === 'register'}
						<DrawerReg {docItem} />
					{/if}
				</div>
			{/if}
		</div>
	</Drawer.Content>
</Drawer.Root>
