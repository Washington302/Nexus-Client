<script lang="ts">
	import type { Power } from '$lib/services/api';
	import EffectEditor from './EffectEditor.svelte';
	import AlternateEffectEditor from './AlternateEffectEditor.svelte';
	import DeviceSectionEditor from './DeviceSectionEditor.svelte';
	import { createDefaultAlternateEffect, createDefaultEffect } from '$lib/utils/character';

	let {
		power,
		onRemove,
		allowNestedSummon = true,
	}: {
		power: Power;
		onRemove: () => void;
		allowNestedSummon?: boolean;
	} = $props();

	let collapsed = $state(false);

	function toggleCollapse() { collapsed = !collapsed; }

	function toggleDevice() {
		if (power._deviceType) {
			delete (power as any)._deviceType;
			delete (power as any)._embeddedPowers;
		} else {
			(power as any)._deviceType = 'REMOVABLE';
			(power as any)._embeddedPowers = [];
		}
	}

	function toggleArray() { power.isArray = !power.isArray; }

	function addEffect() {
		power.effects.push(createDefaultEffect(power.effects.length === 0));
	}

	function removeEffect(ei: number) { power.effects.splice(ei, 1); }

	function addAlternateEffect() {
		power.alternateEffects.push(createDefaultAlternateEffect());
	}

	function removeAlternateEffect(ai: number) { power.alternateEffects.splice(ai, 1); }
</script>

<div class="power-card">
	<div class="power-header" onclick={toggleCollapse} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleCollapse()}>
		<span class="collapse-icon">{collapsed ? '\u25B6' : '\u25BC'}</span>
		<input type="text" class="power-name-input" bind:value={power.name} placeholder="Power name" onclick={(e) => e.stopPropagation()} />
		<label class="array-toggle" onclick={(e) => e.stopPropagation()}>
			<input type="checkbox" checked={power.isArray} onchange={toggleArray} />
			<span class="array-label">Array</span>
		</label>
		<label class="device-toggle" onclick={(e) => e.stopPropagation()}>
			<input type="checkbox" checked={power._deviceType != null} onchange={toggleDevice} />
			<span class="device-label">Device</span>
		</label>
		<button class="remove-btn" onclick={onRemove}>&#10005;</button>
	</div>
	{#if !collapsed}
		<textarea class="desc-textarea" bind:value={power.description} placeholder="What does this power do?" rows="2"></textarea>
		<div class="descriptors-row">
			<input type="text" class="desc-input" value={power.descriptors?.[0] ?? ''}
				oninput={(e) => { const v = (e.target as HTMLInputElement).value; power.descriptors = v ? [v] : []; }}
				placeholder="Descriptors (comma-separated)" />
		</div>
		<div class="pool-row">
			<label class="sm-label">PP Pool</label>
			<input type="number" class="sm-input" bind:value={power.maxPpPool} />
			<span class="cost-label">Total</span>
			<span class="cost-value">{power.totalPowerCost} PP</span>
		</div>

		{#if power._deviceType}
			<DeviceSectionEditor {power} {allowNestedSummon} />
		{/if}

		<div class="effects-section">
			<div class="effects-head">{power.isArray ? 'Active Slot Effects' : 'Effects'}</div>
			{#if !power._deviceType}
				{#each power.effects as effect, ei}
					<EffectEditor effect={effect} onRemove={() => removeEffect(ei)} {allowNestedSummon} />
				{/each}
				<button class="add-effect-btn" onclick={addEffect}>+ Effect</button>
			{/if}
		</div>

		{#if power.isArray}
			<div class="alt-effects-section">
				<div class="alt-effects-head">Alternate Effects</div>
				{#each power.alternateEffects as alt, ai}
					<AlternateEffectEditor alt={alt} onRemove={() => removeAlternateEffect(ai)} {allowNestedSummon} />
				{/each}
				<button class="add-alt-btn" onclick={addAlternateEffect}>+ Alternate Effect</button>
			</div>
		{/if}
	{/if}
</div>

