<script lang="ts">
	import { page } from '$app/stores';
	import type { MnmCharacter } from '$lib/services/api';
	import { effectCost, ensureDefaults, initNormalizePower, getDefenseFinal, getToughnessFinal, getInitiative } from '$lib/utils/character';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import StatBubble from '$lib/components/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';

	import SplashHeader from '$lib/components/SplashHeader.svelte';

	let char = $state<MnmCharacter>(null!);
	let error = $state<string | null>(null);

	try {
		const raw = $page.params.data as string | undefined;
		if (!raw) { error = 'No character data provided.'; }
		else {
		const json = decodeURIComponent(atob(raw));
		const data: any = JSON.parse(json);
		char = data;
		ensureDefaults(data);
		if (data.powers) {
			for (const p of data.powers) {
				initNormalizePower(p);
			}
			for (const p of data.powers) {
				p.totalPowerCost = Math.max(
					(p.effects ?? []).reduce((s: number, e: any) => s + effectCost(e), 0),
					(p.alternateEffects ?? []).reduce((s: number, a: any) => Math.max(s, (a.effects ?? []).reduce((s2: number, e: any) => s2 + effectCost(e), 0)), 0)
				) + (p.alternateEffects?.length ?? 0);
				for (const e of p.effects ?? []) {
					if (e.effectName?.toLowerCase() === 'summon') e.isSummon = true;
					e.calculatedCost = effectCost(e);
					if (e.isSummon && !e.summonExtension) {
						e.summonExtension = { summonRank: e.rank, minionPpBudget: e.rank * 15 };
					}
				}
				for (const a of p.alternateEffects ?? []) {
					for (const e of a.effects ?? []) {
						if (e.effectName?.toLowerCase() === 'summon') e.isSummon = true;
						e.calculatedCost = effectCost(e);
					}
				}
			}
		}
		}
	} catch {
		error = 'Invalid character data in share link.';
	}

	function getAttackBonus(): number { return 0; }
	function defensiveRollRanks(): number { return 0; }
</script>

