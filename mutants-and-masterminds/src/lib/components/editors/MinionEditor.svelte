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

<style>
	.minion-editor { display:flex; flex-direction:column; gap:10px; }
	.mini-section { border:2px solid var(--border); padding:10px; background:color-mix(in srgb, var(--panel-bg) 40%, transparent); }
	.mini-section-label { font-family:'Oswald',sans-serif; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent); margin-bottom:6px; }
	.mini-power-card { border:1.5px solid var(--border); margin-bottom:4px; background:color-mix(in srgb, var(--panel-bg) 60%, transparent); }
	.mini-power-header { display:flex; align-items:center; gap:4px; padding:4px 6px; cursor:pointer; }
	.mini-power-name { flex:1; padding:3px 6px; border:1.5px solid var(--border); font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); background:var(--newsprint); outline:none; }
	.mini-power-name:focus { border-color:var(--secondary); }
	.mini-desc { width:100%; padding:4px 6px; border:1.5px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; resize:vertical; box-sizing:border-box; margin-top:2px; }
	.mini-desc:focus { border-color:var(--secondary); }
	.mini-effects { padding:4px 6px 6px; }
	.mini-effects-head { font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--primary); margin-bottom:3px; }
	.mini-effect-card { border:1.5px solid var(--border); margin-bottom:3px; background:color-mix(in srgb, var(--panel-bg) 80%, transparent); }
	.mini-effect-header { display:flex; align-items:center; gap:3px; padding:3px 5px; cursor:pointer; }
	.mini-effect-input { flex:1; padding:2px 5px; border:1.5px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; min-width:0; }
	.mini-effect-input:focus { border-color:var(--secondary); }
	.mini-num { width:50px; padding:2px 4px; border:1.5px solid var(--border); font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--ink); background:var(--newsprint); outline:none; text-align:center; }
	.mini-num:focus { border-color:var(--secondary); }
	.mini-mods { padding:3px 5px 5px 14px; }
	.mini-mod-row { display:flex; align-items:center; gap:3px; margin-bottom:2px; }
	.mini-mod-input { flex:1; padding:2px 5px; border:1.5px solid var(--border); font-family:'Nunito',sans-serif; font-size:10px; color:var(--ink); background:var(--newsprint); outline:none; min-width:0; }
	.mini-mod-input:focus { border-color:var(--secondary); }
	.mini-mod-type { padding:2px; border:1.5px solid var(--border); font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; color:var(--ink); background:var(--newsprint); outline:none; }
	.mini-num-sm { width:40px; padding:2px 4px; border:1.5px solid var(--border); font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; color:var(--ink); background:var(--newsprint); outline:none; text-align:center; }
	.mini-flat { font-family:'Oswald',sans-serif; font-size:9px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:2px; white-space:nowrap; }
	.mini-flat input { margin:0; }
	.mini-remove-btn { background:var(--danger); border:none; color:white; font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; cursor:pointer; padding:1px 7px; line-height:1; flex-shrink:0; }
	.mini-remove-btn.sm { font-size:8px; padding:1px 5px; }
	.mini-add-btn { background:var(--primary); border:2px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; cursor:pointer; padding:4px 10px; margin-top:2px; text-transform:uppercase; letter-spacing:0.05em; }
	.mini-sm-btn { background:var(--secondary); border:1.5px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:9px; font-weight:700; cursor:pointer; padding:2px 8px; margin-top:2px; }
	.collapse-icon { font-size:8px; color:var(--accent); flex-shrink:0; }
</style>
