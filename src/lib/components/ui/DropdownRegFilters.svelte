<script lang="ts">
	import { DropdownMenu, type WithoutChild } from 'bits-ui';
	import type { TRegDict, TRegTypes } from '$lib/types/register/TRegister';

	type Props = DropdownMenu.RootProps & {
		regDict: TRegDict['dict_register'][TRegTypes];
		items: string[];
		selectedFilter: string;
		contentProps?: WithoutChild<DropdownMenu.ContentProps>;
		mode?: 'single' | 'multi';
		selectedFilterMulti?: string[];
		getLabel?: (value: string) => string;
	};

	let {
		open = $bindable(false),
		regDict,
		items,
		selectedFilter = $bindable(),
		contentProps,
		mode = 'single',
		selectedFilterMulti = $bindable([]),
		getLabel,
		...restProps
	}: Props = $props();

	// label resolution incl. multi-mode trigger label
	const labelFor = (value: string): string =>
		getLabel ? getLabel(value) : ((regDict.groups as any)[value]?.label_plural ?? value);

	const triggerLabel = $derived.by(() => {
		if (mode === 'multi') {
			if (!selectedFilterMulti.length) return 'Tutti';
			return selectedFilterMulti.map(labelFor).join(', ');
		}
		return (regDict.groups as any)[selectedFilter]?.label_plural || 'Tutte le categorie';
	});
</script>

<DropdownMenu.Root bind:open {...restProps}>
	<DropdownMenu.Trigger
		class="flex w-max max-w-[80vw] items-center gap-2 truncate rounded-full border px-3 py-1 text-left"
	>
		Filtra per: <span class="truncate font-bold">{triggerLabel}</span>
		<i class="fa-solid fa-chevron-down"></i>
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content side="bottom" align="start" sideOffset={2} {...contentProps}>
			{#if mode === 'multi'}
				<DropdownMenu.CheckboxGroup bind:value={selectedFilterMulti}>
					{#each items as value (value)}
						<DropdownMenu.CheckboxItem {value}>
							{#snippet children({ checked })}
								<div
									class={[
										'p-2 select-none',
										checked
											? 'bg-foreground text-background hover:bg-foreground-hover-safe'
											: 'bg-background text-foreground hover:bg-background-hover-safe'
									]}
								>
									{labelFor(value)}
								</div>
							{/snippet}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.CheckboxGroup>
			{:else}
				<DropdownMenu.RadioGroup bind:value={selectedFilter}>
					<DropdownMenu.RadioItem value="">
						{#snippet children({ checked })}
							<div
								class={[
									'p-2 select-none',
									checked
										? 'bg-foreground text-background hover:bg-foreground-hover-safe'
										: 'bg-background text-foreground hover:bg-background-hover-safe'
								]}
							>
								Tutte le categorie
							</div>
						{/snippet}
					</DropdownMenu.RadioItem>
					{#each items as value (value)}
						<DropdownMenu.RadioItem {value}>
							{#snippet children({ checked })}
								<div
									class={[
										'p-2 select-none',
										checked
											? 'bg-foreground text-background hover:bg-foreground-hover-safe'
											: 'bg-background text-foreground hover:bg-background-hover-safe'
									]}
								>
									{(regDict.groups as any)[value]?.label_plural}
								</div>
							{/snippet}
						</DropdownMenu.RadioItem>
					{/each}
				</DropdownMenu.RadioGroup>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