{#if error}
<div class="error-wrap">
	<ComicPanel header="&#9888; Error" color="red">
		<p>{error}</p>
	</ComicPanel>
</div>
{:else if char}
<div class="comic-wrap">
	<SplashHeader title="Shared " highlight="Character" subtitle="Read-only view &middot; Mutants &amp; Masterminds" />

	<div class="panel-grid-3">
		<ComicPanel header="★ Identity" color="blue">
			<div class="field-row"><span class="field-label">Name</span><span class="field-val">{char.name}</span></div>
			<div class="field-row"><span class="field-label">Identity</span><span class="field-val">{char.identity}</span></div>
			<div class="field-row"><span class="field-label">Gender</span><span class="field-val">{char.gender || '—'}</span></div>
			<div class="field-row"><span class="field-label">Age</span><span class="field-val">{char.age || '—'}</span></div>
			<div class="field-row"><span class="field-label">Power Level</span><span class="field-val">{char.powerLevel}</span></div>
		</ComicPanel>

		<ComicPanel header="★ Power Points" color="dark">
			<div class="pp-display">
				<div class="pp-ring"><div class="pp-ring-inner"><div class="pp-num">{char.totalAllowed ?? 0}</div><div class="pp-lbl">Total</div></div></div>
				<div class="pp-ring used"><div class="pp-ring-inner"><div class="pp-num" style="color:var(--danger);">{char.totalSpent ?? 0}</div><div class="pp-lbl">Spent</div></div></div>
			</div>
			<div class="pp-bar-wrap">
				<div class="pp-bar-bg"><div class="pp-bar-fill" style="width: {char.totalAllowed ? (char.totalSpent / char.totalAllowed) * 100 : 0}%;"></div></div>
				<div class="pp-bar-text">{char.totalAllowed - char.totalSpent} PP Remaining</div>
			</div>
		</ComicPanel>

		<ComicPanel header="★ Conditions" color="red">
			<div class="cond-static">Fatigued &middot; Exhausted &middot; Dazed &middot; Stunned &middot; Incapacitated &middot; Vulnerable &middot; Defenseless &middot; Impaired &middot; Disabled &middot; Hindered</div>
		</ComicPanel>
	</div>

	<ComicPanel header="★ Abilities" color="blue">
		<div class="stat-row-8">
			<StatBubble value={char.abilities?.strengthFinalValue ?? 0} label="STR" color="danger" />
			<StatBubble value={char.abilities?.staminaFinalValue ?? 0} label="STA" color="default" />
			<StatBubble value={char.abilities?.agilityFinalValue ?? 0} label="AGL" color="default" />
			<StatBubble value={char.abilities?.dexterityFinalValue ?? 0} label="DEX" color="default" />
			<StatBubble value={char.abilities?.fightingFinalValue ?? 0} label="FGT" color="success" />
			<StatBubble value={char.abilities?.intellectFinalValue ?? 0} label="INT" color="secondary" />
			<StatBubble value={char.abilities?.awarenessFinalValue ?? 0} label="AWE" color="default" />
			<StatBubble value={char.abilities?.presenceFinalValue ?? 0} label="PRE" color="default" />
		</div>
	</ComicPanel>

	<div class="panel-grid">
		<ComicPanel header="★ Defenses" color="blue">
			{#if true}
			{@const dd = getDefenseFinal(char.abilities, char.defenses, 'dodge', 'agility')}
			{@const dp = getDefenseFinal(char.abilities, char.defenses, 'parry', 'fighting')}
			{@const df = getDefenseFinal(char.abilities, char.defenses, 'fortitude', 'stamina')}
			{@const dt = getToughnessFinal(char.abilities, char.defenses, char.advantages)}
			{@const dw = getDefenseFinal(char.abilities, char.defenses, 'will', 'awareness')}
			{@const pl = char?.powerLevel ?? 10}
			{@const cap = pl * 2}
			<div class="def-row"><span class="def-pill">Dodge</span><span class="input-box-demo">{dd.immune ? 'Immune' : dd.value}</span><span class="dc-badge">DC {dd.immune ? '—' : dd.value + 10}</span></div>
			<div class="def-row"><span class="def-pill">Parry</span><span class="input-box-demo">{dp.immune ? 'Immune' : dp.value}</span><span class="dc-badge">DC {dp.immune ? '—' : dp.value + 10}</span></div>
			<div class="def-row"><span class="def-pill green">Fortitude</span><span class="input-box-demo">{df.immune ? 'Immune' : df.value}</span><span class="dc-badge">DC {df.immune ? '—' : df.value + 10}</span></div>
			<div class="def-row"><span class="def-pill green">Toughness</span><span class="input-box-demo">{dt.immune ? 'Immune' : dt.value}</span><span class="dc-badge">DC {dt.immune ? '—' : dt.value + 10}</span></div>
			<div class="def-row"><span class="def-pill blue">Will</span><span class="input-box-demo">{dw.immune ? 'Immune' : dw.value}</span><span class="dc-badge">DC {dw.immune ? '—' : dw.value + 10}</span></div>
			<div class="pl-warnings">
				<span class:pl-ok={dd.value + dt.value <= cap} class:pl-violation={dd.value + dt.value > cap}>Dodge+Tough {dd.value + dt.value}/{cap}</span>
				<span class:pl-ok={dp.value + dt.value <= cap} class:pl-violation={dp.value + dt.value > cap}>Parry+Tough {dp.value + dt.value}/{cap}</span>
				<span class:pl-ok={df.value + dw.value <= cap} class:pl-violation={df.value + dw.value > cap}>Fort+Will {df.value + dw.value}/{cap}</span>
			</div>
			{/if}
		</ComicPanel>

		<ComicPanel header="★ Combat" color="red">
			<div class="field-row"><span class="field-label">Initiative</span><span class="field-val init-val">{getInitiative(char.abilities, char.advantages) >= 0 ? '+' : ''}{getInitiative(char.abilities, char.advantages)}</span></div>
		</ComicPanel>
	</div>

	<ComicPanel header="★ Skills" color="yellow">
		{#if char.skills?.length}
		<SkillTable skills={char.skills} />
		{:else}
		<div class="empty-state">No skills</div>
		{/if}
	</ComicPanel>

	<ComicPanel header="★ Advantages" color="dark">
		{#if char.advantages?.length}
		{#each char.advantages as adv}
		<div class="advantage-row"><span class="advantage-bullet">&#9656;</span><span class="advantage-name">{adv.name}{adv.ranks > 1 ? ' ' + adv.ranks : ''}</span>{#if adv.description}<span class="advantage-desc">&mdash; {adv.description}</span>{/if}</div>
		{/each}
		{:else}
		<div class="empty-state">No advantages</div>
		{/if}
	</ComicPanel>

	<ComicPanel header="★ Equipment" color="blue">
		<div class="ep-bar"><span class="ep-label">EP {char.equipmentPool?.epSpent ?? 0} / {char.equipmentPool?.totalEpAllowed ?? 0}</span></div>
		{#each char.equipmentPool?.items ?? [] as item}
		<div class="equipment-row"><span class="equipment-bullet">&#8226;</span><span class="equipment-name">{item.itemName}</span><span class="equipment-cost">{item.epCost} EP</span></div>
		{#if item.description}<div class="equipment-desc">{item.description}</div>{/if}
		{/each}
		<hr class="divider" />
			<div class="ep-bar" style="margin-top:6px;"><span class="ep-label">★ Headquarters</span></div>
		{#if char.headquarters?.length}
		{#each char.headquarters as hq}
		<div class="hq-row"><span class="hq-name">{hq.name}</span><span class="hq-cost">{hq.totalEpCost} EP</span>{#if hq.isSharedTeamBase}<span class="shared-badge">Team Base</span>{/if}</div>
		<div class="hq-detail">{hq.sizeCategory} &middot; Toughness {hq.toughnessValue}</div>
		{#if hq.description}<div class="hq-desc">{hq.description}</div>{/if}
		{#if hq.features?.length}<div class="hq-features">{#each hq.features as f}<span class="feature-badge">{f}</span>{/each}</div>{/if}
		{#if hq.defenseSystems?.length}<div class="def-systems"><span class="def-sys-header">Defense Systems:</span>{#each hq.defenseSystems as ds}<span class="def-sys-item">{ds.name} <span class="def-sys-cost">({ds.totalPowerCost} PP)</span></span>{/each}</div>{/if}
		{/each}
		{:else}
		<div class="empty-state">No headquarters</div>
		{/if}
	</ComicPanel>

	<ComicPanel header="★ Powers" color="blue">
		{#if char.powers?.length}
		{#each char.powers as power}
		<div class="power-row">
			<div class="power-header">
				<span class="power-name">{power.name}</span>
				{#if power.isArray}<span class="array-badge">ARRAY</span>{/if}
				<PillBadge text="{power.totalPowerCost} PP" color="primary" />
			</div>
			{#if power.description}<div class="power-desc-text">{power.description}</div>{/if}
			{#if power.descriptors?.length}<div class="power-desc">{power.descriptors.join(', ')}</div>{/if}
			{#each power.effects as effect}
			<div class="effect-line">
				<span class="effect-name">{effect.effectName}</span>
				{#if effect.isSummon}<span class="summon-badge">Summon</span>{/if}
				<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
				{#if effect.modifiers?.length}
				<div class="modifier-line">{#each effect.modifiers as mod}<span class="mod-badge" class:extra={mod.type==='EXTRA'} class:flaw={mod.type==='FLAW'}>{mod.name}{mod.isFlat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>{/each}</div>
				{/if}
				{#if effect.isSummon && effect.summonExtension}
				<div class="summon-block">
					<span class="summon-info">Summon Rank {effect.summonExtension.summonRank} &middot; {effect.summonExtension.minionPpBudget} PP Minion</span>
					{#if effect.summonExtension.minionStatBlock}
					{@const sb = effect.summonExtension.minionStatBlock}
					<div class="minion-statblock">
						<div class="minion-stat-name">{sb.name}</div>
						<div class="minion-stat-row"><span class="minion-stat-lbl">STR</span><span class="minion-stat-val">{sb.abilities.strengthFinalValue}</span><span class="minion-stat-lbl">STA</span><span class="minion-stat-val">{sb.abilities.staminaFinalValue}</span><span class="minion-stat-lbl">AGL</span><span class="minion-stat-val">{sb.abilities.agilityFinalValue}</span><span class="minion-stat-lbl">DEX</span><span class="minion-stat-val">{sb.abilities.dexterityFinalValue}</span><span class="minion-stat-lbl">FGT</span><span class="minion-stat-val">{sb.abilities.fightingFinalValue}</span><span class="minion-stat-lbl">INT</span><span class="minion-stat-val">{sb.abilities.intellectFinalValue}</span><span class="minion-stat-lbl">AWE</span><span class="minion-stat-val">{sb.abilities.awarenessFinalValue}</span><span class="minion-stat-lbl">PRE</span><span class="minion-stat-val">{sb.abilities.presenceFinalValue}</span></div>
						<div class="minion-stat-row"><span class="minion-stat-lbl">Dodge</span><span class="minion-stat-val">{sb.defenses.dodgeFinalValue}</span><span class="minion-stat-lbl">Parry</span><span class="minion-stat-val">{sb.defenses.parryFinalValue}</span><span class="minion-stat-lbl">Fort</span><span class="minion-stat-val">{sb.defenses.fortitudeFinalValue}</span><span class="minion-stat-lbl">Tough</span><span class="minion-stat-val">{sb.defenses.toughnessFinalValue}</span><span class="minion-stat-lbl">Will</span><span class="minion-stat-val">{sb.defenses.willFinalValue}</span></div>
						{#if sb.skills?.length}<div class="minion-stat-row"><span class="minion-stat-lbl">Skills</span><span class="minion-stat-skills">{sb.skills.map(s => s.skillName + (s.ranks ? ' ' + s.ranks : '')).join(', ')}</span></div>{/if}
						{#if sb.advantages?.length}<div class="minion-stat-row"><span class="minion-stat-lbl">Adv</span><span class="minion-stat-skills">{sb.advantages.map(a => a.name + (a.ranks > 1 ? ' ' + a.ranks : '')).join(', ')}</span></div>{/if}
						{#if sb.powers?.length}<div class="minion-stat-row"><span class="minion-stat-lbl">Powers</span><span class="minion-stat-skills">{sb.powers.map(p => p.name).join(', ')}</span></div>{/if}
					</div>
					{/if}
				</div>
				{/if}
			</div>
			{/each}
		</div>
		{/each}
		{:else}
		<div class="empty-state">No powers</div>
		{/if}
	</ComicPanel>

	<ComicPanel header="★ Notes &amp; Complications" color="yellow">
		{#if char.complications?.length}
		{#each char.complications as comp}
		<div class="complication-row"><div class="comp-badge">{comp.type}</div><div class="comp-text">{comp.description}</div></div>
		{/each}
		{:else}
		<div class="empty-state">No complications</div>
		{/if}
	</ComicPanel>

	<div class="signature-band" style="margin-top:16px;">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">★ SHARED CHARACTER SHEET &middot; POWER LEVEL {char.powerLevel} ★</span>
	</div>
</div>
{/if}

