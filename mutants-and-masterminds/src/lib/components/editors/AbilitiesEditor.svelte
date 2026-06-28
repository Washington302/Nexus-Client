<script lang="ts">
	import type { AbilitiesBlock } from '$lib/services/api';

	let {
		abilities
	}: {
		abilities: AbilitiesBlock
	} = $props();

	const fields: Array<{ key: keyof AbilitiesBlock; label: string }> = [
		{ key: 'strengthFinalValue', label: 'Strength' },
		{ key: 'staminaFinalValue', label: 'Stamina' },
		{ key: 'agilityFinalValue', label: 'Agility' },
		{ key: 'dexterityFinalValue', label: 'Dexterity' },
		{ key: 'fightingFinalValue', label: 'Fighting' },
		{ key: 'intellectFinalValue', label: 'Intellect' },
		{ key: 'awarenessFinalValue', label: 'Awareness' },
		{ key: 'presenceFinalValue', label: 'Presence' },
	];
</script>

<div class="editor-grid">
	{#each fields as f}
		<div class="field-row">
			<label class="field-label">{f.label}</label>
			<input type="number" class="field-input" bind:value={abilities[f.key]} />
		</div>
	{/each}
</div>

<style>
	.editor-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.field-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.field-label {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--ink);
		width: 100px;
		flex-shrink: 0;
	}
	.field-input {
		flex: 1;
		padding: 6px 8px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 16px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.field-input:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 30%, transparent);
	}
</style>
