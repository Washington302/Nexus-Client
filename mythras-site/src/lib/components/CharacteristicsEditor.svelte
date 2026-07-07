<script lang="ts">
	import type { Characteristics } from '$lib/services/api';

	let { characteristics }: { characteristics: Characteristics } = $props();
</script>

<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">STR</div>
		<input class="input-demo input-num" type="number" bind:value={characteristics.str} />
	</div>
	<div class="field-group">
		<div class="field-hdr">CON</div>
		<input class="input-demo input-num" type="number" bind:value={characteristics.con} />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">SIZ</div>
		<input class="input-demo input-num" type="number" bind:value={characteristics.siz} />
	</div>
	<div class="field-group">
		<div class="field-hdr">DEX</div>
		<input class="input-demo input-num" type="number" bind:value={characteristics.dex} />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">INT</div>
		<input class="input-demo input-num" type="number" bind:value={characteristics.intelligence} />
	</div>
	<div class="field-group">
		<div class="field-hdr">POW</div>
		<input class="input-demo input-num" type="number" bind:value={characteristics.pow} />
	</div>
</div>
<div class="field-group">
	<div class="field-hdr">CHA</div>
	<input class="input-demo input-num" type="number" bind:value={characteristics.cha} />
</div>
