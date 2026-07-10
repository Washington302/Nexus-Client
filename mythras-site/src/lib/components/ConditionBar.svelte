<script lang="ts">
	import type { MythrasCharacter, FatigueLevel } from '$lib/services/api';
	import Panel from '$lib/components/Panel.svelte';
	import { focusOnMount } from '$lib/utils/actions';

	let { draft, editable = true }: { draft: MythrasCharacter; editable?: boolean } = $props();

	const FATIGUE_STEPS: FatigueLevel[] = [
		'Fresh',
		'Winded',
		'Tired',
		'Wearied',
		'Exhausted',
		'Debilitated',
		'Incapacitated',
		'Semi-Conscious',
		'Comatose',
		'Dead'
	];

	// Click-to-edit: which hit location's HP / AP is currently showing as an input.
	let editingHpLoc = $state<string | null>(null);
	let editingApLoc = $state<string | null>(null);
</script>

<div class="condition-bar-wrap">
	<Panel header="Condition" color="primary">
		<div class="hitloc-grid">
			{#each draft.hitLocations as loc}
				<div class="hitloc-card">
					<div class="hitloc-card-top">
						<span class="hitloc-name">{loc.name}</span>
						<span class="hitloc-roll">{loc.d20Range}</span>
					</div>
					<div class="hitloc-card-stats">
						<span class="hitloc-hp">
							{#if editable && editingHpLoc === loc.name}
								<input
									class="input-demo input-num char-row-current"
									type="number"
									bind:value={loc.currentHp}
									onblur={() => (editingHpLoc = null)}
									use:focusOnMount
								/>
							{:else if editable}
								<button class="char-row-current-btn" onclick={() => (editingHpLoc = loc.name)}
									>{loc.currentHp}</button
								>
							{:else}
								{loc.currentHp}
							{/if}
							/ {loc.maxHp}
						</span>
						<span class="hitloc-ap">
							AP
							{#if editable && editingApLoc === loc.name}
								<input
									class="input-demo input-num char-row-current"
									type="number"
									bind:value={loc.armorPoints}
									onblur={() => (editingApLoc = null)}
									use:focusOnMount
								/>
							{:else if editable}
								<button class="char-row-current-btn" onclick={() => (editingApLoc = loc.name)}
									>{loc.armorPoints}</button
								>
							{:else}
								{loc.armorPoints}
							{/if}
						</span>
					</div>
					{#if editable}
						<input class="input-demo hitloc-armor-input" bind:value={loc.armorWorn} placeholder="Armor worn" />
					{:else if loc.armorWorn}
						<div class="hitloc-armor-label">{loc.armorWorn}</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="fatigue-ladder">
			{#each FATIGUE_STEPS as step}
				{#if editable}
					<button
						class="fatigue-step"
						class:active={draft.fatigueLevel === step}
						onclick={() => (draft.fatigueLevel = step)}>{step}</button
					>
				{:else}
					<span class="fatigue-step" class:active={draft.fatigueLevel === step}>{step}</span>
				{/if}
			{/each}
		</div>

		<div class="condition-wounds-row">
			{#if editable}
				<input class="input-demo" bind:value={draft.woundNotes} placeholder="Wound notes" />
			{:else if draft.woundNotes}
				<div class="condition-wounds"><strong>Wounds:</strong> {draft.woundNotes}</div>
			{/if}
		</div>
	</Panel>
</div>
