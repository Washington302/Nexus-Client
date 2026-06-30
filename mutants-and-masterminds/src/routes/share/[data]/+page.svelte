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
		<ComicPanel header="&#9733; Identity" color="blue">
			<div class="field-row"><span class="field-label">Name</span><span class="field-val">{char.name}</span></div>
			<div class="field-row"><span class="field-label">Identity</span><span class="field-val">{char.identity}</span></div>
			<div class="field-row"><span class="field-label">Gender</span><span class="field-val">{char.gender || '—'}</span></div>
			<div class="field-row"><span class="field-label">Age</span><span class="field-val">{char.age || '—'}</span></div>
			<div class="field-row"><span class="field-label">Power Level</span><span class="field-val">{char.powerLevel}</span></div>
		</ComicPanel>

		<ComicPanel header="&#9733; Power Points" color="dark">
			<div class="pp-display">
				<div class="pp-ring"><div class="pp-ring-inner"><div class="pp-num">{char.totalAllowed ?? 0}</div><div class="pp-lbl">Total</div></div></div>
				<div class="pp-ring used"><div class="pp-ring-inner"><div class="pp-num" style="color:var(--danger);">{char.totalSpent ?? 0}</div><div class="pp-lbl">Spent</div></div></div>
			</div>
			<div class="pp-bar-wrap">
				<div class="pp-bar-bg"><div class="pp-bar-fill" style="width: {char.totalAllowed ? (char.totalSpent / char.totalAllowed) * 100 : 0}%;"></div></div>
				<div class="pp-bar-text">{char.totalAllowed - char.totalSpent} PP Remaining</div>
			</div>
		</ComicPanel>

		<ComicPanel header="&#9733; Conditions" color="red">
			<div class="cond-static">Fatigued &middot; Exhausted &middot; Dazed &middot; Stunned &middot; Incapacitated &middot; Vulnerable &middot; Defenseless &middot; Impaired &middot; Disabled &middot; Hindered</div>
		</ComicPanel>
	</div>

	<ComicPanel header="&#9733; Abilities" color="blue">
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
		<ComicPanel header="&#9733; Defenses" color="blue">
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

		<ComicPanel header="&#9733; Combat" color="red">
			<div class="field-row"><span class="field-label">Initiative</span><span class="field-val init-val">{getInitiative(char.abilities, char.advantages) >= 0 ? '+' : ''}{getInitiative(char.abilities, char.advantages)}</span></div>
		</ComicPanel>
	</div>

	<ComicPanel header="&#9733; Skills" color="yellow">
		{#if char.skills?.length}
		<SkillTable skills={char.skills} />
		{:else}
		<div class="empty-state">No skills</div>
		{/if}
	</ComicPanel>

	<ComicPanel header="&#9733; Advantages" color="dark">
		{#if char.advantages?.length}
		{#each char.advantages as adv}
		<div class="advantage-row"><span class="advantage-bullet">&#9656;</span><span class="advantage-name">{adv.name}{adv.ranks > 1 ? ' ' + adv.ranks : ''}</span>{#if adv.description}<span class="advantage-desc">&mdash; {adv.description}</span>{/if}</div>
		{/each}
		{:else}
		<div class="empty-state">No advantages</div>
		{/if}
	</ComicPanel>

	<ComicPanel header="&#9733; Equipment" color="blue">
		<div class="ep-bar"><span class="ep-label">EP {char.equipmentPool?.epSpent ?? 0} / {char.equipmentPool?.totalEpAllowed ?? 0}</span></div>
		{#each char.equipmentPool?.items ?? [] as item}
		<div class="equipment-row"><span class="equipment-bullet">&#8226;</span><span class="equipment-name">{item.itemName}</span><span class="equipment-cost">{item.epCost} EP</span></div>
		{#if item.description}<div class="equipment-desc">{item.description}</div>{/if}
		{/each}
		<hr class="divider" />
		<div class="ep-bar" style="margin-top:6px;"><span class="ep-label">&#9733; Headquarters</span></div>
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

	<ComicPanel header="&#9733; Powers" color="blue">
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

	<ComicPanel header="&#9733; Notes &amp; Complications" color="yellow">
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
		<span style="position:relative;z-index:1;">&#9733; SHARED CHARACTER SHEET &middot; POWER LEVEL {char.powerLevel} &#9733;</span>
	</div>
</div>
{/if}

<style>
	.comic-wrap { font-family:'Nunito',sans-serif; background:var(--newsprint); padding:20px; width:100%; max-width: 90vw; }
	.error-wrap { padding:40px; text-align:center; }
	.panel-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
	.panel-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
	.field-row { display:flex; gap:8px; margin-bottom:6px; }
	.field-label { font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.08em; min-width:70px; }
	.field-val { font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); font-weight:600; }
	.stat-row-8 { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
	.def-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
	.def-pill { display:inline-block; border:2.5px solid var(--danger); background:var(--panel-bg); border-radius:20px; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--danger); padding:2px 10px; box-shadow:2px 2px 0 var(--border); }
	.input-box-demo { border:3px solid var(--border); box-shadow:2px 2px 0 var(--border); font-family:'Bangers',cursive; font-size:24px; text-align:center; width:44px; height:44px; color:var(--primary); background:var(--panel-bg); display:inline-flex; align-items:center; justify-content:center; }
	.dc-badge { font-family:'Oswald',sans-serif; font-size:13px; font-weight:700; color:var(--ink); background:color-mix(in srgb, var(--ink) 8%, transparent); padding:2px 8px; border-radius:4px; margin-left:4px; white-space:nowrap; }
	.pl-warnings { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; font-family:'Oswald',sans-serif; font-size:12px; font-weight:600; }
	.pl-ok { color:var(--success); }
	.pl-violation { color:var(--danger); }
	.pp-display { display:flex; gap:12px; justify-content:center; margin-bottom:10px; }
	.pp-ring { width:80px; height:80px; border:3px solid var(--highlight); box-shadow:3px 3px 0 var(--border); border-radius:50%; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--highlight) 10%, transparent); }
	.pp-ring.used { border-color:var(--danger); }
	.pp-ring-inner { text-align:center; }
	.pp-num { font-family:'Bangers',cursive; font-size:26px; color:var(--accent); line-height:1; }
	.pp-ring.used .pp-num { color:var(--danger); }
	.pp-lbl { font-family:'Oswald',sans-serif; font-size:7px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.12em; }
	.pp-bar-wrap { padding:0 4px; }
	.pp-bar-bg { width:100%; height:12px; background:#333; border:2px solid var(--border); overflow:hidden; }
	.pp-bar-fill { height:100%; background:linear-gradient(90deg,var(--danger),var(--highlight),var(--success)); transition:width .3s ease; }
	.pp-bar-text { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; text-align:center; margin-top:4px; }
	.advantage-row { display:flex; align-items:flex-start; gap:8px; padding:4px 0; border-bottom:1.5px dashed var(--border); }
	.advantage-bullet { font-family:'Bangers',cursive; font-size:12px; color:var(--danger); flex-shrink:0; }
	.advantage-name { font-family:'Nunito',sans-serif; font-size:12px; font-weight:600; color:var(--ink); flex-shrink:0; }
	.advantage-desc { font-family:'Nunito',sans-serif; font-size:11px; color:var(--accent); }
	.equipment-row { display:flex; align-items:center; gap:8px; padding:4px 0; border-bottom:1.5px dashed var(--border); }
	.equipment-bullet { font-family:'Bangers',cursive; font-size:12px; color:var(--primary); }
	.equipment-name { font-family:'Nunito',sans-serif; font-size:12px; font-weight:600; color:var(--ink); flex:1; }
	.equipment-cost { font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--accent); }
	.equipment-desc { font-family:'Nunito',sans-serif; font-size:11px; color:var(--accent); margin:-2px 0 4px 18px; }
	.ep-bar { display:flex; align-items:center; gap:8px; margin-bottom:6px; padding:4px 8px; background:color-mix(in srgb, var(--primary) 12%, transparent); border:1.5px solid var(--primary); }
	.ep-label { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; }
	.hq-name { font-family:'Bangers',cursive; font-size:11px; color:var(--accent); }
	.hq-cost { font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--accent); margin-left:4px; }
	.hq-detail { font-family:'Oswald',sans-serif; font-size:12px; color:var(--accent); margin-bottom:2px; }
	.hq-desc { font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); margin-bottom:4px; padding:4px 8px; background:color-mix(in srgb, var(--panel-bg) 60%, transparent); border-left:3px solid var(--primary); }
	.hq-features { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px; }
	.feature-badge { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--primary); background:color-mix(in srgb, var(--primary) 15%, transparent); border:1.5px solid var(--primary); padding:1px 6px; }
	.shared-badge { font-family:'Oswald',sans-serif; font-size:8px; font-weight:700; color:white; background:var(--success); padding:1px 5px; margin-left:4px; }
	.def-systems { margin-bottom:4px; }
	.def-sys-header { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:2px; }
	.def-sys-item { font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); display:block; padding:1px 0 1px 8px; border-left:2px solid var(--danger); margin-bottom:1px; }
	.def-sys-cost { font-family:'Oswald',sans-serif; font-size:11px; color:var(--accent); }
	.power-row { padding:8px 0; border-bottom:1.5px dashed var(--border); }
	.power-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:2px; }
	.power-name { font-family:'Bangers',cursive; font-size:12px; color:var(--accent); }
	.power-desc-text { font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); line-height:1.45; margin:4px 0 2px; padding:4px 8px; background:color-mix(in srgb, var(--panel-bg) 60%, transparent); border-left:3px solid var(--primary); }
	.power-desc { font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); opacity:.75; }
	.array-badge { font-family:'Oswald',sans-serif; font-size:8px; font-weight:700; color:white; background:var(--danger); padding:1px 5px; margin-left:6px; }
	.effect-line { margin:4px 0 2px 8px; padding-left:8px; border-left:2px solid var(--border); }
	.effect-name { font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; color:var(--ink); }
	.summon-badge { display:inline-block; font-family:'Oswald',sans-serif; font-size:8px; font-weight:700; color:white; background:var(--secondary); padding:1px 5px; margin-left:4px; text-transform:uppercase; letter-spacing:0.05em; vertical-align:middle; }
	.summon-block { margin:3px 0 2px 0; padding:3px 6px; background:color-mix(in srgb, var(--secondary) 10%, transparent); border-left:2px solid var(--secondary); }
	.summon-info { font-family:'Oswald',sans-serif; font-size:10px; font-weight:700; color:var(--secondary); text-transform:uppercase; letter-spacing:0.05em; }
	.minion-name { font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); margin-top:1px; }
	.effect-detail { font-family:'Oswald',sans-serif; font-size:12px; color:var(--accent); margin-left:6px; }
	.modifier-line { display:flex; flex-wrap:wrap; gap:3px; margin-top:2px; }
	.mod-badge { font-family:'Oswald',sans-serif; font-size:8px; font-weight:700; padding:1px 5px; display:inline-block; }
	.mod-badge.extra { background:color-mix(in srgb, var(--primary) 25%, transparent); color:var(--primary); border:1px solid var(--primary); }
	.mod-badge.flaw { background:color-mix(in srgb, var(--danger) 25%, transparent); color:var(--danger); border:1px solid var(--danger); }
	.complication-row { display:flex; gap:10px; padding:6px 0; border-bottom:1.5px dashed var(--border); align-items:flex-start; }
	.comp-badge { flex-shrink:0; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--primary); background:var(--panel-bg); border:2px solid var(--primary); padding:2px 8px; text-transform:uppercase; }
	.comp-text { font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); line-height:1.4; }
	.minion-statblock { margin-top:3px; padding:4px; background:color-mix(in srgb, var(--panel-bg) 60%, transparent); border:1.5px solid var(--border); }
	.minion-stat-name { font-family:'Bangers',cursive; font-size:12px; color:var(--accent); margin-bottom:2px; }
	.minion-stat-row { display:flex; flex-wrap:wrap; gap:2px 6px; margin-bottom:1px; font-family:'Oswald',sans-serif; font-size:12px; }
	.minion-stat-lbl { font-weight:700; color:var(--ink); opacity:.7; }
	.minion-stat-val { font-weight:700; color:var(--ink); margin-right:6px; }
	.minion-stat-skills { font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); }
	.empty-state { font-family:'Oswald',sans-serif; font-size:11px; color:var(--accent); text-align:center; padding:8px; }
	.signature-band { background:var(--border); color:var(--accent); font-family:'Bangers',cursive; font-size:11px; letter-spacing:.15em; text-align:center; padding:5px; position:relative; overflow:hidden; }
	.sig-dots { position:absolute; inset:0; background-image:radial-gradient(circle,var(--highlight) 1px,transparent 1px); background-size:10px 10px; opacity:.15; }
	.cond-static { font-family:'Nunito',sans-serif; font-size:12px; color:var(--accent); line-height:1.6; }
	.init-val { font-family:'Bangers',cursive; font-size:20px; color:var(--success); }
</style>
