<script lang="ts">
	import StatBubble from '@ui/StatBubble.svelte';

	let { colors = ['default'] }: { colors?: string[] } = $props();
</script>

<h2>StatBubble</h2>
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
	{#each colors as color (color)}
		<StatBubble value={12} label={color} {color} />
	{/each}
	<StatBubble value={0} label="ABSENT" absent={true} />
</div>
