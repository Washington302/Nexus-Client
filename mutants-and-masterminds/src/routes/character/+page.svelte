<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { MnmCharacter } from '$lib/services/api';
	import { abilityMod, abilityModStr, effectCost, perRankCost, powerTotalCost, ensureDefaults, initNormalizePower, normalizePowerForSave } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import StatBubble from '$lib/components/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import AbilitiesEditor from '$lib/components/editors/AbilitiesEditor.svelte';
	import DefensesEditor from '$lib/components/editors/DefensesEditor.svelte';
	import SkillsEditor from '$lib/components/editors/SkillsEditor.svelte';
	import AdvantagesEditor from '$lib/components/editors/AdvantagesEditor.svelte';
	import PowersEditor from '$lib/components/editors/PowersEditor.svelte';
	import ComplicationsEditor from '$lib/components/editors/ComplicationsEditor.svelte';
	import EquipmentEditor from '$lib/components/editors/EquipmentEditor.svelte';
	import HeadquartersEditor from '$lib/components/editors/HeadquartersEditor.svelte';
	import PowerPointsEditor from '$lib/components/editors/PowerPointsEditor.svelte';

	let draft = $state<MnmCharacter>(null!);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let autosaveDirty = $state(false);
	let originalSnapshot = $state<string | null>(null);
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let shareCopied = $state(false);

	type SectionKey = 'skills' | 'advantages' | 'equipment' | 'powers';
	let priorityOrder = $state<SectionKey[]>([]);

	$effect(() => {
		if (draft && priorityOrder.length === 0) {
			const weights: Record<SectionKey, number> = {
				skills: (draft.skills?.length ?? 0) + (draft.spentSkills ?? 0),
				advantages: (draft.advantages?.length ?? 0) + (draft.spentAdvantages ?? 0),
				equipment: (draft.equipmentPool?.items?.length ?? 0) + (draft.equipmentPool?.epSpent ?? 0) + (draft.headquarters?.length ?? 0) * 5,
				powers: (draft.powers?.length ?? 0) + (draft.spentPowers ?? 0),
			};
			priorityOrder = (['skills', 'advantages', 'equipment', 'powers'] as SectionKey[]).sort((a, b) => weights[b] - weights[a]);
		}
	});

	function movePriority(from: number, to: number) {
		if (to < 0 || to >= priorityOrder.length) return;
		const arr = [...priorityOrder];
		const [removed] = arr.splice(from, 1);
		arr.splice(to, 0, removed);
		priorityOrder = arr;
	}

	function scheduleAutosave() {
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveDirty = true;
		autosaveTimer = setTimeout(() => {
			if (draft && !saving) {
				saveCharacter();
			}
		}, 15000);
	}

	function cancelAutosave() {
		if (autosaveTimer) { clearTimeout(autosaveTimer); autosaveTimer = null; }
		autosaveDirty = false;
	}

	$effect(() => {
		const c = session.activeCharacter;
		if (c) {
			const d = JSON.parse(JSON.stringify(c));
			ensureDefaults(d);

			for (const p of (d.powers ?? [])) {
				initNormalizePower(p);
			}

			// Auto-compute power costs
			if (d.powers) {
			for (const p of d.powers) {
				p.totalPowerCost = powerTotalCost(p.effects, p.alternateEffects);
				for (const e of p.effects ?? []) {
					if (e.effectName?.toLowerCase() === 'summon') e.isSummon = true;
					e.calculatedCost = effectCost(e);
					if (e.isSummon && !e.summonExtension) {
						e.summonExtension = { summonRank: e.rank, minionPpBudget: e.rank * 15 };
					}
				}
				for (const a of p.alternateEffects ?? []) {
					a.costPerRank = (a.effects ?? []).reduce((sum: number, e: any) => sum + perRankCost(e), 0);
					a.currentAllocatedRank = a.effects[0]?.rank ?? 0;
					for (const e of a.effects ?? []) {
						if (e.effectName?.toLowerCase() === 'summon') e.isSummon = true;
						e.calculatedCost = effectCost(e);
						if (e.isSummon && !e.summonExtension) {
							e.summonExtension = { summonRank: e.rank, minionPpBudget: e.rank * 15 };
						}
					}
				}
			}
			}
			// Auto-compute ability PP cost
			const abiKeys = ['strength','stamina','agility','dexterity','fighting','intellect','awareness','presence'] as const;
			let totalAbiPP = 0;
			for (const k of abiKeys) {
				const base = d.abilities[k + 'BaseRank'] ?? 0;
				const mod = d.abilities[k + 'CostModifier'] ?? 0;
				const enh = d.abilities[k + 'EnhancedRank'] ?? 0;
				d.abilities[k + 'FinalValue'] = base + enh;
				totalAbiPP += Math.max(0, base) * (2 + mod);
			}
			d.spentAbilities = totalAbiPP;
			// Auto-compute skill bonuses and costs
			const ABIL_MAP: Record<string, string> = { STRENGTH:'strength', STAMINA:'stamina', AGILITY:'agility', DEXTERITY:'dexterity', FIGHTING:'fighting', INTELLECT:'intellect', AWARENESS:'awareness', PRESENCE:'presence' };
			let totalSkillPP = 0;
			for (const s of (d.skills ?? [])) {
				const abiKey = ABIL_MAP[s.keyAbility] ?? 'agility';
				const abiVal = (d.abilities as any)?.[abiKey + 'FinalValue'] ?? 0;
				s.finalBonus = (s.ranks ?? 0) + abilityMod(abiVal) + (s.modifier ?? 0);
				s.ppCost = Math.ceil((s.ranks ?? 0) / 2);
				totalSkillPP += s.ppCost;
			}
			d.spentSkills = totalSkillPP;
			// Auto-compute equipment costs
			const hqs = d.headquarters ?? [];
			for (const hq of hqs) {
				const dsCost = (hq.defenseSystems ?? []).reduce((s: number, ds: any) => s + (ds.totalPowerCost ?? 0), 0);
				hq.totalEpCost = Math.round((hq.sizeCost ?? 0) + (hq.toughnessCost ?? 0) + dsCost);
			}
			const itemsCost = (d.equipmentPool?.items ?? []).reduce((s: number, i: any) => s + (i.epCost ?? 0), 0);
			const hqCost = hqs.reduce((s: number, hq: any) => s + (hq.totalEpCost ?? 0), 0);
			if (d.equipmentPool) d.equipmentPool.epSpent = Math.round(itemsCost + hqCost);
			d.totalSpent = (d.spentAbilities ?? 0) + (d.spentDefenses ?? 0) + (d.spentSkills ?? 0) + (d.spentAdvantages ?? 0) + (d.spentPowers ?? 0);

			activeDefensePowerMods = new Set(['dodge','parry','fortitude','toughness','will']);
			draft = d;
			originalSnapshot = JSON.stringify(d);
			autosaveDirty = false;
		}
	});

	$effect(() => {
		if (!draft || originalSnapshot === null) return;
		const current = JSON.stringify(draft);
		if (current !== originalSnapshot) {
			scheduleAutosave();
		}
	});

	$effect(() => {
		if (!draft) return;
		// Auto-compute ability PP
		const abiKeys = ['strength','stamina','agility','dexterity','fighting','intellect','awareness','presence'] as const;
		let totalAbiPP = 0;
		for (const k of abiKeys) {
			const base = (draft.abilities as any)[k + 'BaseRank'] ?? 0;
			const mod = (draft.abilities as any)[k + 'CostModifier'] ?? 0;
			const enh = (draft.abilities as any)[k + 'EnhancedRank'] ?? 0;
			(draft.abilities as any)[k + 'FinalValue'] = base + enh;
			totalAbiPP += Math.max(0, base) * (2 + mod);
		}
		draft.spentAbilities = totalAbiPP;
		// Auto-compute skill bonuses and costs
		const ABIL_MAP: Record<string, string> = { STRENGTH:'strength', STAMINA:'stamina', AGILITY:'agility', DEXTERITY:'dexterity', FIGHTING:'fighting', INTELLECT:'intellect', AWARENESS:'awareness', PRESENCE:'presence' };
		let totalSkillPP = 0;
		for (const s of (draft.skills ?? [])) {
			const abiKey = ABIL_MAP[s.keyAbility] ?? 'agility';
			const abiVal = (draft.abilities as any)?.[abiKey + 'FinalValue'] ?? 0;
			s.finalBonus = (s.ranks ?? 0) + abilityMod(abiVal) + (s.modifier ?? 0);
			s.ppCost = Math.ceil((s.ranks ?? 0) / 2);
			totalSkillPP += s.ppCost;
		}
		draft.spentSkills = totalSkillPP;
		// Auto-compute equipment costs
		const hqs = draft.headquarters ?? [];
		for (const hq of hqs) {
			const dsCost = (hq.defenseSystems ?? []).reduce((s: number, d: any) => s + (d.totalPowerCost ?? 0), 0);
			hq.totalEpCost = Math.round((hq.sizeCost ?? 0) + (hq.toughnessCost ?? 0) + dsCost);
		}
		const itemsCost = (draft.equipmentPool?.items ?? []).reduce((s: number, i: any) => s + (i.epCost ?? 0), 0);
		const hqCost = hqs.reduce((s: number, hq: any) => s + (hq.totalEpCost ?? 0), 0);
		if (draft.equipmentPool) draft.equipmentPool.epSpent = Math.round(itemsCost + hqCost);
		draft.totalSpent = (draft.spentAbilities ?? 0) + (draft.spentDefenses ?? 0) + (draft.spentSkills ?? 0) + (draft.spentAdvantages ?? 0) + (draft.spentPowers ?? 0);
	});


	// ── Conditions & Maneuvers State ──
	type ConditionKey = 'vulnerable' | 'defenseless' | 'impaired' | 'disabled' | 'hindered' | 'dazed' | 'stunned' | 'fatigued' | 'exhausted' | 'incapacitated';
	let activeConditions = $state<Set<ConditionKey>>(new Set());

	let activeDefensePowerMods = $state<Set<string>>(new Set());

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

	const MANEUVER_LIMIT = 5;
	let allOutAttack = $state(0);
	let powerAttack = $state(0);
	let accurateAttack = $state(0);
	let defensiveAttack = $state(0);
	let showAttackSelector = $state(false);

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

	function protectionRanks(): number { return 0; }

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
		const absent = abiAbsent('stamina');
		if (absent) return { value: 0, immune: true };
		let base = abiMod('stamina') + defPointsBought('toughness') + defensiveRollRanks() + (activeDefensePowerMods.has('toughness') ? defOtherMods('toughness') : 0);
		if (activeConditions.has('impaired')) base -= 2;
		if (activeConditions.has('disabled')) base -= 5;
		if (activeConditions.has('fatigued')) base -= 1;
		if (activeConditions.has('exhausted')) base -= 2;
		if (activeConditions.has('defenseless')) base = 0;
		return { value: Math.max(0, base), immune: false };
	}

	const pl = $derived(draft?.powerLevel ?? 10);
	const plCaps = $derived.by(() => {
		const cap = pl * 2;
		const dodgeTough = getDefenseFinal('dodge', 'agility').value + getToughnessFinal().value;
		const parryTough = getDefenseFinal('parry', 'fighting').value + getToughnessFinal().value;
		const fortWill = getDefenseFinal('fortitude', 'stamina').value + getDefenseFinal('will', 'awareness').value;
		return {
			dodgeToughOk: dodgeTough <= cap,
			parryToughOk: parryTough <= cap,
			fortWillOk: fortWill <= cap,
			dodgeTough,
			parryTough,
			fortWill,
			cap,
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
		total += allOutAttack + accurateAttack;
		total -= powerAttack + defensiveAttack;
		return total;
	}

	function getAttackActions(): AttackAction[] {
		if (!draft) return [];
		const actions: AttackAction[] = [];
		for (const p of (draft.powers ?? [])) {
			for (const e of (p.effects ?? [])) {
				if (!e._showInCombat) continue;
				const modNames = (e.modifiers ?? []).map((m: any) => (m.name ?? '').toLowerCase());
				const isPerception = modNames.some((n: string) => n.includes('perception'));
				const isArea = modNames.some((n: string) => n.includes('area') || n.includes('burst') || n.includes('cone') || n.includes('cloud') || n.includes('line'));
				const autoHit = isPerception || isArea;
				const isRanged = !autoHit && modNames.some((n: string) => n.includes('ranged'));
				const closeOrRanged = isRanged ? 'ranged' : 'close';
				let effectRank = e.rank ?? 0;
				if (e._isThrownWeapon) effectRank += abiVal('strength');
				effectRank += powerAttack;
				effectRank -= accurateAttack;
				const ab = autoHit ? 0 : getAttackBonus(closeOrRanged);
				const name = (e.effectName ?? '').toLowerCase();
				const isDamaging = name.includes('damage') || modNames.some((n: string) => n.includes('damaging'));
				const resistDC = isDamaging ? (effectRank + 15) : (effectRank + 10);
				const resistance = name.includes('affliction') ? 'Will / Fortitude' :
					isDamaging ? 'Toughness' : name.includes('move') ? 'Strength / Dodge' : 'Dodge';
				actions.push({
					name: (p.name ?? '') + ' — ' + (e.effectName ?? ''),
					descriptors: p.descriptors ?? [],
					effectType: e.effectName ?? '',
					effectRank,
					attackBonus: ab,
					autoHit,
					range: closeOrRanged,
					resistance,
					resistanceDC: resistDC,
					notes: '',
				});
			}
			for (const a of (p.alternateEffects ?? [])) {
				for (const e of (a.effects ?? [])) {
					if (!e._showInCombat) continue;
					const modNames = (e.modifiers ?? []).map((m: any) => (m.name ?? '').toLowerCase());
					const isPerception = modNames.some((n: string) => n.includes('perception'));
					const isArea = modNames.some((n: string) => n.includes('area') || n.includes('burst') || n.includes('cone') || n.includes('cloud') || n.includes('line'));
					const autoHit = isPerception || isArea;
					const isRanged = !autoHit && modNames.some((n: string) => n.includes('ranged'));
					const closeOrRanged = isRanged ? 'ranged' : 'close';
					let effectRank = e.rank ?? 0;
					if (e._isThrownWeapon) effectRank += abiVal('strength');
					effectRank += powerAttack;
					effectRank -= accurateAttack;
					const ab = autoHit ? 0 : getAttackBonus(closeOrRanged);
					const name = (e.effectName ?? '').toLowerCase();
				const isDamaging = name.includes('damage') || modNames.some((n: string) => n.includes('damaging'));
				const resistDC = isDamaging ? (effectRank + 15) : (effectRank + 10);
				const resistance = name.includes('affliction') ? 'Will / Fortitude' :
					isDamaging ? 'Toughness' : name.includes('move') ? 'Strength / Dodge' : 'Dodge';
				actions.push({
					name: a.name + ' — ' + (e.effectName ?? ''),
						descriptors: a.descriptors ?? [],
						effectType: e.effectName ?? '',
						effectRank,
						attackBonus: ab,
						autoHit,
						range: closeOrRanged,
						resistance,
						resistanceDC: resistDC,
						notes: '',
					});
				}
			}
		}
		return actions;
	}

	let attackActions = $derived.by(() => getAttackActions());

	type SelectableEffect = {
		powerName: string;
		effectName: string;
		effect: any;
	};

	let selectableEffects = $derived.by<SelectableEffect[]>(() => {
		const list: SelectableEffect[] = [];
		if (!draft) return list;
		for (const p of (draft.powers ?? [])) {
			for (const e of (p.effects ?? [])) {
				const name = (e.effectName ?? '').toLowerCase();
				if (name === 'summon' || name === 'movement' || name === 'senses' || name === 'immunity') continue;
				list.push({ powerName: p.name ?? '', effectName: e.effectName ?? '', effect: e });
			}
			for (const a of (p.alternateEffects ?? [])) {
				for (const e of (a.effects ?? [])) {
					const name = (e.effectName ?? '').toLowerCase();
					if (name === 'summon' || name === 'movement' || name === 'senses' || name === 'immunity') continue;
					list.push({ powerName: a.name ?? '', effectName: e.effectName ?? '', effect: e });
				}
			}
		}
		return list;
	});

	function shareCharacter() {
		if (!draft) return;
		const json = JSON.stringify(draft);
		const encoded = btoa(encodeURIComponent(json));
		const url = `${window.location.origin}/share/${encoded}`;
		navigator.clipboard.writeText(url).then(() => {
			shareCopied = true;
			setTimeout(() => shareCopied = false, 2000);
		});
	}

	async function saveCharacter() {
		if (!draft) return;
		saving = true;
		saveError = null;
		saveSuccess = false;
		try {
			const payload = JSON.parse(JSON.stringify(draft));
			delete payload.createdAt;
			delete payload.updatedAt;
			// Ensure primitive defaults on all skills
			for (const s of (payload.skills || [])) {
				if (typeof s.ppCost !== 'number') s.ppCost = 0;
			}
			if (typeof payload.spentAbilities !== 'number') payload.spentAbilities = 0;
			if (typeof payload.totalSpent !== 'number') payload.totalSpent = 0;
			// Ensure primitive defaults on equipment
			if (payload.equipmentPool) {
				if (typeof payload.equipmentPool.epSpent !== 'number') payload.equipmentPool.epSpent = 0;
				if (typeof payload.equipmentPool.totalEpAllowed !== 'number') payload.equipmentPool.totalEpAllowed = 0;
			}
			for (const hq of (payload.headquarters || [])) {
				if (typeof hq.totalEpCost !== 'number') hq.totalEpCost = 0;
			}
			if (payload.abilities) {
				for (const k of Object.keys(payload.abilities)) {
					if (typeof payload.abilities[k] === 'object') delete payload.abilities[k];
				}
			}
			if (payload.defenses) {
				for (const k of Object.keys(payload.defenses)) {
					if (typeof payload.defenses[k] === 'object') delete payload.defenses[k];
				}
			}
			for (const p of (payload.powers || [])) {
				normalizePowerForSave(p);
			}
			const updated = await api.character.update(draft.id, payload);
			if (session.activeCharacter) {
				Object.assign(session.activeCharacter, updated);
			}
			originalSnapshot = JSON.stringify(draft);
			cancelAutosave();
			saveSuccess = true;
			setTimeout(() => saveSuccess = false, 2000);
		} catch (e) {
			saveError = (e as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

{#if draft}
<div class="comic-wrap">
	<SplashHeader title="Unofficial " highlight="Mutants &amp; Masterminds" subtitle="Superhero Roleplaying · Character Sheet" />

	<div class="speech-bubble">
		&#9733; The tactical interface — built for heroes who need data <em>fast</em>. &#9733;
	</div>

	<div class="panel-grid-3">
		<ComicPanel header="&#9733; Identity" color="blue">
			<div class="field-group">
				<div class="field-hdr">Hero Name</div>
				<input class="input-demo" bind:value={draft.name} placeholder="Hero Name" />
			</div>
			<div class="field-group">
				<div class="field-hdr">Identity</div>
				<select class="input-demo" bind:value={draft.identity}>
					<option value="SECRET">Secret</option>
					<option value="PUBLIC">Public</option>
					<option value="DUAL">Dual</option>
				</select>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Gender</div>
					<input class="input-demo" bind:value={draft.gender} placeholder="Gender" />
				</div>
				<div class="field-group">
					<div class="field-hdr">Age</div>
					<input class="input-demo" bind:value={draft.age} placeholder="Age" />
				</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Height</div>
					<input class="input-demo" bind:value={draft.height} placeholder="Height" />
				</div>
				<div class="field-group">
					<div class="field-hdr">Weight</div>
					<input class="input-demo" bind:value={draft.weight} placeholder="Weight" />
				</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Power Level</div>
					<input class="input-demo input-num" type="number" bind:value={draft.powerLevel} />
				</div>
			</div>
		</ComicPanel>

		<EditableWrapper title="Power Points" isEditable={true} onSave={async () => {}}>
			{#snippet children()}
			<ComicPanel header="&#9733; Power Points" color="dark">
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
					<div class="pp-bar-text">{draft.totalAllowed - draft.totalSpent} PP Remaining</div>
				</div>
			</ComicPanel>
			{/snippet}
			{#snippet editForm()}
				<PowerPointsEditor draft={draft} />
			{/snippet}
		</EditableWrapper>

		<ComicPanel header="&#9733; Conditions" color="red">
			<div style="margin-bottom: 6px;">
				<span class="action-word zap" style="font-size: 20px;">STATUS</span>
				<button class="reset-cond-btn" onclick={() => { activeConditions = new Set(); resetManeuvers(); }}>Reset</button>
			</div>
			{#each [
				{ key: 'vulnerable' as ConditionKey, label: 'Vulnerable', desc: 'Halve Dodge & Parry', color: 'red' },
				{ key: 'defenseless' as ConditionKey, label: 'Defenseless', desc: 'Dodge & Parry \u2192 0', color: 'black' },
				{ key: 'impaired' as ConditionKey, label: 'Impaired', desc: '-2 to all checks', color: 'yellow' },
				{ key: 'disabled' as ConditionKey, label: 'Disabled', desc: '-5 to all checks', color: 'red' },
				{ key: 'hindered' as ConditionKey, label: 'Hindered', desc: 'Halve Speed', color: 'gray' },
				{ key: 'dazed' as ConditionKey, label: 'Dazed', desc: 'Standard action only', color: 'yellow' },
				{ key: 'stunned' as ConditionKey, label: 'Stunned', desc: 'No actions', color: 'red' },
				{ key: 'fatigued' as ConditionKey, label: 'Fatigued', desc: '-1 to checks', color: 'yellow' },
				{ key: 'exhausted' as ConditionKey, label: 'Exhausted', desc: '-2 to checks', color: 'red' },
			] as item}
				<label class="cond-check-row">
					<input type="checkbox" checked={activeConditions.has(item.key)} onchange={() => toggleCondition(item.key)} />
					<div class="cond-pip {item.color}"></div>
					<span class="cond-label">{item.label}</span>
					<span class="cond-desc">{item.desc}</span>
				</label>
			{/each}
			{#if activeConditions.has('dazed') || activeConditions.has('stunned')}
				<div class="action-warning">
					{activeConditions.has('stunned') ? '⛔ STUNNED — No actions this round' : '⚠️ DAZED — Standard action only'}
				</div>
			{/if}
		</ComicPanel>
	</div>

	<EditableWrapper title="Abilities" isEditable={true} onSave={async () => {}}>
		{#snippet children()}
		<ComicPanel header="&#9733; Abilities — Stats Module" color="blue">
			<div style="margin-bottom: 8px;">
				<span class="action-word">WHAM!</span>
				<span class="stat-hint">Stat values lead every module</span>
			</div>
			<div class="stat-row-8">
				<StatBubble value={draft.abilities?.strengthFinalValue ?? 0} label="STR" color="danger" />
				<StatBubble value={draft.abilities?.staminaFinalValue ?? 0} label="STA" color="default" />
				<StatBubble value={draft.abilities?.agilityFinalValue ?? 0} label="AGL" color="default" />
				<StatBubble value={draft.abilities?.dexterityFinalValue ?? 0} label="DEX" color="default" />
				<StatBubble value={draft.abilities?.fightingFinalValue ?? 0} label="FGT" color="success" />
				<StatBubble value={draft.abilities?.intellectFinalValue ?? 0} label="INT" color="secondary" />
				<StatBubble value={draft.abilities?.awarenessFinalValue ?? 0} label="AWE" color="default" />
				<StatBubble value={draft.abilities?.presenceFinalValue ?? 0} label="PRE" color="default" />
			</div>
		</ComicPanel>
		{/snippet}
		{#snippet editForm()}
			<AbilitiesEditor abilities={draft.abilities} />
		{/snippet}
	</EditableWrapper>

	<div class="panel-grid">
		<EditableWrapper title="Defenses" isEditable={true} onSave={async () => {}}>
{#snippet children()}
			{@const dd2 = getDefenseFinal('dodge', 'agility')}
			{@const dp2 = getDefenseFinal('parry', 'fighting')}
			{@const df2 = getDefenseFinal('fortitude', 'stamina')}
			{@const dt2 = getToughnessFinal()}
			{@const dw2 = getDefenseFinal('will', 'awareness')}
			<ComicPanel header="&#9733; Defenses" color="blue">
				<div class="def-row">
					<button class="pwr-check" disabled={defOtherMods('dodge') === 0} class:checked={defOtherMods('dodge') !== 0 && activeDefensePowerMods.has('dodge')} onclick={() => toggleDefensePowerMod('dodge')}>{defOtherMods('dodge') !== 0 && activeDefensePowerMods.has('dodge') ? '✓' : ''}</button>
					<span class="def-pill">Dodge</span>
					<span class="input-box-demo">{dd2.immune ? 'Immune' : dd2.value}</span>
					<span class="dc-badge">DC {dd2.immune ? '—' : dd2.value + 10}</span>
				</div>
				<div class="def-row">
					<button class="pwr-check" disabled={defOtherMods('parry') === 0} class:checked={defOtherMods('parry') !== 0 && activeDefensePowerMods.has('parry')} onclick={() => toggleDefensePowerMod('parry')}>{defOtherMods('parry') !== 0 && activeDefensePowerMods.has('parry') ? '✓' : ''}</button>
					<span class="def-pill">Parry</span>
					<span class="input-box-demo">{dp2.immune ? 'Immune' : dp2.value}</span>
					<span class="dc-badge">DC {dp2.immune ? '—' : dp2.value + 10}</span>
				</div>
				<div class="def-row">
					<button class="pwr-check" disabled={defOtherMods('fortitude') === 0} class:checked={defOtherMods('fortitude') !== 0 && activeDefensePowerMods.has('fortitude')} onclick={() => toggleDefensePowerMod('fortitude')}>{defOtherMods('fortitude') !== 0 && activeDefensePowerMods.has('fortitude') ? '✓' : ''}</button>
					<span class="def-pill green">Fortitude</span>
					<span class="input-box-demo">{df2.immune ? 'Immune' : df2.value}</span>
					<span class="dc-badge">DC {df2.immune ? '—' : df2.value + 10}</span>
				</div>
				<div class="def-row">
					<button class="pwr-check" disabled={defOtherMods('toughness') === 0} class:checked={defOtherMods('toughness') !== 0 && activeDefensePowerMods.has('toughness')} onclick={() => toggleDefensePowerMod('toughness')}>{defOtherMods('toughness') !== 0 && activeDefensePowerMods.has('toughness') ? '✓' : ''}</button>
					<span class="def-pill">Toughness</span>
					<span class="input-box-demo">{dt2.immune ? 'Immune' : dt2.value}</span>
					<span class="dc-badge">DC {dt2.immune ? '—' : dt2.value + 10}</span>
				</div>
				<div class="def-row">
					<button class="pwr-check" disabled={defOtherMods('will') === 0} class:checked={defOtherMods('will') !== 0 && activeDefensePowerMods.has('will')} onclick={() => toggleDefensePowerMod('will')}>{defOtherMods('will') !== 0 && activeDefensePowerMods.has('will') ? '✓' : ''}</button>
					<span class="def-pill blue">Will</span>
					<span class="input-box-demo">{dw2.immune ? 'Immune' : dw2.value}</span>
					<span class="dc-badge">DC {dw2.immune ? '—' : dw2.value + 10}</span>
				</div>
				<hr class="divider" />
				<div class="note-box">
					Dodge = Agi + Pts + Pwr | Parry = Fgt + Pts + Pwr | Fort = Sta + Pts + Pwr | Will = Awe + Pts + Pwr | Tough = Sta + Pts + Pwr + DefRoll
				</div>
				<div class="pl-warnings">
					<span class:pl-ok={plCaps.dodgeToughOk} class:pl-violation={!plCaps.dodgeToughOk}>Dodge+Tough {plCaps.dodgeTough}/{plCaps.cap}</span>
					<span class:pl-ok={plCaps.parryToughOk} class:pl-violation={!plCaps.parryToughOk}>Parry+Tough {plCaps.parryTough}/{plCaps.cap}</span>
					<span class:pl-ok={plCaps.fortWillOk} class:pl-violation={!plCaps.fortWillOk}>Fort+Will {plCaps.fortWill}/{plCaps.cap}</span>
				</div>
			</ComicPanel>
			{/snippet}
			{#snippet editForm()}
				<DefensesEditor defenses={draft.defenses} />
			{/snippet}
		</EditableWrapper>

		<ComicPanel header="&#9733; Combat" color="red">
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
					{powerAttack + accurateAttack > 0 ? '' : ''}
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
					<div class="atk-card" class:ranged={atk.range === 'ranged'}>
						<div class="atk-name">{atk.name}</div>
						<div class="atk-bonus">{atk.autoHit ? 'Auto' : atk.attackBonus >= 0 ? '+' + atk.attackBonus : String(atk.attackBonus)}</div>
						<div class="atk-resist">{atk.resistance}</div>
						<div class="atk-dc">{atk.resistanceDC > 0 ? atk.resistanceDC : '—'}</div>
						{#if atk.descriptors.length}
							<div class="atk-desc">{atk.descriptors.join(', ')}</div>
						{/if}
					</div>
				{/each}
				{#if selectableEffects.length > 0}
					<div class="atk-select-bar">
						<button class="select-atk-btn" onclick={() => showAttackSelector = !showAttackSelector}>
							{showAttackSelector ? '▼' : '▶'} Select Attacks
						</button>
					</div>
					{#if showAttackSelector}
						<div class="atk-select-list">
							{#each selectableEffects as se}
								<label class="atk-select-item" class:active={se.effect._showInCombat}>
									<input type="checkbox" checked={se.effect._showInCombat} onchange={() => se.effect._showInCombat = !se.effect._showInCombat} />
									<span class="atk-select-name">{se.powerName} — {se.effectName}</span>
								</label>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</ComicPanel>
	</div>

	<div class="all-view">
		{#each priorityOrder as key, i}
			<div class="section-wrap" class:full={i < 2} class:half={i >= 2}>
				{#if key === 'skills'}
				<EditableWrapper title="Skills" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Skills" color="yellow">
						<SkillTable skills={draft.skills ?? []} />
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<SkillsEditor skills={draft.skills} />
					{/snippet}
				</EditableWrapper>
				{:else if key === 'advantages'}
				<EditableWrapper title="Advantages" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Advantages" color="dark">
						{#each draft.advantages ?? [] as adv, i}
							<div class="advantage-row">
								<div class="advantage-bullet">&#9656;</div>
								<div class="advantage-name">{adv.name}{adv.ranks > 1 ? ' ' + adv.ranks : ''}</div>
								{#if adv.description}<div class="advantage-desc">{adv.description}</div>{/if}
							</div>
						{/each}
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<AdvantagesEditor advantages={draft.advantages} />
					{/snippet}
				</EditableWrapper>
				{:else if key === 'equipment'}
				<EditableWrapper title="Equipment" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Equipment" color="blue">
						<div class="ep-bar">
							<span class="ep-label">EP {draft.equipmentPool.epSpent} / {draft.equipmentPool.totalEpAllowed}</span>
						</div>
						{#each draft.equipmentPool.items ?? [] as item, i}
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
							<span class="ep-label">&#9733; Headquarters</span>
						</div>
						{#each draft.headquarters ?? [] as hq, i}
							<div class="hq-row">
								<div class="hq-name">{hq.name}</div>
								<div class="hq-cost">{hq.totalEpCost} EP</div>
								{#if hq.isSharedTeamBase}<span class="shared-badge">Team Base</span>{/if}
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
							{#if i < draft.headquarters.length - 1}<hr class="divider" />{/if}
						{:else}
							<div class="empty-state">No headquarters</div>
						{/each}
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<EquipmentEditor equipmentPool={draft.equipmentPool} />
						<hr class="divider" />
						<HeadquartersEditor headquarters={draft.headquarters} />
					{/snippet}
				</EditableWrapper>
				{:else if key === 'powers'}
				<EditableWrapper title="Powers" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Powers" color="blue">
						{#each draft.powers ?? [] as power, i}
							<div class="power-row">
								<div class="power-header">
									<span class="power-name">{power.name}</span>
									{#if power.isArray}<span class="array-badge">ARRAY</span>{/if}
									<PillBadge text="{power.totalPowerCost} PP" color="primary" />
								</div>
								{#if power.description}
									<div class="power-desc-text">{power.description}</div>
								{/if}
								{#if power.descriptors?.length}
									<div class="power-desc">{power.descriptors.join(', ')}</div>
								{/if}
								{#if power.isArray}
									<div class="array-slot active-slot">Active Slot</div>
								{/if}
								{#each power.effects as effect}
									<div class="effect-line">
										<span class="effect-name">{effect.effectName}</span>
										{#if effect.isSummon}<span class="summon-badge">Summon</span>{/if}
										<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
										{#if effect.modifiers?.length}
											<div class="modifier-line">
												{#each effect.modifiers as mod}
													<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.isFlat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
												{/each}
											</div>
										{/if}
										{#if effect.isSummon && effect.summonExtension}
											<div class="summon-block">
												<div class="summon-info">Summon Rank {effect.summonExtension.summonRank} &middot; {effect.summonExtension.minionPpBudget} PP Minion</div>
												{#if effect.summonExtension.minionStatBlock}
													{@const sb = effect.summonExtension.minionStatBlock}
													<div class="minion-statblock">
														<div class="minion-stat-name">{sb.name}</div>
														<div class="minion-stat-row"><span class="minion-stat-lbl">STR</span><span class="minion-stat-val">{sb.abilities.strengthFinalValue}</span><span class="minion-stat-lbl">STA</span><span class="minion-stat-val">{sb.abilities.staminaFinalValue}</span><span class="minion-stat-lbl">AGL</span><span class="minion-stat-val">{sb.abilities.agilityFinalValue}</span><span class="minion-stat-lbl">DEX</span><span class="minion-stat-val">{sb.abilities.dexterityFinalValue}</span><span class="minion-stat-lbl">FGT</span><span class="minion-stat-val">{sb.abilities.fightingFinalValue}</span><span class="minion-stat-lbl">INT</span><span class="minion-stat-val">{sb.abilities.intellectFinalValue}</span><span class="minion-stat-lbl">AWE</span><span class="minion-stat-val">{sb.abilities.awarenessFinalValue}</span><span class="minion-stat-lbl">PRE</span><span class="minion-stat-val">{sb.abilities.presenceFinalValue}</span></div>
														<div class="minion-stat-row"><span class="minion-stat-lbl">Dodge</span><span class="minion-stat-val">{sb.defenses.dodgeFinalValue}</span><span class="minion-stat-lbl">Parry</span><span class="minion-stat-val">{sb.defenses.parryFinalValue}</span><span class="minion-stat-lbl">Fort</span><span class="minion-stat-val">{sb.defenses.fortitudeFinalValue}</span><span class="minion-stat-lbl">Tough</span><span class="minion-stat-val">{sb.defenses.toughnessFinalValue}</span><span class="minion-stat-lbl">Will</span><span class="minion-stat-val">{sb.defenses.willFinalValue}</span></div>
														{#if sb.skills?.length}
															<div class="minion-stat-row"><span class="minion-stat-lbl">Skills</span><span class="minion-stat-skills">{sb.skills.map(s => s.skillName + (s.ranks ? ' ' + s.ranks : '')).join(', ')}</span></div>
														{/if}
														{#if sb.advantages?.length}
															<div class="minion-stat-row"><span class="minion-stat-lbl">Adv</span><span class="minion-stat-skills">{sb.advantages.map(a => a.name + (a.ranks > 1 ? ' ' + a.ranks : '')).join(', ')}</span></div>
														{/if}
														{#if sb.powers?.length}
															<div class="minion-stat-row"><span class="minion-stat-lbl">Powers</span><span class="minion-stat-skills">{sb.powers.map(p => p.name).join(', ')}</span></div>
														{/if}
													</div>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
								{#if power.isArray && power.alternateEffects?.length}
									<div class="alt-effects-divider">Alternate Effects</div>
									{#each power.alternateEffects as alt}
										<div class="alt-effect-block">
											<div class="alt-header">
												<span class="alt-name">{alt.name}</span>
												<span class="alt-meta">{alt.arrayType === 'DYNAMIC' ? 'Dynamic' : 'Alternate'} &middot; <strong>{alt.effects.reduce((s, e) => s + (e.calculatedCost ?? 0), 0)} PP</strong></span>
											</div>
											{#if alt.description}<div class="alt-desc">{alt.description}</div>{/if}
											{#each alt.effects as effect}
												<div class="effect-line">
													<span class="effect-name">{effect.effectName}</span>
													<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
													{#if effect.modifiers?.length}
														<div class="modifier-line">
															{#each effect.modifiers as mod}
																<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.isFlat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
															{/each}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									{/each}
								{/if}
							</div>
						{/each}
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<PowersEditor powers={draft.powers} />
					{/snippet}
				</EditableWrapper>
				{/if}
			</div>
		{/each}
	</div>

	<div class="complications-spacer"></div>

	<EditableWrapper title="Complications" isEditable={true} onSave={async () => {}}>
		{#snippet children()}
		<ComicPanel header="&#9733; Notes &amp; Complications" color="yellow">
			{#each draft.complications ?? [] as comp, i}
				<div class="complication-row">
					<div class="comp-badge">{comp.type}</div>
					<div class="comp-text">{comp.description}</div>
				</div>
			{/each}
		</ComicPanel>
		{/snippet}
		{#snippet editForm()}
			<ComplicationsEditor complications={draft.complications} />
		{/snippet}
	</EditableWrapper>

	<div class="save-bar">
		<div class="save-left">
			<button onclick={saveCharacter} disabled={saving} class="save-btn">
				{saving ? 'Saving...' : 'Save Character'}
			</button>
			<button onclick={shareCharacter} class="share-btn">
				{shareCopied ? 'Copied!' : 'Share'}
			</button>
			{#if autosaveDirty}
				<span class="autosave-indicator">&bull; Unsaved changes &mdash; autosave in 15s</span>
			{/if}
			{#if saveError}
				<span class="save-error">{saveError}</span>
			{/if}
			{#if saveSuccess}
				<span class="save-success">Saved!</span>
			{/if}
		</div>
		<div class="priority-controls">
			<span class="priority-label">Section order:</span>
			{#each priorityOrder as key, i}
				<div class="priority-item">
					<span class="priority-name">{key}</span>
					<button class="move-btn" onclick={() => movePriority(i, i - 1)} disabled={i === 0}>&#9650;</button>
					<button class="move-btn" onclick={() => movePriority(i, i + 1)} disabled={i === priorityOrder.length - 1}>&#9660;</button>
				</div>
			{/each}
		</div>
	</div>

	<div class="signature-band" style="margin-top: 16px;">
		<div class="sig-dots"></div>
		<span style="position: relative; z-index: 1;">&#9733; UNOFFICIAL MUTANTS &amp; MASTERMINDS · CHARACTER SHEET · POWER LEVEL {draft.powerLevel} &#9733;</span>
	</div>
</div>
{/if}

<style>
	.comic-wrap {
		font-family: 'Nunito', sans-serif;
		background: var(--newsprint);
		padding: 20px;
		width: 100%;
		max-width: 90vw;
	}

	.speech-bubble {
		background: var(--panel-bg);
		border: 3px solid var(--border);
		border-radius: 16px;
		padding: 10px 14px;
		position: relative;
		display: inline-block;
		margin: 0 0 14px 10px;
		box-shadow: 3px 3px 0 var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--ink);
		letter-spacing: 0.02em;
		max-width: 90%;
	}
	.speech-bubble::before {
		content: '';
		position: absolute;
		bottom: -14px;
		left: 20px;
		border: 7px solid transparent;
		border-top-color: var(--border);
	}
	.speech-bubble::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 22px;
		border: 5px solid transparent;
		border-top-color: var(--panel-bg);
	}

	.panel-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-top: 20px;
		margin-bottom: 14px;
	}

	.panel-grid-3 {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 14px;
		margin-bottom: 14px;
	}

	.action-word {
		font-family: 'Bangers', cursive;
		font-size: 38px;
		letter-spacing: 0.04em;
		color: var(--danger);
		text-shadow: 2px 2px 0 #7A0000, 4px 4px 0 var(--ink);
		line-height: 1;
		display: block;
		margin-bottom: 4px;
	}
	.action-word.zap { color: var(--accent); text-shadow: 2px 2px 0 #8B6000, 4px 4px 0 var(--ink); }
	.action-word.pow { color: var(--secondary); text-shadow: 2px 2px 0 #0A1E5E, 4px 4px 0 var(--ink); }

	.stat-hint {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent);
	}

	.stat-row-8 {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.field-group { margin-bottom: 8px; }

	.field-hdr {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 2px;
	}

	.input-demo {
		border: none;
		border-bottom: 3px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		padding: 4px 2px;
		width: 100%;
		background: transparent;
		color: var(--ink);
		outline: none;
	}
	select.input-demo {
		appearance: none;
		cursor: pointer;
	}
	.input-demo.input-num { width: 60px; }

	.input-box-demo {
		border: 3px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		font-family: 'Bangers', cursive;
		font-size: 24px;
		text-align: center;
		width: 44px;
		height: 44px;
		color: var(--primary);
		background: var(--panel-bg);
		padding: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

	.divider {
		border: none;
		border-top: 3px solid var(--border);
		margin: 6px 0;
	}

	.note-box {
		background: var(--newsprint);
		border: 2.5px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		border-left: 6px solid var(--highlight);
		padding: 8px 10px;
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		line-height: 1.4;
	}

	.pp-display {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 10px;
	}

	.pp-ring {
		width: 80px;
		height: 80px;
		border: 3px solid var(--highlight);
		box-shadow: 3px 3px 0 var(--border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--highlight) 10%, transparent);
	}
	.pp-ring.used { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 8%, transparent); }

	.pp-ring-inner { text-align: center; }

	.pp-num {
		font-family: 'Bangers', cursive;
		font-size: 26px;
		letter-spacing: 0.03em;
		color: var(--accent);
		line-height: 1;
	}
	.pp-ring.used .pp-num { color: var(--danger); }

	.pp-lbl {
		font-family: 'Oswald', sans-serif;
		font-size: 7px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.pp-bar-wrap { padding: 0 4px; }

	.pp-bar-bg {
		width: 100%;
		height: 12px;
		background: #333;
		border: 2px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		overflow: hidden;
	}
	.pp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--danger), var(--highlight), var(--success));
		transition: width 0.3s ease;
	}
	.pp-bar-text {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-align: center;
		margin-top: 4px;
	}

	.def-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 8px;
		align-items: center;
		justify-items: center;
		margin-bottom: 8px;
	}
	.pwr-check { width:18px; height:18px; border:2px solid var(--border); border-radius:3px; background:transparent; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--panel-bg); line-height:1; transition:all 0.15s; }
	.pwr-check.checked { background:var(--secondary); border-color:var(--secondary); }
	.pwr-check:disabled { opacity:0.35; cursor:default; }


	.def-pill {
		display: inline-block;
		border: 2.5px solid var(--danger);
		background: var(--panel-bg);
		border-radius: 20px;
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--danger);
		padding: 2px 10px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		box-shadow: 2px 2px 0 var(--border);
	}
	.def-pill.green { border-color: var(--success); color: var(--success); background: var(--panel-bg); }
	.def-pill.blue { border-color: var(--secondary); color: var(--secondary); background: var(--panel-bg); }

	.dc-badge { font-family:'Oswald',sans-serif; font-size:13px; font-weight:700; color:var(--ink); background:color-mix(in srgb, var(--ink) 8%, transparent); padding:2px 8px; border-radius:4px; margin-left:4px; white-space:nowrap; }

	.pl-warnings { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; font-family:'Oswald',sans-serif; font-size:12px; font-weight:600; }
	.pl-ok { color:var(--success); }
	.pl-violation { color:var(--danger); }

	.advantage-row {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 4px 0;
		border-bottom: 1.5px dashed var(--border);
	}
	.advantage-row:last-child { border-bottom: none; }

	.advantage-bullet {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		color: var(--danger);
	}
	.advantage-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		flex-shrink: 0;
	}
	.advantage-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--accent);
		margin-left: 4px;
	}

	.power-row {
		padding: 8px 0;
		border-bottom: 1.5px dashed var(--border);
	}
	.power-row:last-child { border-bottom: none; }

	.power-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2px;
	}
	.power-name {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.04em;
		color: var(--accent);
		text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
	}
	.power-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		opacity: 0.75;
		line-height: 1.4;
	}
	.power-desc-text {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.45;
		margin: 4px 0 2px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--panel-bg) 60%, transparent);
		border-left: 3px solid var(--primary);
	}
	.array-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		color: white;
		background: var(--danger);
		padding: 1px 5px;
		margin-left: 6px;
		letter-spacing: 0.06em;
	}
	.effect-line {
		margin: 4px 0 2px 8px;
		padding-left: 8px;
		border-left: 2px solid var(--border);
	}
	.effect-name {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}
	.effect-detail {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--accent);
		margin-left: 6px;
	}
	.summon-badge { display:inline-block; font-family:'Oswald',sans-serif; font-size:8px; font-weight:700; color:white; background:var(--secondary); padding:1px 5px; margin-left:4px; text-transform:uppercase; letter-spacing:0.05em; vertical-align:middle; }
	.summon-block { margin:3px 0 2px 8px; padding:3px 6px; background:color-mix(in srgb, var(--secondary) 10%, transparent); border-left:2px solid var(--secondary); }
	.summon-info { font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; color:var(--secondary); text-transform:uppercase; letter-spacing:0.05em; }
	.minion-name { font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); margin-top:1px; }
	.minion-statblock { margin-top:3px; padding:4px; background:color-mix(in srgb, var(--panel-bg) 60%, transparent); border:1.5px solid var(--border); }
	.minion-stat-name { font-family:'Bangers',cursive; font-size:12px; color:var(--accent); margin-bottom:2px; }
	.minion-stat-row { display:flex; flex-wrap:wrap; gap:2px 6px; margin-bottom:1px; font-family:'Oswald',sans-serif; font-size:12px; }
	.minion-stat-lbl { font-weight:700; color:var(--ink); opacity:.7; }
	.minion-stat-val { font-weight:700; color:var(--ink); margin-right:6px; }
	.minion-stat-skills { font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); }
	.modifier-line {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		margin-top: 2px;
	}
	.mod-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		padding: 1px 5px;
		display: inline-block;
	}
	.mod-badge.extra {
		background: color-mix(in srgb, var(--primary) 25%, transparent);
		color: var(--primary);
		border: 1px solid var(--primary);
	}
	.mod-badge.flaw {
		background: color-mix(in srgb, var(--danger) 25%, transparent);
		color: var(--danger);
		border: 1px solid var(--danger);
	}
	.array-slot {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.array-slot.active-slot {
		color: var(--primary);
		margin: 4px 0 2px;
		padding: 2px 6px;
		background: color-mix(in srgb, var(--primary) 12%, transparent);
		border-left: 3px solid var(--primary);
	}
	.alt-effects-divider {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 6px 0 3px;
		padding-top: 4px;
		border-top: 1.5px dashed var(--border);
	}
	.alt-effect-block {
		margin: 3px 0 3px 8px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--panel-bg) 50%, transparent);
		border: 1px solid var(--border);
	}
	.alt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2px;
	}
	.alt-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--ink);
	}
	.alt-meta {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--accent);
	}
	.alt-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		opacity: 0.75;
		margin: 2px 0 4px;
		line-height: 1.4;
	}

	.complication-row {
		display: flex;
		gap: 10px;
		padding: 6px 0;
		border-bottom: 1.5px dashed var(--border);
		align-items: flex-start;
	}
	.complication-row:last-child { border-bottom: none; }

	.comp-badge {
		flex-shrink: 0;
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--primary);
		background: var(--panel-bg);
		border: 2px solid var(--primary);
		padding: 2px 8px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.comp-text {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.4;
	}

	.empty-state {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--accent);
		text-align: center;
		padding: 8px;
	}

	.equipment-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		border-bottom: 1.5px dashed var(--border);
	}
	.equipment-row:last-child { border-bottom: none; }
	.equipment-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--accent);
		margin: -2px 0 4px 18px;
	}
	.equipment-bullet {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		color: var(--primary);
	}
	.equipment-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		flex: 1;
	}
	.equipment-cost {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
	}
	.ep-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--primary) 12%, transparent);
		border: 1.5px solid var(--primary);
	}
	.ep-label {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--primary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.hq-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 2px;
	}
	.hq-name {
		font-family: 'Bangers', cursive;
		font-size: 15px;
		color: var(--accent);
	}
	.hq-cost {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		margin-left: auto;
	}
	.shared-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		color: white;
		background: var(--success);
		padding: 1px 5px;
	}
	.hq-detail {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--accent);
		margin-bottom: 2px;
	}
	.hq-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		margin-bottom: 4px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--panel-bg) 60%, transparent);
		border-left: 3px solid var(--primary);
	}
	.hq-features {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 4px;
	}
	.feature-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--primary);
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		border: 1.5px solid var(--primary);
		padding: 1px 6px;
	}
	.def-systems {
		margin-bottom: 4px;
	}
	.def-sys-header {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		display: block;
		margin-bottom: 2px;
	}
	.def-sys-item {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		display: block;
		padding: 1px 0 1px 8px;
		border-left: 2px solid var(--danger);
		margin-bottom: 1px;
	}
	.def-sys-cost {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--accent);
	}

	.all-view {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.section-wrap.full {
		grid-column: 1 / -1;
	}
	.section-wrap.half {
		grid-column: span 1;
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

	.priority-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}
	.priority-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
			font-weight: 700;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 0.06em;
			margin-bottom: 2px;
	}
	.priority-item {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.priority-name {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
		text-transform: capitalize;
		padding: 2px 6px;
		background: var(--newsprint);
		border: 1.5px solid var(--border);
	}
	.move-btn {
		background: var(--panel-bg);
		border: 1.5px solid var(--border);
		color: var(--accent);
		font-size: 12px;
		width: 20px;
		height: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		line-height: 1;
	}
	.move-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	.move-btn:hover:not(:disabled) {
		background: var(--primary);
		color: white;
	}
	.save-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.signature-band {
		background: var(--border);
		color: var(--accent);
		font-family: 'Bangers', cursive;
		font-size: 15px;
		letter-spacing: 0.15em;
		text-align: center;
		padding: 5px;
		position: relative;
		overflow: hidden;
	}
	.sig-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, var(--highlight) 1px, transparent 1px);
		background-size: 10px 10px;
		opacity: 0.15;
	}

	.complications-spacer {
		height: 24px;
	}

	.save-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
		padding: 12px;
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
	}
	.save-btn {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.08em;
		color: white;
		background: var(--primary);
		border: 3px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		padding: 8px 24px;
		cursor: pointer;
		text-transform: uppercase;
		transition: transform 0.1s;
	}
	.save-btn:hover:not(:disabled) { transform: translate(1px, 1px); box-shadow: 2px 2px 0 var(--border); }
	.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.save-error {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--danger);
	}
	.save-success {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--success);
	}
	.autosave-indicator {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--highlight);
		letter-spacing: 0.04em;
	}
	/* ── Condition Checkboxes ── */
	.cond-check-row { display:flex; align-items:center; gap:6px; padding:3px 0; border-bottom:1.5px dashed var(--border); cursor:pointer; }
	.cond-check-row input[type="checkbox"] { accent-color:var(--primary); cursor:pointer; }
	.cond-pip { width:10px; height:10px; border-radius:50%; border:1.5px solid var(--border); flex-shrink:0; }
	.cond-pip.red { background:var(--danger); }
	.cond-pip.yellow { background:var(--highlight); }
	.cond-pip.gray { background:var(--accent); }
	.cond-pip.black { background:var(--border); }
	.cond-label { font-family:'Nunito',sans-serif; font-size:13px; font-weight:600; color:var(--ink); min-width:80px; }
	.cond-desc { font-family:'Nunito',sans-serif; font-size:11px; color:var(--accent); opacity:.7; }
	.reset-cond-btn { background:var(--panel-bg); border:1.5px solid var(--border); color:var(--accent); font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; padding:2px 8px; cursor:pointer; margin-left:auto; }
	.action-warning { margin-top:6px; padding:4px 8px; background:var(--danger); color:white; font-family:'Bangers',cursive; font-size:14px; text-align:center; letter-spacing:0.06em; }
	/* ── Maneuvers ── */
	.maneuver-bar { margin:6px 0; padding:6px; border:1.5px dashed var(--border); background:color-mix(in srgb, var(--panel-bg) 60%, transparent); }
	.maneuver-hdr { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; display:block; }
	.maneuver-row { display:flex; flex-wrap:wrap; gap:4px; align-items:center; }
	.maneuver-btn { display:flex; align-items:center; gap:3px; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--ink); padding:2px 6px; border:1.5px solid var(--border); background:var(--newsprint); cursor:pointer; }
	.maneuver-btn.active { border-color:var(--primary); background:color-mix(in srgb, var(--primary) 20%, transparent); }
	.maneuver-input { width:28px; padding:1px 2px; border:none; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--ink); background:transparent; text-align:center; outline:none; }
	.maneuver-reset { background:var(--panel-bg); border:1.5px solid var(--border); color:var(--accent); font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; padding:2px 8px; cursor:pointer; }
	.maneuver-shift { font-family:'Nunito',sans-serif; font-size:11px; color:var(--accent); margin-top:2px; }
	/* ── Combat / Initiative ── */
	.init-value { font-family:'Bangers',cursive; font-size:22px; color:var(--success); display:inline-block; min-width:36px; text-align:center; }
	/* ── Attack Cards ── */
	.attacks-list { display:flex; flex-direction:column; gap:3px; max-height:320px; overflow-y:auto; scrollbar-width:none; }
	.atk-hdr-row { display:grid; grid-template-columns:1fr 44px 72px 44px; gap:4px; padding:3px 4px; border-bottom:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.06em; }
	.atk-card { display:grid; grid-template-columns:1fr 44px 72px 44px; gap:4px; align-items:center; padding:3px 4px; border:1.5px solid var(--border); background:color-mix(in srgb, var(--panel-bg) 60%, transparent); }
	.atk-card.ranged { border-left:3px solid var(--primary); }
	.atk-name { font-family:'Nunito',sans-serif; font-size:12px; font-weight:600; color:var(--ink); grid-column:1; }
	.atk-bonus { font-family:'Bangers',cursive; font-size:16px; color:var(--success); text-align:center; }
	.atk-resist { font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; color:var(--accent); text-align:center; }
	.atk-dc { font-family:'Bangers',cursive; font-size:16px; color:var(--danger); text-align:center; }
	.atk-desc { grid-column:1/-1; font-family:'Nunito',sans-serif; font-size:10px; color:var(--accent); opacity:.6; }
	.atk-empty { font-family:'Nunito',sans-serif; font-size:12px; color:var(--accent); padding:8px; text-align:center; }
	.atk-select-bar { margin-top:4px; }
	.select-atk-btn { background:var(--panel-bg); border:1.5px solid var(--border); color:var(--accent); font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; padding:3px 10px; cursor:pointer; width:100%; text-align:left; letter-spacing:0.04em; }
	.select-atk-btn:hover { border-color:var(--primary); color:var(--ink); }
	.atk-select-list { margin-top:2px; border:1.5px solid var(--border); background:color-mix(in srgb, var(--panel-bg) 50%, transparent); max-height:200px; overflow-y:auto; }
	.atk-select-item { display:flex; align-items:center; gap:6px; padding:3px 6px; cursor:pointer; font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); border-bottom:1px solid var(--border); }
	.atk-select-item.active { background:color-mix(in srgb, var(--danger) 12%, transparent); }
	.atk-select-item input[type="checkbox"] { accent-color:var(--danger); cursor:pointer; }
	.atk-select-name { flex:1; }
</style>
