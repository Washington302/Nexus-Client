<script lang="ts">
	import EffectEditor from './EffectEditor.svelte';
	import AlternateEffectEditor from './AlternateEffectEditor.svelte';
	import { computeDeviceCost, createDefaultAlternateEffect, createDefaultEffect } from '$lib/utils/character';

	let {
		power,
		depth = 0,
	}: { power: any; depth?: number } = $props();

	function calcDeviceCost(p: any): { raw: number; discount: number; final: number } {
		return computeDeviceCost(p, p._embeddedPowers ?? []);
	}

	function addEmbeddedPower() {
		if (!power._embeddedPowers) power._embeddedPowers = [];
		power._embeddedPowers.push({
			powerId: crypto.randomUUID(), name: '', description: '', descriptors: [],
			array: false, maxPpPool: 0, effects: [], alternateEffects: [], totalPowerCost: 0,
		});
	}

	function removeEmbeddedPower(ei: number) {
		power._embeddedPowers.splice(ei, 1);
	}

	function toggleArray(ep: any) {
		ep.array = !ep.array;
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

	let collapsedEmbedded = $state<Record<string, boolean>>({});

	function isCollapsed(ep: any): boolean {
		return collapsedEmbedded[ep.powerId] ?? true;
	}

	function toggleCollapse(ep: any) {
		collapsedEmbedded[ep.powerId] = !isCollapsed(ep);
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
					<button class="collapse-btn" onclick={() => toggleCollapse(ep)} type="button" title={isCollapsed(ep) ? 'Expand' : 'Collapse'}>
						<span class="collapse-icon">{isCollapsed(ep) ? '▶' : '▼'}</span>
					</button>
					<input type="text" class="power-name-input" bind:value={ep.name} placeholder="Embedded power name" />
					<label class="array-toggle">
						<input type="checkbox" checked={ep.array} onchange={() => toggleArray(ep)} />
						<span class="array-label">Array</span>
					</label>
					<button class="remove-btn sm" onclick={() => removeEmbeddedPower(ei)}>&#10005;</button>
				</div>
				{#if !isCollapsed(ep)}
				<div class="embedded-effects">
					<textarea class="desc-textarea" bind:value={ep.description} placeholder="What does this power do?" rows="2"></textarea>
					{#if ep.array}
						<div class="descriptors-row">
							<input type="text" class="desc-input" bind:value={ep.arrayName} placeholder="Array name (optional, defaults to power name)" />
						</div>
						<div class="descriptors-row">
							<input type="text" class="desc-input" bind:value={ep.activeSlotName} placeholder="Active slot label (optional, defaults to listing every effect)" />
						</div>
						<textarea class="desc-textarea" bind:value={ep.activeSlotDescription} placeholder="Active slot description (optional)" rows="2"></textarea>
						<label class="array-toggle">
							<input type="checkbox" bind:checked={ep.primarySlotDynamic} />
							<span class="array-label">Primary slot is Dynamic (+1 PP)</span>
						</label>
					{/if}
					<div class="effects-section">
						<div class="effects-head">{ep.array ? (ep.activeSlotName || 'Active Slot Effects') : 'Effects'}</div>
						{#each ep.effects as effect, eei}
							<EffectEditor effect={effect} onRemove={() => removeEffect(ep.effects, eei)} {depth} />
						{/each}
						<button class="add-effect-btn" onclick={() => addEffect(ep.effects)}>+ Effect</button>
					</div>
					{#if ep.array}
						<div class="alt-section">
							<div class="alt-effects-head">Alternate Effects</div>
							{#each ep.alternateEffects as alt, ai}
								<AlternateEffectEditor alt={alt} onRemove={() => removeAlternateEffect(ep, ai)} {depth} />
							{/each}
							<button class="add-alt-btn" onclick={() => addAlternateEffect(ep)}>+ Alternate Effect</button>
						</div>
					{/if}
				</div>
				{/if}
			</div>
		{/each}
		<button class="add-embedded-btn" onclick={addEmbeddedPower}>+ Embedded Power</button>
	</div>
</div>

