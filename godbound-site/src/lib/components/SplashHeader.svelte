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
	<div class="splash-title">{title}{#if highlight}&nbsp;<span>{highlight}</span>{/if}</div>
	<div class="splash-sub">{subtitle}</div>
</div>
