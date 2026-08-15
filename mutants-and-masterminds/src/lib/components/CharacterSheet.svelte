<script lang="ts">
	import { abilityMod, effectResistance, resistanceLabel, recomputeCharacterCosts } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '@ui/Panel.svelte';
	import StatBubble from '@ui/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import SheetSection from '$lib/components/SheetSection.svelte';
	import IdentityPanel from '$lib/components/IdentityPanel.svelte';
	import ConditionsPanel from '$lib/components/ConditionsPanel.svelte';
	import DefensesDisplay from '$lib/components/DefensesDisplay.svelte';
	import DamageTrackEditor from '$lib/components/DamageTrackEditor.svelte';
	import PowerDisplayCard from '$lib/components/PowerDisplayCard.svelte';
	import SaveBar from '@ui/SaveBar.svelte';
	import AttackActionCard from '$lib/components/AttackActionCard.svelte';
	import AbilitiesEditor from '$lib/components/editors/AbilitiesEditor.svelte';
	import DefensesEditor from '$lib/components/editors/DefensesEditor.svelte';
	import SkillsEditor from '$lib/components/editors/SkillsEditor.svelte';
	import AdvantagesEditor from '$lib/components/editors/AdvantagesEditor.svelte';
	import PowersEditor from '$lib/components/editors/PowersEditor.svelte';
	import ComplicationsEditor from '$lib/components/editors/ComplicationsEditor.svelte';
	import EquipmentEditor from '$lib/components/editors/EquipmentEditor.svelte';
	import HeadquartersEditor from '$lib/components/editors/HeadquartersEditor.svelte';
	import PowerPointsEditor from '$lib/components/editors/PowerPointsEditor.svelte';

	// The whole sheet, for both the owner's editable view and the public share view.
	// `editable` is the only switch: when false no editor is instantiated, the edit
	// pencils disappear, and the save bar is omitted.
	let {
		draft,
		editable = false,
		headerTitle = 'Scribe ',
		saving = false,
		saveError = null,
		saveSuccess = false,
		shareCopied = false,
		autosaveDirty = false,
		onSave,
		onShare,
	}: {
		draft: any;
		editable?: boolean;
		headerTitle?: string;
		saving?: boolean;
		saveError?: string | null;
		saveSuccess?: boolean;
		shareCopied?: boolean;
		autosaveDirty?: boolean;
		onSave?: () => void;
		onShare?: () => void;
	} = $props();

	// Edit modals bind their inputs directly to `draft`, so changes apply as you type.
	// Snapshot on open / restore on cancel is what makes the Cancel button actually cancel.
	let editSnapshot: string | null = null;
	function beginEdit() {
		editSnapshot = JSON.stringify(draft);
	}
	function cancelEdit() {
		if (editSnapshot) Object.assign(draft, JSON.parse(editSnapshot));
		editSnapshot = null;
	}

	type SectionKey = 'skills' | 'advantages' | 'equipment' | 'powers';
	const SECTION_KEYS: SectionKey[] = ['skills', 'advantages', 'equipment', 'powers'];

	// Sections default to heaviest-first, but the save bar lets the owner reorder them.
	// Once they do, the override wins until the sheet loads a different character.
	const defaultOrder = $derived.by<SectionKey[]>(() => {
		if (!draft) return SECTION_KEYS;
		const weights: Record<SectionKey, number> = {
			skills: (draft.skills?.length ?? 0) + (draft.spentSkills ?? 0),
			advantages: (draft.advantages?.length ?? 0) + (draft.spentAdvantages ?? 0),
			equipment: (draft.equipmentPool?.items?.length ?? 0) + (draft.headquarters?.length ?? 0) + (draft.equipmentPool?.epSpent ?? 0),
			powers: (draft.powers?.length ?? 0) + (draft.spentPowers ?? 0),
		};
		return [...SECTION_KEYS].sort((a, b) => weights[b] - weights[a]);
	});
	let orderOverride = $state<SectionKey[] | null>(null);
	const priorityOrder = $derived(orderOverride ?? defaultOrder);

	// ── Conditions & Maneuvers State (session-only, in both views) ──
	type ConditionKey = 'vulnerable' | 'defenseless' | 'impaired' | 'disabled' | 'hindered' | 'dazed' | 'stunned' | 'fatigued' | 'exhausted' | 'incapacitated';
	let activeConditions = $state<Set<ConditionKey>>(new Set());
	let activeDefensePowerMods = $state<Set<string>>(new Set(['dodge', 'parry', 'fortitude', 'toughness', 'will']));

	const MANEUVER_LIMIT = 5;
	let allOutAttack = $state(0);
	let powerAttack = $state(0);
	let accurateAttack = $state(0);
	let defensiveAttack = $state(0);

	// ── Combat State (session-only) ──
	let accumulatedToughnessPenalty = $state(0);
	let staggered = $state(false);
	let dying = $state(0);
	let incapacitated = $state(false);

	// Reset per-character session state when the sheet is pointed at a different character.
	let loadedId: any = null;
	$effect(() => {
		if (!draft || draft.id === loadedId) return;
		loadedId = draft.id;
		activeConditions = new Set();
		activeDefensePowerMods = new Set(['dodge', 'parry', 'fortitude', 'toughness', 'will']);
		orderOverride = null;
		resetManeuvers();
		resetCombatState();
	});

	$effect(() => {
		if (!draft) return;
		recomputeCharacterCosts(draft);
	});

	let prevPowerLevel: number | null = null;
	$effect(() => {
		if (!draft || !editable) return;
		if (prevPowerLevel !== null && draft.powerLevel !== prevPowerLevel) {
			draft.totalAllowed = draft.powerLevel * 15;
		}
		prevPowerLevel = draft.powerLevel;
	});

	function movePriority(from: number, to: number) {
		if (to < 0 || to >= priorityOrder.length) return;
		const arr = [...priorityOrder];
		const [removed] = arr.splice(from, 1);
		arr.splice(to, 0, removed);
		orderOverride = arr;
	}

	function toggleDefensePowerMod(key: string) {
		if (activeDefensePowerMods.has(key)) activeDefensePowerMods.delete(key);
		else activeDefensePowerMods.add(key);
		activeDefensePowerMods = new Set(activeDefensePowerMods);
	}

	function toggleCondition(key: ConditionKey) {
		if (activeConditions.has(key)) activeConditions.delete(key);
		else activeConditions.add(key);
		activeConditions = new Set(activeConditions); // trigger reactivity
	}

	const toughnessRank = $derived(getToughnessFinal().value);

	function applyDamage(severity: number) {
		const newPenalty = accumulatedToughnessPenalty + severity;
		accumulatedToughnessPenalty = newPenalty;
		if (!staggered && newPenalty >= toughnessRank) {
			staggered = true;
		} else if (staggered) {
			incapacitated = true;
		}
	}

	function healDamage(amount: number) {
		accumulatedToughnessPenalty = Math.max(0, accumulatedToughnessPenalty - amount);
		if (accumulatedToughnessPenalty < toughnessRank) {
			staggered = false;
		}
		if (accumulatedToughnessPenalty === 0) {
			staggered = false;
			incapacitated = false;
			dying = 0;
		}
	}

	function resetCombatState() {
		accumulatedToughnessPenalty = 0;
		staggered = false;
		dying = 0;
		incapacitated = false;
	}

	function incrementDying() {
		if (dying < 3) dying++;
	}

	function resetManeuvers() {
		allOutAttack = 0;
		powerAttack = 0;
		accurateAttack = 0;
		defensiveAttack = 0;
	}

	// ── Computed Combat Stats ──
	function abiVal(key: string): number { return (draft?.abilities as any)?.[key + 'FinalValue'] ?? 0; }
	function abiMod(key: string): number { return abilityMod(abiVal(key)); }
	function abiAbsent(key: string): boolean { return (draft?.abilities as any)?.[key + 'Absent'] ?? false; }

	function defPointsBought(key: string): number { return (draft?.defenses as any)?.[key + 'PointsBought'] ?? 0; }
	function defOtherMods(key: string): number { return (draft?.defenses as any)?.[key + 'OtherModifiers'] ?? 0; }

	function defensiveRollRanks(): number {
		let ranks = 0;
		for (const a of (draft?.advantages ?? [])) {
			if (a.name?.toLowerCase().includes('defensive roll')) ranks += a.ranks ?? 0;
		}
		return ranks;
	}

	function improvedInitiativeRanks(): number {
		for (const a of (draft?.advantages ?? [])) {
			if (a.name?.toLowerCase() === 'improved initiative') return a.ranks ?? 0;
		}
		return 0;
	}

	function getDefenseFinal(key: string, abilityKey: string): { value: number; immune: boolean } {
		const absent = abiAbsent(abilityKey);
		if (absent) return { value: 0, immune: true };
		const abilModVal = abiMod(abilityKey);
		let base = abilModVal + defPointsBought(key) + (activeDefensePowerMods.has(key) ? defOtherMods(key) : 0);

		if (activeConditions.has('impaired')) base -= 2;
		if (activeConditions.has('disabled')) base -= 5;
		if (activeConditions.has('fatigued')) base -= 1;
		if (activeConditions.has('exhausted')) base -= 2;

		// Maneuver shifts only affect active defenses (Dodge/Parry)
		const isActive = key === 'dodge' || key === 'parry';
		if (isActive) {
			if (activeConditions.has('defenseless')) base = 0;
			else if (activeConditions.has('vulnerable')) base = Math.ceil(base / 2);
			base -= allOutAttack + defensiveAttack;
		}
		return { value: Math.max(0, base), immune: false };
	}

	function getToughnessFinal(): { value: number; immune: boolean } {
		let base = abiMod('stamina') + defPointsBought('toughness') + defensiveRollRanks() + (activeDefensePowerMods.has('toughness') ? defOtherMods('toughness') : 0);
		if (activeConditions.has('impaired')) base -= 2;
		if (activeConditions.has('disabled')) base -= 5;
		if (activeConditions.has('fatigued')) base -= 1;
		if (activeConditions.has('exhausted')) base -= 2;
		if (activeConditions.has('defenseless')) base = 0;
		// Apply accumulated damage penalty (session-only)
		return { value: Math.max(0, base - accumulatedToughnessPenalty), immune: false };
	}

	const damagePenaltyDisplay = $derived(accumulatedToughnessPenalty > 0 ? `-${accumulatedToughnessPenalty}` : '0');

	const pl = $derived(draft?.powerLevel ?? 10);

	function eachPowerEffect(c: any, fn: (powerName: string, effect: any) => void) {
		for (const p of (c?.powers ?? [])) {
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

	const plCaps = $derived.by(() => {
		const cap = pl * 2;
		const dodgeTough = getDefenseFinal('dodge', 'agility').value + getToughnessFinal().value;
		const parryTough = getDefenseFinal('parry', 'fighting').value + getToughnessFinal().value;
		const fortWill = getDefenseFinal('fortitude', 'stamina').value + getDefenseFinal('will', 'awareness').value;
		// Attack PL caps: check each combat-relevant effect
		const attackViolations: { name: string; bonus: number; rank: number; combined: number }[] = [];
		if (draft) {
			eachPowerEffect(draft, (powerName, e) => {
				if (!e._showInCombat) return;
				const name = (e.effectName ?? '').toLowerCase();
				if (name === 'summon' || name === 'movement' || name === 'senses' || name === 'immunity') return;
				const modNames = (e.modifiers ?? []).map((m: any) => (m.name ?? '').toLowerCase());
				const isPerception = modNames.some((n: string) => n.includes('perception'));
				const isArea = modNames.some((n: string) => n.includes('area') || n.includes('burst') || n.includes('cone') || n.includes('cloud') || n.includes('line'));
				const autoHit = isPerception || isArea;
				let baseRank = (e.rank ?? 0) + (e.manualRankBonus ?? 0);
				let effectRank = baseRank;
				let rankNote = '';
				if (e._isThrownWeapon) {
					const strVal = abiVal('strength');
					effectRank += strVal;
					rankNote = ` (${baseRank} + ${strVal} Str)`;
				}
				const isRanged = !autoHit && modNames.some((n: string) => n.includes('ranged'));
				const closeOrRanged = isRanged ? 'ranged' : 'close';
				const ab = (autoHit ? 0 : getAttackBonus(closeOrRanged)) + (e.manualAtkBonus ?? 0);
				const combined = ab + effectRank;
				const rankLabel = rankNote ? `${effectRank}${rankNote}` : String(effectRank);
				if (autoHit) {
					if (effectRank > pl) attackViolations.push({ name: `${powerName} — ${e.effectName} (rank ${rankLabel})`, bonus: 0, rank: effectRank, combined: effectRank });
				} else {
					if (combined > cap) attackViolations.push({ name: `${powerName} — ${e.effectName} (rank ${rankLabel})`, bonus: ab, rank: effectRank, combined });
				}
			});
		}
		return {
			dodgeToughOk: dodgeTough <= cap,
			parryToughOk: parryTough <= cap,
			fortWillOk: fortWill <= cap,
			dodgeTough,
			parryTough,
			fortWill,
			cap,
			attackViolations,
		};
	});

	function getInitiative(): number {
		return abiMod('agility') + improvedInitiativeRanks() * 4;
	}

	// ── Attack Actions from Powers ──
	type AttackAction = {
		name: string;
		descriptors: string[];
		effectType: string;
		effectRank: number;
		attackBonus: number;
		autoHit: boolean;
		range: 'close' | 'ranged';
		resistance: string;
		resistanceDC: number;
		notes: string;
	};

	function getAttackBonus(closeOrRanged: 'close' | 'ranged'): number {
		const baseAbi = closeOrRanged === 'close' ? abiMod('fighting') : abiMod('dexterity');
		let skillRanks = 0;
		for (const s of (draft?.skills ?? [])) {
			const name = (s.skillName ?? '').toLowerCase();
			if (closeOrRanged === 'close' && name.includes('close combat')) skillRanks += s.ranks ?? 0;
			if (closeOrRanged === 'ranged' && name.includes('ranged combat')) skillRanks += s.ranks ?? 0;
		}
		let advRanks = 0;
		for (const a of (draft?.advantages ?? [])) {
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

	let attackActions = $derived.by<AttackAction[]>(() => {
		const actions: AttackAction[] = [];
		if (!draft) return actions;
		eachPowerEffect(draft, (powerName, e) => {
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
			const rangeLabel = autoHit ? (isArea ? 'Area' : 'Perception') : closeOrRanged === 'ranged' ? 'Ranged' : 'Close';
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

	type SelectableEffect = {
		powerName: string;
		effectName: string;
		effect: any;
	};

	let selectableEffects = $derived.by<SelectableEffect[]>(() => {
		const list: SelectableEffect[] = [];
		if (!draft) return list;
		eachPowerEffect(draft, (powerName, e) => {
			const name = (e.effectName ?? '').toLowerCase();
			if (name === 'summon' || name === 'movement' || name === 'senses' || name === 'immunity') return;
			list.push({ powerName, effectName: e.effectName ?? '', effect: e });
		});
		return list;
	});
</script>

<div class="comic-wrap">
	<SplashHeader title={headerTitle} highlight="Sheets" subtitle="Superhero Roleplaying · Character Sheet" />

	<div class="speech-bubble">
		★ The tactical interface — built for heroes who need data <em>fast</em>. ★
	</div>

	<div class="panel-grid stretch-row">
		<ComicPanel header="★ Identity" color="blue">
			<IdentityPanel {draft} {editable} />
		</ComicPanel>

		<div class="stack-col">
			<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Power Points" color="dark">
				{#snippet view()}
					<div class="pp-display">
						<div class="pp-ring">
							<div class="pp-ring-inner">
								<div class="pp-num">{draft.totalAllowed ?? 0}</div>
								<div class="pp-lbl">Total PP</div>
							</div>
						</div>
						<div class="pp-ring used">
							<div class="pp-ring-inner">
								<div class="pp-num" style="color:var(--danger);">{draft.totalSpent ?? 0}</div>
								<div class="pp-lbl">Spent PP</div>
							</div>
						</div>
					</div>
					<hr class="divider" />
					<div class="pp-bar-wrap">
						<div class="pp-bar-bg">
							<div class="pp-bar-fill" style="width: {draft.totalAllowed ? (draft.totalSpent / draft.totalAllowed) * 100 : 0}%;"></div>
						</div>
						<div class="pp-bar-text">{(draft.totalAllowed ?? 0) - (draft.totalSpent ?? 0)} PP Remaining</div>
					</div>
				{/snippet}
				{#snippet edit()}
					<PowerPointsEditor {draft} />
				{/snippet}
			</SheetSection>

			<div class="conditions-grow">
				<ComicPanel header="★ Conditions" color="red">
					<ConditionsPanel {activeConditions} {toggleCondition} onReset={() => { activeConditions = new Set(); resetManeuvers(); resetCombatState(); }} />
				</ComicPanel>
			</div>
		</div>
	</div>

	<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Abilities" color="blue">
		{#snippet view()}
			<div>
				<div style="margin-bottom: 8px;">
					<span class="action-word">WHAM!</span>
					<span class="stat-hint">Stat values lead every module</span>
				</div>
				<div class="stat-row-8">
					<StatBubble value={draft.abilities?.strengthFinalValue ?? 0} label="STR" color="danger" absent={draft.abilities?.strengthAbsent ?? false} />
					<StatBubble value={draft.abilities?.staminaFinalValue ?? 0} label="STA" color="default" absent={draft.abilities?.staminaAbsent ?? false} />
					<StatBubble value={draft.abilities?.agilityFinalValue ?? 0} label="AGL" color="default" absent={draft.abilities?.agilityAbsent ?? false} />
					<StatBubble value={draft.abilities?.dexterityFinalValue ?? 0} label="DEX" color="default" absent={draft.abilities?.dexterityAbsent ?? false} />
					<StatBubble value={draft.abilities?.fightingFinalValue ?? 0} label="FGT" color="success" absent={draft.abilities?.fightingAbsent ?? false} />
					<StatBubble value={draft.abilities?.intellectFinalValue ?? 0} label="INT" color="secondary" absent={draft.abilities?.intellectAbsent ?? false} />
					<StatBubble value={draft.abilities?.awarenessFinalValue ?? 0} label="AWE" color="default" absent={draft.abilities?.awarenessAbsent ?? false} />
					<StatBubble value={draft.abilities?.presenceFinalValue ?? 0} label="PRE" color="default" absent={draft.abilities?.presenceAbsent ?? false} />
				</div>
			</div>
		{/snippet}
		{#snippet edit()}
			<AbilitiesEditor abilities={draft.abilities} />
		{/snippet}
	</SheetSection>

	<div class="panel-grid">
		<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Defenses" color="blue">
			{#snippet view()}
				<DefensesDisplay {draft} {getDefenseFinal} {getToughnessFinal} {defOtherMods} {activeDefensePowerMods} {toggleDefensePowerMod} {plCaps} />
			{/snippet}
			{#snippet edit()}
				<DefensesEditor defenses={draft.defenses} />
			{/snippet}
		</SheetSection>

		<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Combat" color="red">
			{#snippet view()}
				<div>
					<div style="margin-bottom: 6px; display:flex; align-items:center; gap:12px;">
						<span class="action-word pow" style="font-size: 22px;">POW!</span>
						<div class="field-group" style="flex-direction:row;align-items:center;gap:4px;">
							<div class="field-hdr" style="font-size:12px;">Initiative</div>
							<span class="init-value">{getInitiative() >= 0 ? '+' : ''}{getInitiative()}</span>
						</div>
					</div>
					<div class="maneuver-bar">
						<span class="maneuver-hdr">Maneuvers</span>
						<div class="maneuver-row">
							<label class="maneuver-btn" class:active={allOutAttack > 0}>
								All-out
								<input type="number" class="maneuver-input" min="0" max={MANEUVER_LIMIT} bind:value={allOutAttack} />
							</label>
							<label class="maneuver-btn" class:active={powerAttack > 0}>
								Power
								<input type="number" class="maneuver-input" min="0" max={MANEUVER_LIMIT} bind:value={powerAttack} />
							</label>
							<label class="maneuver-btn" class:active={accurateAttack > 0}>
								Accurate
								<input type="number" class="maneuver-input" min="0" max={MANEUVER_LIMIT} bind:value={accurateAttack} />
							</label>
							<label class="maneuver-btn" class:active={defensiveAttack > 0}>
								Defensive
								<input type="number" class="maneuver-input" min="0" max={MANEUVER_LIMIT} bind:value={defensiveAttack} />
							</label>
							<button class="maneuver-reset" onclick={resetManeuvers}>Reset</button>
						</div>
						<div class="maneuver-shift">
							{allOutAttack + accurateAttack > 0 ? `Attack: +${allOutAttack + accurateAttack}` : ''}
							{powerAttack + defensiveAttack > 0 ? ` / ` : ''}
							{allOutAttack + defensiveAttack > 0 ? `Defense: -${allOutAttack + defensiveAttack}` : ''}
							{powerAttack > 0 ? `DC: +${powerAttack}` : ''}
							{accurateAttack > 0 ? `DC: -${accurateAttack}` : ''}
						</div>
					</div>

					<div class="attacks-list">
						<div class="atk-hdr-row">
							<span class="atk-hdr">Action</span>
							<span class="atk-hdr">Bonus</span>
							<span class="atk-hdr">Resist</span>
							<span class="atk-hdr">DC</span>
						</div>
						{#each attackActions as atk}
							<AttackActionCard attack={atk} />
						{/each}
					</div>
				</div>
			{/snippet}
			{#snippet edit()}
				<div>
					<DamageTrackEditor {damagePenaltyDisplay} bind:staggered bind:incapacitated bind:dying {applyDamage} {healDamage} {incrementDying} {resetCombatState} />
					{#if selectableEffects.length > 0}
						<div class="edit-select-attacks">
							<span class="maneuver-hdr">Select Combat Attacks</span>
							<div class="atk-select-list">
								{#each selectableEffects as se}
									<div class="atk-select-row">
										<label class="atk-select-item" class:active={se.effect._showInCombat}>
											<input type="checkbox" checked={se.effect._showInCombat} onchange={() => se.effect._showInCombat = !se.effect._showInCombat} />
											<span class="atk-select-name">{se.powerName} — {se.effectName}</span>
										</label>
										<div class="atk-bonus-row">
											<span class="atk-bonus-label">Atk+</span>
											<input type="number" class="atk-bonus-input" bind:value={se.effect.manualAtkBonus} placeholder="0" />
											<span class="atk-bonus-label">Rank+</span>
											<input type="number" class="atk-bonus-input" bind:value={se.effect.manualRankBonus} placeholder="0" />
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					<div class="combat-edit-note">Combat state is session-only and resets on page reload.</div>
				</div>
			{/snippet}
		</SheetSection>
	</div>

	<div class="all-view">
		{#each priorityOrder as key, i}
			<div class="section-wrap" class:full={i < 2} class:half={i >= 2}>
				{#if key === 'skills'}
					<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Skills" color="yellow">
						{#snippet view()}
							<SkillTable skills={draft.skills ?? []} />
						{/snippet}
						{#snippet edit()}
							<SkillsEditor skills={draft.skills} />
						{/snippet}
					</SheetSection>
				{:else if key === 'advantages'}
					<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Advantages" color="dark">
						{#snippet view()}
							{#each draft.advantages ?? [] as adv}
								<div class="advantage-row">
									<div class="advantage-bullet">&#9656;</div>
									<div class="advantage-name">{adv.name}{adv.ranks > 1 ? ' ' + adv.ranks : ''}</div>
									{#if adv.description}<div class="advantage-desc">{adv.description}</div>{/if}
								</div>
							{/each}
						{/snippet}
						{#snippet edit()}
							<AdvantagesEditor advantages={draft.advantages} />
						{/snippet}
					</SheetSection>
				{:else if key === 'equipment'}
					<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Equipment" color="blue">
						{#snippet view()}
							<div class="ep-bar">
								<span class="ep-label">EP {draft.equipmentPool?.epSpent ?? 0} / {draft.equipmentPool?.totalEpAllowed ?? 0}</span>
							</div>
							{#each draft.equipmentPool?.items ?? [] as item}
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
							{#each draft.headquarters ?? [] as hq, idx}
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
								{#if idx < draft.headquarters.length - 1}<hr class="divider" />{/if}
							{:else}
								<div class="empty-state">No headquarters</div>
							{/each}
						{/snippet}
						{#snippet edit()}
							<EquipmentEditor equipmentPool={draft.equipmentPool} />
							<hr class="divider" />
							<HeadquartersEditor headquarters={draft.headquarters} />
						{/snippet}
					</SheetSection>
				{:else if key === 'powers'}
					<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Powers" color="blue">
						{#snippet view()}
							{#each draft.powers ?? [] as power}
								<PowerDisplayCard {power} />
							{/each}
						{/snippet}
						{#snippet edit()}
							<PowersEditor powers={draft.powers} />
						{/snippet}
					</SheetSection>
				{/if}
			</div>
		{/each}
	</div>

	<div class="complications-spacer"></div>

	<SheetSection {editable} onOpen={beginEdit} onCancel={cancelEdit} title="Notes &amp; Complications" color="yellow">
		{#snippet view()}
			{#each draft.complications ?? [] as comp}
				<div class="complication-row">
					<div class="comp-badge">{comp.type}</div>
					<div class="comp-text">{comp.description}</div>
				</div>
			{/each}
		{/snippet}
		{#snippet edit()}
			<ComplicationsEditor complications={draft.complications} />
		{/snippet}
	</SheetSection>

	{#if editable && onSave && onShare}
		<SaveBar
			{saving}
			{saveError}
			{saveSuccess}
			{shareCopied}
			{autosaveDirty}
			{onSave}
			{onShare}
			shareCopiedLabel="Copied!"
		>
			{#snippet extra()}
				<div class="priority-controls">
					<span class="priority-label">Section order:</span>
					{#each priorityOrder as key, i}
						<div class="priority-item">
							<span class="priority-name">{key}</span>
							<button class="move-btn" onclick={() => movePriority(i, i - 1)} disabled={i === 0}
								>&#9650;</button
							>
							<button
								class="move-btn"
								onclick={() => movePriority(i, i + 1)}
								disabled={i === priorityOrder.length - 1}>&#9660;</button
							>
						</div>
					{/each}
				</div>
			{/snippet}
		</SaveBar>
	{/if}

	<div class="signature-band" style="margin-top: 16px;">
		<div class="sig-dots"></div>
		<span style="position: relative; z-index: 1;">★ SCRIBE SHEETS · CHARACTER SHEET · POWER LEVEL {draft.powerLevel} ★</span>
	</div>
</div>

<style>
	.comic-wrap > :global(.edit-wrap) {
		margin-bottom: 14px;
	}
	.stack-col {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.stretch-row {
		align-items: stretch;
	}
	.conditions-grow {
		flex: 1;
		display: flex;
	}
	.conditions-grow :global(.panel-full) {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.conditions-grow :global(.panel-body) {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.conditions-grow :global(.action-word) {
		font-size: 26px;
	}
	.conditions-grow :global(.cond-check-row) {
		padding: 9px 0;
	}
	.conditions-grow :global(.cond-pip) {
		width: 16px;
		height: 16px;
	}
	.conditions-grow :global(.cond-label) {
		font-size: 16px;
		min-width: 100px;
	}
	.conditions-grow :global(.cond-desc) {
		font-size: 14px;
	}
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
