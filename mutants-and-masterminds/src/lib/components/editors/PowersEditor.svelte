<script lang="ts">
	import type { Power, PowerEffect, PowerModifier, AlternateEffect } from '$lib/services/api';
	import { createDefaultMinionStatblock } from '$lib/utils/character';
	import MinionEditor from './MinionEditor.svelte';

	let {
		powers
	}: {
		powers: Power[]
	} = $props();

	function effectCost(effect: PowerEffect): number {
		let perRank = effect.baseCostPerRank;
		let flat = 0;
		for (const m of effect.modifiers) {
			if (m.isFlat) {
				flat += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			} else {
				perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			}
		}
		return perRank * effect.rank + flat;
	}

	function powerCost(power: Power): number {
		const active = power.effects.reduce((sum, e) => sum + effectCost(e), 0);
		const alts = power.alternateEffects.reduce((sum, a) => {
			const altActive = a.effects.reduce((s, e) => s + effectCost(e), 0);
			return Math.max(sum, altActive);
		}, 0);
		return Math.max(active, alts) + power.alternateEffects.length;
	}

	function perRankCost(effect: PowerEffect): number {
		let perRank = effect.baseCostPerRank;
		for (const m of effect.modifiers) {
			if (!m.isFlat) {
				perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			}
		}
		return perRank;
	}

	$effect(() => {
		for (const power of powers) {
			power.totalPowerCost = powerCost(power);
			for (const alt of power.alternateEffects) {
				alt.costPerRank = alt.effects.reduce((sum, e) => sum + perRankCost(e), 0);
				alt.currentAllocatedRank = alt.effects[0]?.rank ?? 0;
			}
			for (const e of power.effects) {
				if (e.effectName.toLowerCase() === 'summon') e.isSummon = true;
				e.calculatedCost = effectCost(e);
				if (e.isSummon && e.summonExtension) {
					e.summonExtension.summonRank = e.rank;
					e.summonExtension.minionPpBudget = e.rank * 15;
					if (!e.summonExtension.minionStatBlock) {
						e.summonExtension.minionStatBlock = createDefaultMinionStatblock(e.rank);
					}
				}
			}
		}
	});

	let collapsedPowers = $state<Record<number, boolean>>({});

	function togglePowerCollapse(i: number) {
		collapsedPowers = { ...collapsedPowers, [i]: !collapsedPowers[i] };
	}

	function addPower() {
		powers.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			isArray: false,
			maxPpPool: 0,
			effects: [],
			alternateEffects: [],
			totalPowerCost: 0,
		});
	}

	function removePower(i: number) {
		powers.splice(i, 1);
	}

	function toggleArray(power: Power) {
		power.isArray = !power.isArray;
	}

	function addEffect(effects: PowerEffect[]) {
		effects.push({
			effectName: '',
			baseEffect: '',
			isPrimary: effects.length === 0,
			rank: 1,
			baseCostPerRank: 2,
			modifiers: [],
			calculatedCost: 0,
			isSummon: false,
		});
	}

	function removeEffect(effects: PowerEffect[], ei: number) {
		effects.splice(ei, 1);
	}

	function addModifier(effect: PowerEffect) {
		effect.modifiers.push({
			name: '',
			type: 'EXTRA',
			costModifier: 1,
			isFlat: false,
		});
	}

	function removeModifier(effect: PowerEffect, mi: number) {
		effect.modifiers.splice(mi, 1);
	}

	function addAlternateEffect(power: Power) {
		power.alternateEffects.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			arrayType: 'ALTERNATE',
			costPerRank: 0,
			currentAllocatedRank: 0,
			effects: [],
		});
	}

	function removeAlternateEffect(power: Power, ai: number) {
		power.alternateEffects.splice(ai, 1);
	}
</script>

