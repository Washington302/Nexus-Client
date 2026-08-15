<script lang="ts">
	import PillBadge from '@ui/PillBadge.svelte';

	let { colors = ['primary'] }: { colors?: string[] } = $props();
</script>

<h2>PillBadge</h2>
<p>Each variant must resolve to a distinct, readable colour.</p>
<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
	{#each colors as color (color)}
		<PillBadge text={color} {color} />
	{/each}
</div>
