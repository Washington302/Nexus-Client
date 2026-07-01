<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { MnmCharacter } from '$lib/services/api';
	import { abilityMod, abilityModStr, effectCost, perRankCost, powerTotalCost, ensureDefaults, initNormalizePower, normalizePowerForSave, effectResistance, resistanceLabel } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import StatBubble from '$lib/components/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import IdentityPanel from '$lib/components/IdentityPanel.svelte';
	import ConditionsPanel from '$lib/components/ConditionsPanel.svelte';
	import DefensesDisplay from '$lib/components/DefensesDisplay.svelte';
	import DamageTrackEditor from '$lib/components/DamageTrackEditor.svelte';
	import PowerDisplayCard from '$lib/components/PowerDisplayCard.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';
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

			// Convert backend devices[] back into device-flagged powers
			const backendDevices = d.devices ?? [];
			for (const dv of backendDevices) {
				const devicePower = {
					powerId: dv.deviceId,
					name: dv.name,
					description: '',
					descriptors: [],
					isArray: false,
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
			// Auto-compute power costs (including embedded device powers)
			function calcPowerInit(p: any) {
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
			if (d.powers) {
			for (const p of d.powers) {
				if (p._deviceType) {
					for (const ep of (p._embeddedPowers ?? [])) calcPowerInit(ep);
					const raw = (p._embeddedPowers ?? []).reduce((s: number, ep: any) => s + (ep.totalPowerCost ?? 0), 0);
					let discount = 0;
					if (raw <= 5) {
						discount = p._deviceType === 'EASILY_REMOVABLE' ? 4 : 2;
					} else {
						const perFive = Math.ceil(raw / 5);
						discount = p._deviceType === 'EASILY_REMOVABLE' ? perFive * 2 : perFive;
					}
					p.totalPowerCost = Math.max(0, raw - discount);
				} else {
					calcPowerInit(p);
				}
			}
			}
			d.spentPowers = (d.powers ?? []).reduce((sum: number, p: any) => sum + (p.totalPowerCost ?? 0), 0);
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
			let totalSkillRanks = 0;
			for (const s of (d.skills ?? [])) {
				const abiKey = ABIL_MAP[s.keyAbility] ?? 'agility';
				const abiVal = (d.abilities as any)?.[abiKey + 'FinalValue'] ?? 0;
				s.finalBonus = (s.ranks ?? 0) + abilityMod(abiVal) + (s.modifier ?? 0);
				totalSkillRanks += (s.ranks ?? 0);
			}
			d.spentSkills = Math.ceil(totalSkillRanks / 2);
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
		let totalSkillRanks = 0;
		for (const s of (draft.skills ?? [])) {
			const abiKey = ABIL_MAP[s.keyAbility] ?? 'agility';
			const abiVal = (draft.abilities as any)?.[abiKey + 'FinalValue'] ?? 0;
			s.finalBonus = (s.ranks ?? 0) + abilityMod(abiVal) + (s.modifier ?? 0);
			totalSkillRanks += (s.ranks ?? 0);
		}
		draft.spentSkills = Math.ceil(totalSkillRanks / 2);
		// Auto-compute equipment costs
		const hqs = draft.headquarters ?? [];
		for (const hq of hqs) {
			const dsCost = (hq.defenseSystems ?? []).reduce((s: number, d: any) => s + (d.totalPowerCost ?? 0), 0);
			hq.totalEpCost = Math.round((hq.sizeCost ?? 0) + (hq.toughnessCost ?? 0) + dsCost);
		}
		const itemsCost = (draft.equipmentPool?.items ?? []).reduce((s: number, i: any) => s + (i.epCost ?? 0), 0);
		const hqCost = hqs.reduce((s: number, hq: any) => s + (hq.totalEpCost ?? 0), 0);
		if (draft.equipmentPool) draft.equipmentPool.epSpent = Math.round(itemsCost + hqCost);
		draft.spentPowers = (draft.powers ?? []).reduce((sum: number, p: any) => sum + (p.totalPowerCost ?? 0), 0);
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

	// ── Combat State (session-only) ──
	let accumulatedToughnessPenalty = $state(0);
	let staggered = $state(false);
	let dying = $state(0);
	let incapacitated = $state(false);

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
		// Apply accumulated damage penalty (session-only)
		return { value: Math.max(0, base - accumulatedToughnessPenalty), immune: false };
	}

	const damagePenaltyDisplay = $derived(accumulatedToughnessPenalty > 0 ? `-${accumulatedToughnessPenalty}` : '0');

	const pl = $derived(draft?.powerLevel ?? 10);
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

	function getAttackActions(): AttackAction[] {
		if (!draft) return [];
		const actions: AttackAction[] = [];
		if (draft) {
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
				const rangeLabel = autoHit ? (modNames.some((n: string) => n.includes('area') || n.includes('burst') || n.includes('cone') || n.includes('cloud') || n.includes('line')) ? 'Area' : 'Perception') : closeOrRanged === 'ranged' ? 'Ranged' : 'Close';
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
		eachPowerEffect(draft, (powerName, e) => {
			const name = (e.effectName ?? '').toLowerCase();
			if (name === 'summon' || name === 'movement' || name === 'senses' || name === 'immunity') return;
			list.push({ powerName, effectName: e.effectName ?? '', effect: e });
		});
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
			// Split device-flagged powers into devices[] for the backend
			const devices: any[] = [];
			const regularPowers: any[] = [];
			for (const p of (payload.powers || [])) {
				if (p._deviceType) {
					const embeddedPowers = (p._embeddedPowers || []).map((ep: any) => {
						normalizePowerForSave(ep);
						delete ep._deviceType;
						delete ep._embeddedPowers;
						return ep;
					});
					const rawCost = embeddedPowers.reduce((s: number, ep: any) => s + (ep.totalPowerCost ?? 0), 0);
					let discount = 0;
					if (rawCost <= 5) {
						discount = p._deviceType === 'EASILY_REMOVABLE' ? 4 : 2;
					} else {
						const perFive = Math.ceil(rawCost / 5);
						discount = p._deviceType === 'EASILY_REMOVABLE' ? perFive * 2 : perFive;
					}
					devices.push({
						deviceId: p.powerId,
						name: p.name,
						deviceType: p._deviceType,
						embeddedPowers,
						rawCombinedCost: rawCost,
						pointDiscount: discount,
						finalDeviceCost: Math.max(0, rawCost - discount),
					});
				} else {
					regularPowers.push(p);
				}
			}
			payload.powers = regularPowers;
			payload.devices = devices;
			payload.spentPowers = regularPowers.reduce((sum: number, p: any) => sum + (p.totalPowerCost ?? 0), 0) + devices.reduce((sum: number, d: any) => sum + (d.finalDeviceCost ?? 0), 0);
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
			<IdentityPanel {draft} />
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
			<ConditionsPanel {activeConditions} {toggleCondition} onReset={() => { activeConditions = new Set(); resetManeuvers(); resetCombatState(); }} />
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
			<ComicPanel header="&#9733; Defenses" color="blue">
				<DefensesDisplay {draft} {getDefenseFinal} {getToughnessFinal} {defOtherMods} {activeDefensePowerMods} {toggleDefensePowerMod} {plCaps} />
			</ComicPanel>
			{/snippet}
			{#snippet editForm()}
				<DefensesEditor bind:defenses={draft.defenses} />
			{/snippet}
		</EditableWrapper>

		<EditableWrapper title="Combat" isEditable={true} onSave={async () => {}}>
			{#snippet children()}
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
					<AttackActionCard attack={atk} />
				{/each}
			</div>
		</ComicPanel>
		{/snippet}
		{#snippet editForm()}
			<DamageTrackEditor {damagePenaltyDisplay} bind:staggered bind:incapacitated bind:dying {applyDamage} {healDamage} {incrementDying} {resetCombatState} />
			{#if selectableEffects.length > 0}
				<div class="edit-select-attacks">
					<span class="maneuver-hdr">Select Combat Attacks</span>
					<div class="atk-select-list">
						{#each selectableEffects as se}
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
						{/each}
					</div>
				</div>
{/if}
			<div class="combat-edit-note">Combat state is session-only and resets on page reload.</div>
		{/snippet}
	</EditableWrapper>
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
						{#each draft.powers ?? [] as power}
							<PowerDisplayCard {power} />
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

	<SaveBar {saving} {saveError} {saveSuccess} {shareCopied} {autosaveDirty} {priorityOrder} onSave={saveCharacter} onShare={shareCharacter} onMove={movePriority} />

	<div class="signature-band" style="margin-top: 16px;">
		<div class="sig-dots"></div>
		<span style="position: relative; z-index: 1;">&#9733; UNOFFICIAL MUTANTS &amp; MASTERMINDS · CHARACTER SHEET · POWER LEVEL {draft.powerLevel} &#9733;</span>
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