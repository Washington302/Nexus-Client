<script lang="ts">
	import type { Attributes, Characteristics } from '$lib/services/api';
	import { computeActionPoints, computeLuckPoints, computeMagicPointsMax } from '$lib/utils/character';

	let { attributes, characteristics }: { attributes: Attributes; characteristics: Characteristics } =
		$props();

	const baseActionPoints = $derived(computeActionPoints(characteristics.intelligence, characteristics.dex));
	const baseLuckPoints = $derived(computeLuckPoints(characteristics.pow));
	const baseMagicPoints = $derived(computeMagicPointsMax(characteristics.pow));
</script>

<p style="font-family:var(--font-body);font-size:12px;color:var(--on-surface-variant);margin-bottom:8px;">
	Damage Modifier, Healing Rate, Strike Rank, and Experience Modifier are derived from
	Characteristics and update automatically. Action/Luck/Magic Points max also follow
	Characteristics unless you enable Manual Override for a pool granted outside the formula
	(e.g. by a Gift). Current value is spent and restored directly on the sheet during play.
</p>
<div class="field-group">
	<div class="field-hdr">Action Points Max <span style="opacity:0.6;">(base {baseActionPoints})</span></div>
	<input
		class="input-demo input-num"
		type="number"
		bind:value={attributes.actionPoints.max}
		disabled={!attributes.actionPoints.manualOverride}
	/>
	<label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-top:4px;">
		<input type="checkbox" bind:checked={attributes.actionPoints.manualOverride} /> Manual override
	</label>
</div>
<div class="field-group">
	<div class="field-hdr">Luck Points Max <span style="opacity:0.6;">(base {baseLuckPoints})</span></div>
	<input
		class="input-demo input-num"
		type="number"
		bind:value={attributes.luckPoints.max}
		disabled={!attributes.luckPoints.manualOverride}
	/>
	<label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-top:4px;">
		<input type="checkbox" bind:checked={attributes.luckPoints.manualOverride} /> Manual override
	</label>
</div>
<div class="field-group">
	<div class="field-hdr">Magic Points Max <span style="opacity:0.6;">(base {baseMagicPoints})</span></div>
	<input
		class="input-demo input-num"
		type="number"
		bind:value={attributes.magicPoints.max}
		disabled={!attributes.magicPoints.manualOverride}
	/>
	<label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-top:4px;">
		<input type="checkbox" bind:checked={attributes.magicPoints.manualOverride} /> Manual override
	</label>
</div>
<div class="field-group">
	<div class="field-hdr">Movement Rate (m)</div>
	<input class="input-demo input-num" type="number" bind:value={attributes.movementRate} />
</div>
