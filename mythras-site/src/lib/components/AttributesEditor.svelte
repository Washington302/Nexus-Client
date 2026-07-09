<script lang="ts">
	import type { Attributes, Characteristics } from '$lib/services/api';
	import { computeActionPoints, computeLuckPoints } from '$lib/utils/character';

	let { attributes, characteristics }: { attributes: Attributes; characteristics: Characteristics } =
		$props();

	const baseActionPoints = $derived(computeActionPoints(characteristics.intelligence, characteristics.dex));
	const baseLuckPoints = $derived(computeLuckPoints(characteristics.pow));
</script>

<p style="font-family:var(--font-body);font-size:12px;color:var(--on-surface-variant);margin-bottom:8px;">
	Damage Modifier, Healing Rate, Strike Rank, and Experience Modifier are derived from
	Characteristics and update automatically. Set the max for each pool here; spend and restore
	the current value directly on the sheet during play.
</p>
<div class="field-group">
	<div class="field-hdr">Action Points Max <span style="opacity:0.6;">(base {baseActionPoints})</span></div>
	<input class="input-demo input-num" type="number" bind:value={attributes.actionPoints.max} />
</div>
<div class="field-group">
	<div class="field-hdr">Luck Points Max <span style="opacity:0.6;">(base {baseLuckPoints})</span></div>
	<input class="input-demo input-num" type="number" bind:value={attributes.luckPoints.max} />
</div>
<div class="field-group">
	<div class="field-hdr">Magic Points Max <span style="opacity:0.6;">(base {characteristics.pow})</span></div>
	<input class="input-demo input-num" type="number" bind:value={attributes.magicPoints.max} />
</div>
<div class="field-group">
	<div class="field-hdr">Movement Rate (m)</div>
	<input class="input-demo input-num" type="number" bind:value={attributes.movementRate} />
</div>
