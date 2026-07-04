<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { MnmCharacter } from '$lib/services/api';
	import { ensureDefaults, initNormalizePower, recomputeCharacterCosts, abilityMod, resistanceLabel, effectResistance } from '$lib/utils/character';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import StatBubble from '$lib/components/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import PowerDisplayCard from '$lib/components/PowerDisplayCard.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import IdentityPanel from '$lib/components/IdentityPanel.svelte';
	import ConditionsPanel from '$lib/components/ConditionsPanel.svelte';
	import DefensesDisplay from '$lib/components/DefensesDisplay.svelte';
	import AttackActionCard from '$lib/components/AttackActionCard.svelte';

	let char = $state<MnmCharacter | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	// Conditions & Maneuvers State (Keep local session tracking intact for public viewers)
	type ConditionKey = 'vulnerable' | 'defenseless' | 'impaired' | 'disabled' | 'hindered' | 'dazed' | 'stunned' | 'fatigued' | 'exhausted' | 'incapacitated';
	let activeConditions = $state<Set<ConditionKey>>(new Set());
	let activeDefensePowerMods = $state<Set<string>>(new Set());

	let allOutAttack = $state(0);
	let powerAttack = $state(0);
	let accurateAttack = $state(0);
	let defensiveAttack = $state(0);

	// Dynamic Section Sorting Parity
	type SectionKey = 'skills' | 'advantages' | 'equipment' | 'powers';
	let priorityOrder = $state<SectionKey[]>([]);

	$effect(() => {
		if (char && priorityOrder.length === 0) {
			const weights: Record<SectionKey, number> = {
				skills: (char.skills?.length ?? 0) + (char.spentSkills ?? 0),
				advantages: (char.advantages?.length ?? 0) + (char.spentAdvantages ?? 0),
				equipment: (char.equipmentPool?.items?.length ?? 0) + (char.equipmentPool?.epSpent ?? 0) + (char.headquarters?.length ?? 0) * 5,
				powers: (char.powers?.length ?? 0) + (char.spentPowers ?? 0),
			};
			priorityOrder = (['skills', 'advantages', 'equipment', 'powers'] as SectionKey[]).sort((a, b) => weights[b] - weights[a]);
		}
	});

	// Math & Derived Calculation Helpers for Parity
	function abiVal(key: string): number { return (char?.abilities as any)?.[key + 'FinalValue'] ?? 0; }
	function abiModVal(key: string): number { return abilityMod(abiVal(key)); }
	function abiAbsent(key: string): boolean { return (char?.abilities as any)?.[key + 'Absent'] ?? false; }
	function defPointsBought(key: string): number { return (char?.defenses as any)?.[key + 'PointsBought'] ?? 0; }
	function defOtherMods(key: string): number { return (char?.defenses as any)?.[key + 'OtherModifiers'] ?? 0; }
	function defensiveRollRanks(): number {
		let ranks = 0;
		for (const a of (char?.advantages ?? [])) {
			if (a.name?.toLowerCase().includes('defensive roll')) ranks += a.ranks ?? 0;
		}
		return ranks;
	}
	function improvedInitiativeRanks(): number {
		for (const a of (char?.advantages ?? [])) {
			if (a.name?.toLowerCase() === 'improved initiative') return a.ranks ?? 0;
		}
		return 0;
	}

	function getDefenseFinalLocal(key: string, abilityKey: string): { value: number; immune: boolean } {
		const absent = abiAbsent(abilityKey);
		if (absent) return { value: 0, immune: true };
		let base = abiModVal(abilityKey) + defPointsBought(key) + (activeDefensePowerMods.has(key) ? defOtherMods(key) : 0);
		if (activeConditions.has('impaired')) base -= 2;
		if (activeConditions.has('disabled')) base -= 5;
		if (activeConditions.has('fatigued')) base -= 1;
		if (activeConditions.has('exhausted')) base -= 2;
		if (key === 'dodge' || key === 'parry') {
			if (activeConditions.has('defenseless')) base = 0;
			else if (activeConditions.has('vulnerable')) base = Math.ceil(base / 2);
			base -= allOutAttack + defensiveAttack;
		}
		return { value: Math.max(0, base), immune: false };
	}

	function getToughnessFinalLocal(): { value: number; immune: boolean } {
		let base = abiModVal('stamina') + defPointsBought('toughness') + defensiveRollRanks() + (activeDefensePowerMods.has('toughness') ? defOtherMods('toughness') : 0);
		if (activeConditions.has('impaired')) base -= 2;
		if (activeConditions.has('disabled')) base -= 5;
		if (activeConditions.has('fatigued')) base -= 1;
		if (activeConditions.has('exhausted')) base -= 2;
		if (activeConditions.has('defenseless')) base = 0;
		return { value: Math.max(0, base), immune: false };
	}

	function getInitiativeLocal(): number {
		return abiModVal('agility') + improvedInitiativeRanks() * 4;
	}

	function getAttackBonus(closeOrRanged: 'close' | 'ranged'): number {
		const baseAbi = closeOrRanged === 'close' ? abiModVal('fighting') : abiModVal('dexterity');
		let skillRanks = 0;
		for (const s of (char?.skills ?? [])) {
			const name = (s.skillName ?? '').toLowerCase();
			if (closeOrRanged === 'close' && name.includes('close combat')) skillRanks += s.ranks ?? 0;
			if (closeOrRanged === 'ranged' && name.includes('ranged combat')) skillRanks += s.ranks ?? 0;
		}
		let advRanks = 0;
		for (const a of (char?.advantages ?? [])) {
			const name = (a.name ?? '').toLowerCase();
			if (closeOrRanged === 'ranged' && name.includes('ranged attack')) advRanks += a.ranks ?? 0;
			if (closeOrRanged === 'close' && name.includes('close attack')) advRanks += a.ranks ?? 0;
		}
		let total = baseAbi + skillRanks + advRanks;
		if (activeConditions.has('impaired')) total -= 2;
		if (activeConditions.has('disabled')) total -= 5;
		if (activeConditions.has('fatigued')) total -= 1;
		if (activeConditions.has('exhausted')) total -= 2;
		total += allOutAttack + accurateAttack;
		total -= powerAttack + defensiveAttack;
		return total;
	}

	function eachPowerEffect(draft: any, fn: (powerName: string, effect: any) => void) {
		for (const p of (draft?.powers ?? [])) {
			for (const e of (p.effects ?? [])) fn(p.name ?? '', e);
			for (const a of (p.alternateEffects ?? []))
				for (const e of (a.effects ?? [])) fn(a.name ?? '', e);
			if (p._deviceType)
				for (const ep of (p._embeddedPowers ?? [])) {
					for (const e of (ep.effects ?? [])) fn(ep.name ?? '', e);
					for (const a of (ep.alternateEffects ?? []))
						for (const e of (a.effects ?? [])) fn(a.name ?? '', e);
				}
		}
	}

	let attackActions = $derived.by(() => {
		if (!char) return [];
		const actions: any[] = [];
		eachPowerEffect(char, (powerName, e) => {
			if (!e._showInCombat) return;
			const modNames = (e.modifiers ?? []).map((m: any) => (m.name ?? '').toLowerCase());
			const isPerception = modNames.some((n: string) => n.includes('perception'));
			const isArea = modNames.some((n: string) => n.includes('area') || n.includes('burst') || n.includes('cone') || n.includes('cloud') || n.includes('line'));
			const autoHit = isPerception || isArea;
			const isRanged = !autoHit && modNames.some((n: string) => n.includes('ranged'));
			const closeOrRanged = isRanged ? 'ranged' : 'close';
			let baseRank = (e.rank ?? 0) + (e.manualRankBonus ?? 0);
			let effectRank = baseRank;
			let notes = '';
			if (e._isThrownWeapon) {
				const strVal = abiVal('strength');
				effectRank += strVal;
				notes = `Str-based (+${strVal} rank)`;
			}
			effectRank += powerAttack;
			effectRank -= accurateAttack;
			const ab = (autoHit ? 0 : getAttackBonus(closeOrRanged)) + (e.manualAtkBonus ?? 0);
			const name = (e.effectName ?? '').toLowerCase();
			const isDamaging = name.includes('damage') || modNames.some((n: string) => n.includes('damaging'));
			const resistDC = isDamaging ? (effectRank + 15) : (effectRank + 10);
			const resistance = resistanceLabel(effectResistance(e));
			const rangeLabel = autoHit ? (modNames.some((n: string) => n.includes('area') ?? false) ? 'Area' : 'Perception') : closeOrRanged === 'ranged' ? 'Ranged' : 'Close';
			actions.push({
				name: `${powerName} — ${e.effectName ?? ''} — ${rangeLabel}`,
				descriptors: [],
				effectType: e.effectName ?? '',
				effectRank,
				attackBonus: ab,
				autoHit,
				range: closeOrRanged,
				resistance,
				resistanceDC: resistDC,
				notes,
			});
		});
		return actions;
	});

	// Data Fetching and Normalization (Matches the main page backend-to-frontend translation completely)
	$effect(() => {
		const id = page.params.id;
		if (!id) {
			error = 'No character specified.';
			loading = false;
			return;
		}
		loading = true;
		error = null;

		api.character.getPublic(id)
			.then((data) => {
				const d = JSON.parse(JSON.stringify(data));
				ensureDefaults(d);

				for (const p of (d.powers ?? [])) {
					initNormalizePower(p);
				}

				const backendDevices = d.devices ?? [];
				for (const dv of backendDevices) {
					const devicePower = {
						powerId: dv.deviceId,
						name: dv.name,
						description: '',
						descriptors: [],
						array: false,
						maxPpPool: 0,
						effects: [],
						alternateEffects: [],
						totalPowerCost: dv.finalDeviceCost ?? 0,
						_deviceType: dv.deviceType,
						_embeddedPowers: (dv.embeddedPowers ?? []).map((ep: any) => {
							initNormalizePower(ep);
							return ep;
						}),
					};
					d.powers = d.powers ?? [];
					d.powers.push(devicePower);
				}
				delete d.devices;
				recomputeCharacterCosts(d);
				activeDefensePowerMods = new Set(['dodge','parry','fortitude','toughness','will']);
				char = d;
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : 'Character not found.';
			})
			.finally(() => {
				loading = false;
			});
	});

	function toggleDefensePowerMod(key: string) {
		if (activeDefensePowerMods.has(key)) activeDefensePowerMods.delete(key);
		else activeDefensePowerMods.add(key);
		activeDefensePowerMods = new Set(activeDefensePowerMods);
	}
	function toggleCondition(key: ConditionKey) {
		if (activeConditions.has(key)) activeConditions.delete(key);
		else activeConditions.add(key);
		activeConditions = new Set(activeConditions);
	}
