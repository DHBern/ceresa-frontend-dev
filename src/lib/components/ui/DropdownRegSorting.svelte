<script lang="ts">
	import { DropdownMenu, type WithoutChild } from 'bits-ui';
	import Switch from '$lib/components/ui/Switch.svelte';

	type Props = DropdownMenu.RootProps & {
		registerSortBy: string;
		registerGroupItems: boolean;
		contentProps?: WithoutChild<DropdownMenu.ContentProps>;
	};

	let {
		open = $bindable(false),
		registerSortBy = $bindable(),
		registerGroupItems = $bindable(),
		contentProps,
		...restProps
	}: Props = $props();

	const SORT_OPTIONS: { value: string; label: string }[] = [
		{ value: 'name', label: 'Alfabetico' },
		{ value: 'date-asc', label: 'Cronologico (asc)' },
		{ value: 'date-desc', label: 'Cronologico (desc)' }
	];
</script>

<DropdownMenu.Root bind:open {...restProps}>
	<DropdownMenu.Trigger
		class="flex w-max items-center gap-2 rounded-full border px-3 py-1 text-left"
	>
		Ordinamento: <span class="font-bold"
			>{SORT_OPTIONS.find((o) => o.value === registerSortBy)?.label ?? 'Alfabetico'}</span
		>
		<i class="fa-solid fa-chevron-down"></i>
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content side="bottom" align="start" sideOffset={2} {...contentProps}>
			<DropdownMenu.RadioGroup bind:value={registerSortBy}>
				{#each SORT_OPTIONS as { value, label } (value)}
					<DropdownMenu.RadioItem {value}>
						{#snippet children({ checked })}
							<div
								class={[
									'px-3 py-2 select-none',
									checked
										? 'bg-foreground text-background hover:bg-foreground-hover-safe'
										: 'bg-background text-foreground hover:bg-background-hover-safe'
								]}
							>
								{label}
							</div>
						{/snippet}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>

			<p class="my-2 h-0 border-t border-muted-foreground text-xs font-bold"></p>
			<DropdownMenu.Group>
				<div class="mb-2 flex w-full flex-row-reverse justify-between px-3">
					<Switch height={20} bind:checked={registerGroupItems} classesLabel="pr-10"
						><p>Raggruppa la lista</p></Switch
					>
				</div>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
