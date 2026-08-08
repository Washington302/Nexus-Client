<script lang="ts">
	import type { Material, Substance } from '$lib/services/api';
	import { label } from '$lib/utils/character';

	// One collapsible substance: the extracted amount on hand stays visible, and the
	// raw ingredients that yield it expand underneath. Same accordion as the skill
	// groups. Every alchemical ingredient yields a substance, so there is no
	// catch-all group — materials that yield nothing are Gear, not alchemy.
	let {
		substance,
		quantity,
		ingredients
	}: {
		substance: Substance;
		quantity: number;
		ingredients: Material[];
	} = $props();

	let open = $state(false);
	const panelId = $derived(`substance-${substance}`);
	const held = $derived(ingredients.reduce((sum, i) => sum + (i.quantityHeld || 0), 0));
</script>

<div class="attribute-card" class:open>
	<button
		type="button"
		class="attribute-card-header"
		onclick={() => (open = !open)}
		aria-expanded={open}
		aria-controls={panelId}
	>
		<span class="attribute-card-name">{label(substance)}</span>
		<span class="attribute-card-meta">
			<span class="skill-group-count">{ingredients.length} ingr &middot; {held} held</span>
			<span class="attribute-card-value">{quantity}</span>
			<span class="attribute-chevron" aria-hidden="true"></span>
		</span>
	</button>

	{#if open}
		<div class="attribute-card-body" id={panelId}>
			{#if ingredients.length === 0}
				<p class="empty-hint">No ingredients recorded.</p>
			{:else}
				{#each ingredients as ing (ing.id)}
					<div class="skill-row">
						<span class="skill-row-name">
							{ing.name || 'Unnamed'}
							{#if ing.rarity}<span class="cost-mark">{label(ing.rarity)}</span>{/if}
							{#if ing.location}<span class="cost-mark">{ing.location}</span>{/if}
						</span>
						<span class="skill-row-total">{ing.quantityHeld}</span>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>
