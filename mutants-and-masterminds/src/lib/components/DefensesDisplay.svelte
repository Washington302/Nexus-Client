<script lang="ts">
	let { draft, getDefenseFinal, getToughnessFinal, defOtherMods, activeDefensePowerMods, toggleDefensePowerMod, plCaps }:
		{ draft: any; getDefenseFinal: (key: string, abi: string) => { value: number; immune: boolean }; getToughnessFinal: () => { value: number; immune: boolean }; defOtherMods: (key: string) => number; activeDefensePowerMods: Set<string>; toggleDefensePowerMod: (key: string) => void; plCaps: { dodgeTough: number; parryTough: number; fortWill: number; cap: number; dodgeToughOk: boolean; parryToughOk: boolean; fortWillOk: boolean; attackViolations: Array<{ name: string; bonus: number; rank: number; combined: number }> } } = $props();

	let dd2 = $derived(getDefenseFinal('dodge', 'agility'));
	let dp2 = $derived(getDefenseFinal('parry', 'fighting'));
	let df2 = $derived(getDefenseFinal('fortitude', 'stamina'));
	let dt2 = $derived(getToughnessFinal());
	let dw2 = $derived(getDefenseFinal('will', 'awareness'));
</script>

<div class="def-row">
	<button class="pwr-check" disabled={defOtherMods('dodge') === 0} class:checked={defOtherMods('dodge') !== 0 && activeDefensePowerMods.has('dodge')} onclick={() => toggleDefensePowerMod('dodge')}>{defOtherMods('dodge') !== 0 && activeDefensePowerMods.has('dodge') ? '\u2713' : ''}</button>
	<span class="def-pill">Dodge</span>
	<span class="input-box-demo">{dd2.immune ? 'Immune' : dd2.value}</span>
	<span class="dc-badge">DC {dd2.immune ? '\u2014' : dd2.value + 10}</span>
</div>
<div class="def-row">
	<button class="pwr-check" disabled={defOtherMods('parry') === 0} class:checked={defOtherMods('parry') !== 0 && activeDefensePowerMods.has('parry')} onclick={() => toggleDefensePowerMod('parry')}>{defOtherMods('parry') !== 0 && activeDefensePowerMods.has('parry') ? '\u2713' : ''}</button>
	<span class="def-pill">Parry</span>
	<span class="input-box-demo">{dp2.immune ? 'Immune' : dp2.value}</span>
	<span class="dc-badge">DC {dp2.immune ? '\u2014' : dp2.value + 10}</span>
</div>
<div class="def-row">
	<button class="pwr-check" disabled={defOtherMods('fortitude') === 0} class:checked={defOtherMods('fortitude') !== 0 && activeDefensePowerMods.has('fortitude')} onclick={() => toggleDefensePowerMod('fortitude')}>{defOtherMods('fortitude') !== 0 && activeDefensePowerMods.has('fortitude') ? '\u2713' : ''}</button>
	<span class="def-pill green">Fortitude</span>
	<span class="input-box-demo">{df2.immune ? 'Immune' : df2.value}</span>
	<span class="dc-badge">DC {df2.immune ? '\u2014' : df2.value + 10}</span>
</div>
<div class="def-row">
	<button class="pwr-check" disabled={defOtherMods('toughness') === 0} class:checked={defOtherMods('toughness') !== 0 && activeDefensePowerMods.has('toughness')} onclick={() => toggleDefensePowerMod('toughness')}>{defOtherMods('toughness') !== 0 && activeDefensePowerMods.has('toughness') ? '\u2713' : ''}</button>
	<span class="def-pill">Toughness</span>
	<span class="input-box-demo">{dt2.immune ? 'Immune' : dt2.value}</span>
	<span class="dc-badge">DC {dt2.immune ? '\u2014' : dt2.value + 10}</span>
</div>
<div class="def-row">
	<button class="pwr-check" disabled={defOtherMods('will') === 0} class:checked={defOtherMods('will') !== 0 && activeDefensePowerMods.has('will')} onclick={() => toggleDefensePowerMod('will')}>{defOtherMods('will') !== 0 && activeDefensePowerMods.has('will') ? '\u2713' : ''}</button>
	<span class="def-pill blue">Will</span>
	<span class="input-box-demo">{dw2.immune ? 'Immune' : dw2.value}</span>
	<span class="dc-badge">DC {dw2.immune ? '\u2014' : dw2.value + 10}</span>
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
{#if plCaps.attackViolations.length > 0}
	<div class="pl-attack-warnings">
		<span class="pl-attack-hdr">PL Attack Cap Violations (Atk+Rank &le; {plCaps.cap})</span>
		{#each plCaps.attackViolations as v}
			<div class="pl-attack-item">
				{v.name}: {v.bonus} + {v.rank} = {v.combined} &gt; {plCaps.cap}
			</div>
		{/each}
	</div>
{/if}

