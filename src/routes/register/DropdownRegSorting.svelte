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
</script>

<DropdownMenu.Root bind:open {...restProps}>
	<DropdownMenu.Trigger
		class="flex w-max items-center gap-2 rounded-full border px-3 py-1 text-left"
	>
		Sortierung: <span class="font-bold"
			>{registerSortBy === 'name' ? 'Alphabetisch' : 'Chronologisch'}</span
		>
		<i class="fa-solid fa-chevron-down"></i>
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content side="bottom" align="start" sideOffset={2} {...contentProps}>
			<DropdownMenu.RadioGroup bind:value={registerSortBy}>
				<!-- <DropdownMenu.GroupHeading>Sortieren nach</DropdownMenu.GroupHeading> -->
				<!-- Sort Alphabetically -->
				<DropdownMenu.RadioItem value="name">
					{#snippet children({ checked })}
						<div
							class={[
								'px-3 py-2 select-none',
								checked
									? 'bg-foreground text-background hover:bg-foreground-hover-safe'
									: 'bg-background text-foreground hover:bg-background-hover-safe'
							]}
						>
							Alphabetisch
						</div>
					{/snippet}
				</DropdownMenu.RadioItem>
				<!-- Sort Chronologically -->
				<DropdownMenu.RadioItem value="date">
					{#snippet children({ checked })}
						<div
							class={[
								'px-3 py-2 select-none',
								checked
									? 'bg-foreground text-background hover:bg-foreground-hover-safe'
									: 'bg-background text-foreground hover:bg-background-hover-safe'
							]}
						>
							Chronologisch
						</div>
					{/snippet}
				</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>

			<p class="my-2 h-0 border-t border-muted-foreground text-xs font-bold"></p>
			<DropdownMenu.Group>
				<div class="mb-2 flex w-full flex-row-reverse justify-between px-3">
					<Switch height={20} bind:checked={registerGroupItems} classesLabel="pr-10"
						><p>Liste gruppieren</p></Switch
					>
				</div>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