</script>

{#if loading}
<div class="loading-wrap">
	<ComicPanel header="★ Loading" color="blue">
		<p>Loading character&hellip;</p>
	</ComicPanel>
</div>
{:else if error}
<div class="error-wrap">
	<ComicPanel header="⚠ Error" color="red">
		<p>{error}</p>
	</ComicPanel>
</div>
{:else if char}
<div class="comic-wrap">
	<SplashHeader title="Shared File · " highlight="Mutants &amp; Masterminds" subtitle="Superhero Roleplaying · Character Sheet" />

	<div class="speech-bubble">
		★ The tactical interface — built for heroes who need data <em>fast</em>. ★
	</div>

	<div class="panel-grid-3">
		<ComicPanel header="★ Identity" color="blue">
	<div class="identity-static-display" style="display: flex; flex-direction: column; gap: 8px;">
		<div class="field-row" style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-color, #000); padding-bottom: 4px;">
			<span class="field-label" style="font-weight: bold; text-transform: uppercase;">Name</span>
			<span class="field-val">{char.name}</span>
		</div>
		<div class="field-row" style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-color, #000); padding-bottom: 4px;">
			<span class="field-label" style="font-weight: bold; text-transform: uppercase;">Identity</span>
			<span class="field-val">{char.identity || '—'}</span>
		</div>
		<div class="field-row" style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-color, #000); padding-bottom: 4px;">
			<span class="field-label" style="font-weight: bold; text-transform: uppercase;">Gender</span>
			<span class="field-val">{char.gender || '—'}</span>
		</div>
		<div class="field-row" style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-color, #000); padding-bottom: 4px;">
			<span class="field-label" style="font-weight: bold; text-transform: uppercase;">Age</span>
			<span class="field-val">{char.age || '—'}</span>
		</div>
		<div class="field-row" style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-color, #000); padding-bottom: 4px;">
			<span class="field-label" style="font-weight: bold; text-transform: uppercase;">Power Level</span>
			<span class="field-val" style="font-weight: bold; color: var(--primary);">{char.powerLevel}</span>
		</div>
	</div>
</ComicPanel>

		<ComicPanel header="★ Power Points" color="dark">
			<div class="pp-display">
				<div class="pp-ring">
					<div class="pp-ring-inner">
						<div class="pp-num">{char.totalAllowed ?? 0}</div>
						<div class="pp-lbl">Total PP</div>
					</div>
				</div>
				<div class="pp-ring used">
					<div class="pp-ring-inner">
						<div class="pp-num" style="color:var(--danger);">{char.totalSpent ?? 0}</div>
						<div class="pp-lbl">Spent PP</div>
					</div>
				</div>
			</div>
			<hr class="divider" />
			<div class="pp-bar-wrap">
				<div class="pp-bar-bg">
					<div class="pp-bar-fill" style="width: {char.totalAllowed ? (char.totalSpent / char.totalAllowed) * 100 : 0}%;"></div>
				</div>
				<div class="pp-bar-text">{(char.totalAllowed ?? 0) - (char.totalSpent ?? 0)} PP Remaining</div>
			</div>
		</ComicPanel>

		<ComicPanel header="★ Conditions" color="red">
			<ConditionsPanel {activeConditions} {toggleCondition} onReset={() => { activeConditions = new Set(); allOutAttack = 0; powerAttack = 0; accurateAttack = 0; defensiveAttack = 0; }} />
		</ComicPanel>
	</div>

	<ComicPanel header="★ Abilities" color="blue">
		<div>
			<div style="margin-bottom: 8px;">
				<span class="action-word">WHAM!</span>
				<span class="stat-hint">Stat values lead every module</span>
			</div>
			<div class="stat-row-8">
				<StatBubble value={char.abilities?.strengthFinalValue ?? 0} label="STR" color="danger" absent={char.abilities?.strengthAbsent ?? false} />
				<StatBubble value={char.abilities?.staminaFinalValue ?? 0} label="STA" color="default" absent={char.abilities?.staminaAbsent ?? false} />
				<StatBubble value={char.abilities?.agilityFinalValue ?? 0} label="AGL" color="default" absent={char.abilities?.agilityAbsent ?? false} />
				<StatBubble value={char.abilities?.dexterityFinalValue ?? 0} label="DEX" color="default" absent={char.abilities?.dexterityAbsent ?? false} />
				<StatBubble value={char.abilities?.fightingFinalValue ?? 0} label="FGT" color="success" absent={char.abilities?.fightingAbsent ?? false} />
				<StatBubble value={char.abilities?.intellectFinalValue ?? 0} label="INT" color="secondary" absent={char.abilities?.intellectAbsent ?? false} />
				<StatBubble value={char.abilities?.awarenessFinalValue ?? 0} label="AWE" color="default" absent={char.abilities?.awarenessAbsent ?? false} />
				<StatBubble value={char.abilities?.presenceFinalValue ?? 0} label="PRE" color="default" absent={char.abilities?.presenceAbsent ?? false} />
			</div>
		</div>
	</ComicPanel>

	<div class="panel-grid">
		<ComicPanel header="★ Defenses" color="blue">
			<DefensesDisplay 
    draft={char} 
    getDefenseFinal={getDefenseFinalLocal} 
    getToughnessFinal={getToughnessFinalLocal} 
    defOtherMods={defOtherMods} 
    {activeDefensePowerMods} 
    {toggleDefensePowerMod} 
    plCaps={{
        dodgeToughOk: true, 
        parryToughOk: true, 
        fortWillOk: true, 
        dodgeTough: 0, 
        parryTough: 0, 
        fortWill: 0, 
        cap: (char.powerLevel ?? 10) * 2, 
        attackViolations: []
    }} 
/>
		</ComicPanel>

		<ComicPanel header="★ Combat" color="red">
			<div>
				<div style="margin-bottom: 6px; display:flex; align-items:center; gap:12px;">
					<span class="action-word pow" style="font-size: 22px;">POW!</span>
					<div class="field-group" style="flex-direction:row;align-items:center;gap:4px;">
						<div class="field-hdr" style="font-size:12px;">Initiative</div>
						<span class="init-value">{getInitiativeLocal() >= 0 ? '+' : ''}{getInitiativeLocal()}</span>
					</div>
				</div>
				<div class="maneuver-bar">
					<span class="maneuver-hdr">Maneuvers</span>
					<div class="maneuver-row">
						<label class="maneuver-btn" class:active={allOutAttack > 0}>All-out <input type="number" class="maneuver-input" min="0" max="5" bind:value={allOutAttack} /></label>
						<label class="maneuver-btn" class:active={powerAttack > 0}>Power <input type="number" class="maneuver-input" min="0" max="5" bind:value={powerAttack} /></label>
						<label class="maneuver-btn" class:active={accurateAttack > 0}>Accurate <input type="number" class="maneuver-input" min="0" max="5" bind:value={accurateAttack} /></label>
						<label class="maneuver-btn" class:active={defensiveAttack > 0}>Defensive <input type="number" class="maneuver-input" min="0" max="5" bind:value={defensiveAttack} /></label>
						<button class="maneuver-reset" onclick={() => { allOutAttack = 0; powerAttack = 0; accurateAttack = 0; defensiveAttack = 0; }}>Reset</button>
					</div>
				</div>

				<div class="attacks-list">
					<div class="atk-hdr-row">
						<span class="atk-hdr">Action</span><span class="atk-hdr">Bonus</span><span class="atk-hdr">Resist</span><span class="atk-hdr">DC</span>
					</div>
					{#each attackActions as atk}
						<AttackActionCard attack={atk} />
					{/each}
				</div>
			</div>
		</ComicPanel>
	</div>

	<!-- Responsive Grid Parity Matching via Content-Priority Weights -->
	<div class="all-view">
		{#each priorityOrder as key, i}
			<div class="section-wrap" class:full={i < 2} class:half={i >= 2}>
				{#if key === 'skills'}
					<ComicPanel header="★ Skills" color="yellow">
						<SkillTable skills={char.skills ?? []} />
					</ComicPanel>
				{:else if key === 'advantages'}
					<ComicPanel header="★ Advantages" color="dark">
						{#each char.advantages ?? [] as adv}
							<div class="advantage-row">
								<div class="advantage-bullet">&#9656;</div>
								<div class="advantage-name">{adv.name}{adv.ranks > 1 ? ' ' + adv.ranks : ''}</div>
								{#if adv.description}<div class="advantage-desc">{adv.description}</div>{/if}
							</div>
						{/each}
					</ComicPanel>
				{:else if key === 'equipment'}
					<ComicPanel header="★ Equipment" color="blue">
						<div class="ep-bar">
							<span class="ep-label">EP {char.equipmentPool?.epSpent ?? 0} / {char.equipmentPool?.totalEpAllowed ?? 0}</span>
						</div>
						{#each char.equipmentPool?.items ?? [] as item}
							<div class="equipment-row">
								<div class="equipment-bullet">&#8226;</div>
								<div class="equipment-name">{item.itemName}</div>
								<div class="equipment-cost">{item.epCost} EP</div>
							</div>
							{#if item.description}<div class="equipment-desc">{item.description}</div>{/if}
						{:else}
							<div class="empty-state">No equipment</div>
						{/each}
						<hr class="divider" />
						<div class="ep-bar" style="margin-top:6px;">
							<span class="ep-label">★ Headquarters</span>
						</div>
						{#each char.headquarters ?? [] as hq, idx}
							<div class="hq-row">
								<div class="hq-name">{hq.name}</div>
								<div class="hq-cost">{hq.totalEpCost} EP</div>
								{#if hq.sharedTeamBase}<span class="shared-badge">Team Base</span>{/if}
							</div>
							<div class="hq-detail">{hq.sizeCategory} &middot; Toughness {hq.toughnessValue}</div>
							{#if hq.description}<div class="hq-desc">{hq.description}</div>{/if}
							{#if hq.features?.length}
								<div class="hq-features">{#each hq.features as f}<span class="feature-badge">{f}</span>{/each}</div>
							{/if}
							{#if hq.defenseSystems?.length}
								<div class="def-systems">
									<span class="def-sys-header">Defense Systems:</span>
									{#each hq.defenseSystems as ds}
										<span class="def-sys-item">{ds.name} <span class="def-sys-cost">({ds.totalPowerCost} PP)</span></span>
									{/each}
								</div>
							{/if}
							{#if idx < char.headquarters.length - 1}<hr class="divider" />{/if}
						{:else}
							<div class="empty-state">No headquarters</div>
						{/each}
					</ComicPanel>
				{:else if key === 'powers'}
					<ComicPanel header="★ Powers" color="blue">
						{#each char.powers ?? [] as power}
							<PowerDisplayCard {power} />
						{/each}
					</ComicPanel>
				{/if}
			</div>
		{/each}
	</div>

	<div class="complications-spacer"></div>

	<ComicPanel header="★ Notes &amp; Complications" color="yellow">
		{#each char.complications ?? [] as comp}
			<div class="complication-row">
				<div class="comp-badge">{comp.type}</div>
				<div class="comp-text">{comp.description}</div>
			</div>
		{/each}
	</ComicPanel>

	<div class="signature-band" style="margin-top: 16px;">
		<div class="sig-dots"></div>
		<span>★ UNOFFICIAL MUTANTS &amp; MASTERMINDS · CHARACTER SHEET · POWER LEVEL {char.powerLevel} ★</span>
	</div>
</div>
{/if}

<style>
	.all-view :global(.panel-body) {
		max-height: 400px;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.all-view :global(.panel-body::-webkit-scrollbar) {
		display: none;
	}
</style>