<div class="editor-grid">
	{#each powers as power, i}
		<div class="power-card">
			<div class="power-header" onclick={() => togglePowerCollapse(i)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && togglePowerCollapse(i)}>
				<span class="collapse-icon">{collapsedPowers[i] ? '\u25B6' : '\u25BC'}</span>
				<input type="text" class="power-name-input" bind:value={power.name} placeholder="Power name" onclick={(e) => e.stopPropagation()} />
				<label class="array-toggle">
					<input type="checkbox" checked={power.isArray} onchange={() => toggleArray(power)} />
					<span class="array-label">Array</span>
				</label>
				<button class="remove-btn" onclick={() => removePower(i)}>&#10005;</button>
			</div>
			{#if !collapsedPowers[i]}
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

			<div class="effects-section">
				<div class="effects-head">{power.isArray ? 'Active Slot Effects' : 'Effects'}</div>
				{#each power.effects as effect, ei}
					<div class="effect-card">
								<div class="effect-row">
								<input type="text" class="effect-input" bind:value={effect.effectName} placeholder="Effect name" />
								<button class="combat-toggle" class:active={effect._showInCombat} onclick={() => effect._showInCombat = !effect._showInCombat} title="Show in combat">⚔</button>
								<button class="combat-toggle" class:active={effect._isThrownWeapon} onclick={() => effect._isThrownWeapon = !effect._isThrownWeapon} title="Strength-based damage">💪</button>
								<div class="effect-meta">
								<label class="sm-label">Rank</label>
								<input type="number" class="sm-input sm-input-sm" bind:value={effect.rank} />
								<label class="sm-label">PP/r</label>
								<input type="number" class="sm-input sm-input-sm" bind:value={effect.baseCostPerRank} />
							</div>
							<button class="remove-btn sm" onclick={() => removeEffect(power.effects, ei)}>&#10005;</button>
						</div>
						<div class="modifiers-section">
							<div class="mods-head">Modifiers</div>
							{#each effect.modifiers as mod, mi}
								<div class="mod-row">
									<input type="text" class="mod-input" bind:value={mod.name} placeholder="Modifier name" />
									<select class="mod-type-select" bind:value={mod.type}>
										<option value="EXTRA">Extra</option>
										<option value="FLAW">Flaw</option>
									</select>
									<div class="mod-meta">
										<label class="sm-label">Cost</label>
										<input type="number" class="sm-input sm-input-sm" bind:value={mod.costModifier} />
									</div>
									<label class="flat-toggle">
										<input type="checkbox" checked={mod.isFlat} onchange={() => mod.isFlat = !mod.isFlat} />
										<span class="sm-label">Flat</span>
									</label>
									<button class="remove-btn sm" onclick={() => removeModifier(effect, mi)}>&#10005;</button>
								</div>
							{/each}
							<button class="add-mod-btn" onclick={() => addModifier(effect)}>+ Modifier</button>
						</div>
						{#if effect.effectName?.toLowerCase() === 'summon' || effect.isSummon}
						<label class="summon-toggle">
							<input type="checkbox" bind:checked={effect.isSummon} />
							<span class="sm-label">Summon</span>
						</label>
						{#if effect.isSummon}
							{@const summonRank = effect.rank}
							{@const ppBudget = summonRank * 15}
							<div class="summon-section">
								<div class="summon-head">Minion &middot; PL {summonRank} &middot; {ppBudget} PP</div>
								{#if !effect.summonExtension}
									{@const _ = effect.summonExtension = { summonRank, minionPpBudget: ppBudget, minionStatBlock: createDefaultMinionStatblock(summonRank) }}
								{/if}
								{#if effect.summonExtension}
									{@const se = effect.summonExtension}
									<input type="text" class="summon-name-input" value={se.minionStatBlock?.name ?? ''}
										oninput={(e) => { const v = (e.target as HTMLInputElement).value; if (se.minionStatBlock) se.minionStatBlock.name = v; }}
										placeholder="Minion name" />
									<button class="edit-minion-btn" onclick={() => { (se as any)._expanded = !(se as any)._expanded; }} type="button">{(se as any)._expanded ? 'Collapse Minion' : 'Edit Minion'}</button>
									{#if (se as any)._expanded && se.minionStatBlock}
										<div class="minion-expanded"><MinionEditor minion={se.minionStatBlock} /></div>
									{/if}
								{/if}
							</div>
						{/if}
						{/if}
					</div>
				{/each}
				<button class="add-effect-btn" onclick={() => addEffect(power.effects)}>+ Effect</button>
			</div>

			{#if power.isArray}
				<div class="alt-effects-section">
					<div class="alt-effects-head">Alternate Effects</div>
					{#each power.alternateEffects as alt, ai}
						<div class="alt-card">
							<div class="alt-header-row">
								<input type="text" class="alt-name-input" bind:value={alt.name} placeholder="Alternate name" />
								<select class="type-select" bind:value={alt.arrayType}>
									<option value="ALTERNATE">Alternate</option>
									<option value="DYNAMIC">Dynamic</option>
								</select>
								<button class="remove-btn sm" onclick={() => removeAlternateEffect(power, ai)}>&#10005;</button>
							</div>
							<textarea class="alt-desc-input" bind:value={alt.description} placeholder="Description"></textarea>
							<div class="descriptors-row">
								<input type="text" class="desc-input" value={alt.descriptors?.[0] ?? ''}
									oninput={(e) => { const v = (e.target as HTMLInputElement).value; alt.descriptors = v ? [v] : []; }}
									placeholder="Descriptors" />
							</div>
							<div class="alt-meta-row">
								<label class="sm-label">Cost/r</label>
								<input type="number" class="sm-input sm-input-sm" bind:value={alt.costPerRank} />
								<label class="sm-label">Alloc Rank</label>
								<input type="number" class="sm-input sm-input-sm" bind:value={alt.currentAllocatedRank} />
							</div>
							<div class="alt-effects-list">
								{#each alt.effects as effect, ei}
									<div class="effect-card">
												<div class="effect-row">
													<input type="text" class="effect-input" bind:value={effect.effectName} placeholder="Effect name" />
													<button class="combat-toggle" class:active={effect._showInCombat} onclick={() => effect._showInCombat = !effect._showInCombat} title="Show in combat">⚔</button>
													<button class="combat-toggle" class:active={effect._isThrownWeapon} onclick={() => effect._isThrownWeapon = !effect._isThrownWeapon} title="Strength-based damage">💪</button>
													<div class="effect-meta">
												<label class="sm-label">Rank</label>
												<input type="number" class="sm-input sm-input-sm" bind:value={effect.rank} />
												<label class="sm-label">PP/r</label>
												<input type="number" class="sm-input sm-input-sm" bind:value={effect.baseCostPerRank} />
											</div>
											<button class="remove-btn sm" onclick={() => removeEffect(alt.effects, ei)}>&#10005;</button>
										</div>
										<div class="modifiers-section">
											<div class="mods-head">Modifiers</div>
											{#each effect.modifiers as mod, mi}
												<div class="mod-row">
													<input type="text" class="mod-input" bind:value={mod.name} placeholder="Modifier name" />
													<select class="mod-type-select" bind:value={mod.type}>
														<option value="EXTRA">Extra</option>
														<option value="FLAW">Flaw</option>
													</select>
													<div class="mod-meta">
														<label class="sm-label">Cost</label>
														<input type="number" class="sm-input sm-input-sm" bind:value={mod.costModifier} />
													</div>
													<label class="flat-toggle">
														<input type="checkbox" checked={mod.isFlat} onchange={() => mod.isFlat = !mod.isFlat} />
														<span class="sm-label">Flat</span>
													</label>
													<button class="remove-btn sm" onclick={() => removeModifier(effect, mi)}>&#10005;</button>
												</div>
											{/each}
											<button class="add-mod-btn" onclick={() => addModifier(effect)}>+ Modifier</button>
										</div>
									</div>
								{/each}
								<button class="add-effect-btn" onclick={() => addEffect(alt.effects)}>+ Effect</button>
							</div>
						</div>
					{/each}
					<button class="add-alt-btn" onclick={() => addAlternateEffect(power)}>+ Alternate Effect</button>
				</div>
			{/if}
			{/if}
		</div>
	{/each}
	<button class="add-btn" onclick={addPower}>+ Add Power</button>
</div>

<style>
	.editor-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.power-card {
		border: 2px solid var(--border);
		padding: 8px;
		background: var(--newsprint);
	}
	.power-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}
	.power-name-input {
		flex: 1;
		padding: 5px 8px;
		border: 2px solid var(--border);
		font-family: 'Bangers', cursive;
		font-size: 15px;
		color: var(--ink);
		background: var(--panel-bg);
		outline: none;
	}
	.power-name-input:focus {
		border-color: var(--primary);
	}
	.array-toggle {
		display: flex;
		align-items: center;
		gap: 3px;
		cursor: pointer;
	}
	.array-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
	}
	.desc-textarea {
		width: 100%;
		padding: 5px 8px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
		resize: vertical;
		margin-bottom: 6px;
		box-sizing: border-box;
	}
	.desc-textarea:focus {
		border-color: var(--primary);
	}
	.descriptors-row {
		margin-bottom: 6px;
	}
	.cost-label { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.06em; }
	.cost-value { font-family:'Bangers',cursive; font-size:12px; color:var(--primary); letter-spacing:0.03em; }
	.desc-input {
		width: 100%;
		padding: 4px 8px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.desc-input:focus {
		border-color: var(--primary);
	}
	.pool-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
		flex-wrap: wrap;
	}
	.type-select {
		padding: 2px 4px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 600;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.type-select:focus {
		border-color: var(--primary);
	}
	.sm-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--accent);
	}
	.sm-input {
		width: 50px;
		padding: 3px 6px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		text-align: center;
		outline: none;
	}
	.sm-input-sm { width: 40px; }
	.sm-input:focus {
		border-color: var(--primary);
	}
	.effects-section {
		border-top: 2px solid var(--border);
		padding-top: 6px;
	}
	.effects-head {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		margin-bottom: 4px;
	}
	.effect-card {
		margin-bottom: 6px;
		padding: 6px;
		border: 1px solid var(--border);
		background: var(--panel-bg);
	}
	.effect-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}
	.effect-input {
		flex: 1;
		padding: 3px 6px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.effect-input:focus {
		border-color: var(--primary);
	}
	.effect-meta {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.modifiers-section {
		border-top: 1px dashed var(--border);
		padding-top: 4px;
		margin-top: 4px;
	}
	.mods-head {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		margin-bottom: 3px;
	}
	.mod-row {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 3px;
		flex-wrap: wrap;
	}
	.mod-input {
		flex: 1;
		min-width: 80px;
		padding: 2px 5px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 12px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.mod-input:focus {
		border-color: var(--primary);
	}
	.mod-type-select {
		padding: 2px 4px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 600;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.mod-type-select:focus {
		border-color: var(--primary);
	}
	.mod-meta {
		display: flex;
		align-items: center;
		gap: 3px;
	}
	.flat-toggle {
		display: flex;
		align-items: center;
		gap: 2px;
		cursor: pointer;
	}
	.alt-effects-section {
		border-top: 2px solid var(--highlight);
		padding-top: 6px;
		margin-top: 6px;
	}
	.alt-effects-head {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--danger);
		text-transform: uppercase;
		margin-bottom: 4px;
	}
	.alt-card {
		margin-bottom: 6px;
		padding: 6px;
		border: 2px solid var(--highlight);
		background: var(--panel-bg);
	}
	.alt-header-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}
	.alt-name-input {
		flex: 1;
		padding: 3px 6px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.alt-name-input:focus {
		border-color: var(--primary);
	}
	.alt-desc-input { width:100%; padding:4px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; resize:vertical; min-height:36px; box-sizing:border-box; margin-bottom:4px; }
	.alt-desc-input:focus { border-color:var(--primary); }
	.alt-meta-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}
	.alt-effects-list {
		padding-left: 4px;
		border-left: 2px solid var(--highlight);
	}
	.add-alt-btn {
		background: var(--danger);
		border: 2px solid var(--border);
		color: white;
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		padding: 4px 10px;
		cursor: pointer;
		align-self: flex-start;
		letter-spacing: 0.04em;
		margin-top: 2px;
	}
	.remove-btn {
		background: var(--danger);
		border: 2px solid var(--border);
		color: white;
		width: 26px;
		height: 26px;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		flex-shrink: 0;
	}
	.remove-btn.sm {
		width: 22px;
		height: 22px;
		font-size: 12px;
	}
	.add-btn, .add-effect-btn, .add-mod-btn {
		background: var(--primary);
		border: 2px solid var(--border);
		color: white;
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		padding: 6px 12px;
		cursor: pointer;
		align-self: flex-start;
		letter-spacing: 0.04em;
	}
	.add-effect-btn {
		font-size: 12px;
		padding: 4px 10px;
		margin-top: 2px;
	}
	.add-mod-btn {
		font-size: 15px;
		padding: 3px 8px;
		margin-top: 2px;
	}
	.summon-toggle { display:flex; align-items:center; gap:4px; margin-top:4px; padding:4px 6px; background:color-mix(in srgb, var(--secondary) 15%, transparent); border:1.5px solid var(--secondary); cursor:pointer; }
	.summon-section { margin-top:4px; padding:6px; border:1.5px solid var(--secondary); background:color-mix(in srgb, var(--panel-bg) 50%, transparent); }
	.summon-head { font-family:'Oswald',sans-serif; font-size:13px; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; }
	.summon-name-input { width:100%; padding:4px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:13px; color:var(--ink); background:var(--newsprint); outline:none; box-sizing:border-box; }
	.summon-name-input:focus { border-color:var(--secondary); }
	.edit-minion-btn { width:100%; margin-top:4px; background:var(--secondary); border:2px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; padding:4px 0; cursor:pointer; }
	.minion-expanded { margin-top:6px; padding:8px; border:2px solid var(--secondary); background:color-mix(in srgb, var(--panel-bg) 50%, transparent); max-height:400px; overflow-y:auto; }
	.power-header { cursor:pointer; }
	.collapse-icon { font-size:10px; color:var(--accent); margin-right:2px; }
	.combat-toggle { background:none; border:1.5px solid var(--border); border-radius:4px; font-size:14px; cursor:pointer; padding:1px 5px; line-height:1; opacity:.4; transition:opacity .15s; }
	.combat-toggle.active { opacity:1; border-color:var(--danger); background:color-mix(in srgb, var(--danger) 15%, transparent); }
</style>
