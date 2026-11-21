<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	let {
		value,
		onSelect
	}: {
		value: 'asc' | 'desc' | undefined;
		onSelect: (direction: 'asc' | 'desc') => void;
	} = $props();
</script>

<DropdownMenu.RadioGroup
	{value}
	onValueChange={(direction) => {
		if (direction === 'asc' || direction === 'desc') onSelect(direction);
	}}
>
	{#each ['asc', 'desc'] as direction (direction)}
		<DropdownMenu.RadioItem
			value={direction}
			class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 data-highlighted:bg-background-hover"
		>
			{#snippet children({ checked })}
				<i
					class={direction === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}
					aria-hidden="true"
				></i>
				<span>{direction === 'asc' ? 'Crescente' : 'Decrescente'}</span>
				{#if checked}<i class="fa-solid fa-check ml-auto" aria-hidden="true"></i>{/if}
			{/snippet}
		</DropdownMenu.RadioItem>
	{/each}
</DropdownMenu.RadioGroup>
