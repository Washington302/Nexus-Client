<script lang="ts">
	import type { Material, Substance, WitcherCharacter } from '$lib/services/api';
	import {
		label,
		RARITY_OPTIONS,
		SUBSTANCE_ORDER,
		createDefaultMaterial
	} from '$lib/utils/character';
	import AccordionRow from '@ui/AccordionRow.svelte';

	// Edits one substance's extracted count plus the ingredients that yield it.
	// `ingredients` is a filtered slice of draft.materials — filter() returns
	// a new array but the objects are the same references, so binding writes straight
	// through. Adds and removes go via `draft` so the source array actually changes.
	let {
		draft,
		substance,
		ingredients
	}: {
		draft: WitcherCharacter;
		substance: Substance;
		ingredients: Material[];
	} = $props();

	const storeRow = $derived(draft.substanceStore.find((r) => r.substance === substance));

	function addIngredient() {
		// Pre-assign the group's substance so it lands in the section you opened.
		const ing = createDefaultMaterial(substance);
		draft.materials.push(ing);
		expanded = new Set(expanded).add(ing.id);
	}

	function removeIngredient(id: string) {
		draft.materials = draft.materials.filter((i) => i.id !== id);
	}

	// Collapsed by default — see AccordionRow.
	let expanded = $state(new Set<string>());
	function toggleExpanded(id: string) {
		if (expanded.has(id)) expanded.delete(id);
		else expanded.add(id);
		expanded = new Set(expanded);
	}
</script>

{#if storeRow}
	<div class="field-group">
		<div class="field-hdr">Extracted {label(storeRow.substance)}</div>
		<input class="input-demo input-num" type="number" min="0" bind:value={storeRow.quantity} />
		<span class="field-hint">Substance on hand, ready to use in a formula.</span>
	</div>
{/if}

{#each ingredients as ing (ing.id)}
	<AccordionRow
		id={ing.id}
		open={expanded.has(ing.id)}
		onToggle={() => toggleExpanded(ing.id)}
		onRemove={() => removeIngredient(ing.id)}
		removeLabel="Remove ingredient"
	>
		{#snippet header()}
			<span class="effect-name">{ing.name || 'Unnamed ingredient'} &times;{ing.quantityHeld}</span>
			<span class="attribute-card-meta">
				{#if ing.rarity}<span class="effect-meta">{label(ing.rarity)}</span>{/if}
				<span class="attribute-chevron" aria-hidden="true"></span>
			</span>
		{/snippet}
		{#snippet body()}
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Ingredient</div>
					<input
						class="input-demo"
						type="text"
						bind:value={ing.name}
						placeholder="Ingredient name"
					/>
				</div>
				<div class="field-group">
					<div class="field-hdr">Held</div>
					<input class="input-demo input-num" type="number" min="0" bind:value={ing.quantityHeld} />
				</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Yields</div>
					<select class="input-demo" bind:value={ing.yieldsSubstance}>
						{#each SUBSTANCE_ORDER as sub}
							<option value={sub}>{label(sub)}</option>
						{/each}
					</select>
					<span class="field-hint">Changing this moves it to another group.</span>
				</div>
				<div class="field-group">
					<div class="field-hdr">Rarity</div>
					<select class="input-demo" bind:value={ing.rarity}>
						<option value={null}>&mdash;</option>
						{#each RARITY_OPTIONS as opt}
							<option value={opt}>{label(opt)}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Forage DC</div>
					<input class="input-demo input-num" type="number" min="0" bind:value={ing.forageDc} />
				</div>
				<div class="field-group">
					<div class="field-hdr">Yield</div>
					<input class="input-demo" type="text" bind:value={ing.yieldQuantity} />
				</div>
			</div>
			<div class="field-group">
				<div class="field-hdr">Found</div>
				<input class="input-demo" type="text" bind:value={ing.location} />
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Weight</div>
					<input class="input-demo input-num" type="number" step="0.1" bind:value={ing.weight} />
				</div>
				<div class="field-group">
					<div class="field-hdr">Cost</div>
					<input class="input-demo input-num" type="number" min="0" bind:value={ing.cost} />
				</div>
			</div>
		{/snippet}
	</AccordionRow>
{/each}

<button type="button" class="add-row-btn" onclick={addIngredient}>+ Add Ingredient</button>
