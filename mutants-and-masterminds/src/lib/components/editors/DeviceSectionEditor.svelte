<script lang="ts">
	import EffectEditor from './EffectEditor.svelte';
	import AlternateEffectEditor from './AlternateEffectEditor.svelte';
	import { computeDeviceCost, createDefaultAlternateEffect, createDefaultEffect } from '$lib/utils/character';

	let {
		power,
		allowNestedSummon = true,
	}: { power: any; allowNestedSummon?: boolean } = $props();

	function calcDeviceCost(p: any): { raw: number; discount: number; final: number } {
		return computeDeviceCost(p, p._embeddedPowers ?? []);
	}

	function addEmbeddedPower() {
		if (!power._embeddedPowers) power._embeddedPowers = [];
		power._embeddedPowers.push({
			powerId: crypto.randomUUID(), name: '', description: '', descriptors: [],
			isArray: false, maxPpPool: 0, effects: [], alternateEffects: [], totalPowerCost: 0,
		});
	}

	function removeEmbeddedPower(ei: number) {
		power._embeddedPowers.splice(ei, 1);
	}

	function toggleArray(ep: any) {
		ep.isArray = !ep.isArray;
	}

	function addEffect(effects: any[]) {
		effects.push(createDefaultEffect(effects.length === 0));
	}

	function removeEffect(effects: any[], ei: number) {
		effects.splice(ei, 1);
	}

	function addAlternateEffect(ep: any) {
		ep.alternateEffects.push(createDefaultAlternateEffect());
	}

	function removeAlternateEffect(ep: any, ai: number) {
		ep.alternateEffects.splice(ai, 1);
	}
</script>

<div class="device-section">
	<div class="device-head">Device</div>
	<div class="device-type-row">
		<select class="type-select" bind:value={power._deviceType}>
			<option value="REMOVABLE">Removable (-1 per 5 PP)</option>
			<option value="EASILY_REMOVABLE">Easily Removable (-2 per 5 PP)</option>
		</select>
	</div>
	<div class="device-cost-row">
		<span class="device-cost-item">Raw: <strong>{calcDeviceCost(power).raw} PP</strong></span>
		<span class="device-cost-item">Discount: <strong class="discount">-{calcDeviceCost(power).discount} PP</strong></span>
		<span class="device-cost-item">Final: <strong>{calcDeviceCost(power).final} PP</strong></span>
	</div>
	<div class="embedded-powers">
		<div class="embedded-head">Embedded Powers</div>
		{#each power._embeddedPowers as ep, ei}
			<div class="embedded-card">
				<div class="embedded-header">
					<input type="text" class="power-name-input" bind:value={ep.name} placeholder="Embedded power name" />
					<label class="array-toggle">
						<input type="checkbox" checked={ep.isArray} onchange={() => toggleArray(ep)} />
						<span class="array-label">Array</span>
					</label>
					<button class="remove-btn sm" onclick={() => removeEmbeddedPower(ei)}>&#10005;</button>
				</div>
				<div class="embedded-effects">
					<div class="effects-section">
						<div class="effects-head">{ep.isArray ? 'Active Slot Effects' : 'Effects'}</div>
						{#each ep.effects as effect, eei}
							<EffectEditor effect={effect} onRemove={() => removeEffect(ep.effects, eei)} {allowNestedSummon} />
						{/each}
						<button class="add-effect-btn" onclick={() => addEffect(ep.effects)}>+ Effect</button>
					</div>
					{#if ep.isArray}
						<div class="alt-section">
							<div class="alt-effects-head">Alternate Effects</div>
							{#each ep.alternateEffects as alt, ai}
								<AlternateEffectEditor alt={alt} onRemove={() => removeAlternateEffect(ep, ai)} {allowNestedSummon} />
							{/each}
							<button class="add-alt-btn" onclick={() => addAlternateEffect(ep)}>+ Alternate Effect</button>
						</div>
					{/if}
				</div>
			</div>
		{/each}
		<button class="add-embedded-btn" onclick={addEmbeddedPower}>+ Embedded Power</button>
	</div>
</div>

