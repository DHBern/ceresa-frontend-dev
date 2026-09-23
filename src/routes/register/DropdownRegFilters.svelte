<script lang="ts">
	import { DropdownMenu, type WithoutChild } from 'bits-ui';
	import type { TRegDict, TRegTypes } from '$lib/types/register/TRegister';

	type Props = DropdownMenu.RootProps & {
		regDict: TRegDict['dict_register'][TRegTypes];
		items: string[];
		selectedFilter: string;
		contentProps?: WithoutChild<DropdownMenu.ContentProps>;
	};

	let {
		open = $bindable(false),
		regDict,
		items,
		selectedFilter = $bindable(),
		contentProps,
		...restProps
	}: Props = $props();
</script>

<DropdownMenu.Root bind:open {...restProps}>
	<DropdownMenu.Trigger
		class="flex w-max max-w-[80vw] items-center gap-2 truncate rounded-full border px-3 py-1 text-left"
	>
		Filtern nach: <span class="truncate font-bold"
			>{(regDict.groups as any)[selectedFilter]?.label_plural || 'Alle Kategorien'}</span
		>
		<i class="fa-solid fa-chevron-down"></i>
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content side="bottom" align="start" sideOffset={2} {...contentProps}>
			<DropdownMenu.RadioGroup bind:value={selectedFilter}>
				<!-- <DropdownMenu.GroupHeading>Filtern nach</DropdownMenu.GroupHeading> -->
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
							Alle Kategorien
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
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
