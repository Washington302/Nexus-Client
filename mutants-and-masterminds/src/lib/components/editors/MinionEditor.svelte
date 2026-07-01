<script lang="ts">
	import type { MinionStatBlock, Power, PowerEffect, PowerModifier } from '$lib/services/api';
	import AbilitiesEditor from './AbilitiesEditor.svelte';
	import DefensesEditor from './DefensesEditor.svelte';
	import SkillsEditor from './SkillsEditor.svelte';
	import AdvantagesEditor from './AdvantagesEditor.svelte';

	let {
		minion
	}: {
		minion: MinionStatBlock
	} = $props();

	let collapsedPowers = $state<Record<number, boolean>>({});
	let collapsedEffects = $state<Record<string, boolean>>({});

	$effect(() => {
		if (!minion.combatState) {
			minion.combatState = { conditions: [], damage: 0, dying: 0, staggered: false, accumulatedToughnessPenalty: 0, activeConditions: [] };
		}
	});

	function togglePower(pi: number) {
		collapsedPowers = { ...collapsedPowers, [pi]: !collapsedPowers[pi] };
	}

	function toggleEffect(key: string) {
		collapsedEffects = { ...collapsedEffects, [key]: !collapsedEffects[key] };
	}

	function addPower() {
		minion.powers.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			isArray: false,
			effects: [],
			alternateEffects: [],
			totalPowerCost: 0,
			maxPpPool: 0
		});
	}

	function addEffect(power: Power) {
		power.effects.push({
			effectName: '',
			baseEffect: '',
			isPrimary: power.effects.length === 0,
			rank: 1,
			baseCostPerRank: 2,
			modifiers: [],
			calculatedCost: 0,
			isSummon: false,
			manualAtkBonus: 0, manualRankBonus: 0,
		});
	}

	function removeEffect(power: Power, ei: number) {
		power.effects.splice(ei, 1);
	}

	function addModifier(effect: PowerEffect) {
		effect.modifiers.push({ name: '', type: 'EXTRA', costModifier: 1, isFlat: false });
	}

	function removeModifier(effect: PowerEffect, mi: number) {
		effect.modifiers.splice(mi, 1);
	}
</script>

<div class="minion-editor">
	<div class="mini-section">
		<div class="mini-section-label">Abilities</div>
		<AbilitiesEditor abilities={minion.abilities} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Defenses</div>
		<DefensesEditor defenses={minion.defenses} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Skills</div>
		<SkillsEditor skills={minion.skills} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Advantages</div>
		<AdvantagesEditor advantages={minion.advantages} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Combat State</div>
		<div class="combat-state-editor">
			<div class="cs-row">
				<label class="cs-lbl">Damage</label>
				<input type="number" class="cs-input" bind:value={minion.combatState.damage} min="0" />
				<label class="cs-lbl">Penalty</label>
				<input type="number" class="cs-input" bind:value={minion.combatState.accumulatedToughnessPenalty} min="0" />
			</div>
			<div class="cs-row">
				<label class="cs-lbl">Dying</label>
				<input type="number" class="cs-input" bind:value={minion.combatState.dying} min="0" max="3" />
				<label class="cs-check">
					<input type="checkbox" checked={minion.combatState.staggered} onchange={() => minion.combatState.staggered = !minion.combatState.staggered} />
					Staggered
				</label>
			</div>
		</div>
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Powers</div>
		{#each minion.powers as power, pi}
			<div class="mini-power-card">
				<div class="mini-power-header" onclick={() => togglePower(pi)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && togglePower(pi)}>
					<span class="collapse-icon">{collapsedPowers[pi] ? '\u25B6' : '\u25BC'}</span>
					<input type="text" bind:value={power.name} placeholder="Power name" class="mini-power-name" onclick={(e) => e.stopPropagation()} />
					<button class="mini-remove-btn" onclick={() => minion.powers.splice(pi, 1)}>x</button>
				</div>
				{#if !collapsedPowers[pi]}
					<textarea class="mini-desc" bind:value={power.description} placeholder="Description" rows="1"></textarea>
					<div class="mini-effects">
						<div class="mini-effects-head">Effects</div>
						{#each power.effects as effect, ei}
							{@const ek = pi + '-' + ei}
							<div class="mini-effect-card">
								<div class="mini-effect-header" onclick={() => toggleEffect(ek)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleEffect(ek)}>
									<span class="collapse-icon">{collapsedEffects[ek] ? '\u25B6' : '\u25BC'}</span>
									<input type="text" bind:value={effect.effectName} placeholder="Effect name" class="mini-effect-input" onclick={(e) => e.stopPropagation()} />
									<input type="number" class="mini-num" bind:value={effect.rank} placeholder="Rank" onclick={(e) => e.stopPropagation()} />
									<input type="number" class="mini-num" bind:value={effect.baseCostPerRank} placeholder="PP/r" onclick={(e) => e.stopPropagation()} />
									<button class="mini-remove-btn sm" onclick={() => removeEffect(power, ei)}>x</button>
								</div>
								{#if !collapsedEffects[ek]}
									<div class="mini-mods">
										{#each effect.modifiers as mod, mi}
											<div class="mini-mod-row">
												<input type="text" bind:value={mod.name} placeholder="Modifier" class="mini-mod-input" />
												<select class="mini-mod-type" bind:value={mod.type}>
													<option value="EXTRA">Extra</option>
													<option value="FLAW">Flaw</option>
												</select>
												<input type="number" class="mini-num-sm" bind:value={mod.costModifier} />
												<label class="mini-flat"><input type="checkbox" checked={mod.isFlat} onchange={() => mod.isFlat = !mod.isFlat} /> Flat</label>
												<button class="mini-remove-btn sm" onclick={() => removeModifier(effect, mi)}>x</button>
											</div>
										{/each}
										<button class="mini-sm-btn" onclick={() => addModifier(effect)}>+ Modifier</button>
									</div>
								{/if}
							</div>
						{/each}
						<button class="mini-sm-btn" onclick={() => addEffect(power)}>+ Effect</button>
					</div>
				{/if}
			</div>
		{/each}
		<button class="mini-add-btn" onclick={addPower}>+ Power</button>
	</div>
</div>

