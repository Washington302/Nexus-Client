<script lang="ts">
	let {
		title = '',
		highlight = '',
		subtitle = ''
	}: {
		title?: string
		highlight?: string
		subtitle?: string
	} = $props();
</script>

<div class="splash-header">
	<div class="dots-bg"></div>
	<div class="splash-eyebrow">★ Character Sheet ★</div>
	<div class="splash-title">{title}{#if highlight} <span>{highlight}</span>{/if}</div>
	<div class="splash-sub">{subtitle}</div>
</div>

