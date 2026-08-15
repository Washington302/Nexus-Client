<script lang="ts">
	// `eyebrow` is the small line above the title — m&m sets "★ Character Sheet ★",
	// godbound leaves it empty. Both apps already define .splash-eyebrow.
	let {
		title = '',
		highlight = '',
		subtitle = '',
		eyebrow = ''
	}: {
		title?: string;
		highlight?: string;
		subtitle?: string;
		eyebrow?: string;
	} = $props();
</script>

<div class="splash-header">
	{#if eyebrow}
		<div class="splash-eyebrow">{eyebrow}</div>
	{/if}
	<div class="splash-title">
		{title}{#if highlight}&nbsp;<span>{highlight}</span>{/if}
	</div>
	<div class="splash-sub">{subtitle}</div>
</div>
