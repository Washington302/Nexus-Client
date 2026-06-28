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
	<div class="splash-eyebrow">&#9733; Character Sheet &#9733;</div>
	<div class="splash-title">{title}{#if highlight} <span>{highlight}</span>{/if}</div>
	<div class="splash-sub">{subtitle}</div>
</div>

<style>
	.splash-header {
		background: var(--primary);
		border: 4px solid var(--border);
		position: relative;
		overflow: hidden;
		padding: 24px 20px 20px;
		margin-bottom: 16px;
		box-shadow: 6px 6px 0 var(--border);
	}

	.dots-bg {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, var(--highlight) 1.5px, transparent 1.5px);
		background-size: 14px 14px;
		opacity: 0.18;
	}

	.splash-eyebrow {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--accent);
		text-transform: uppercase;
		position: relative;
		z-index: 1;
		margin-bottom: 6px;
	}

	.splash-title {
		font-family: 'Bangers', cursive;
		font-size: 48px;
		letter-spacing: 0.03em;
		color: var(--panel-bg);
		line-height: 1;
		position: relative;
		z-index: 1;
		text-shadow: 3px 3px 0 var(--ink);
	}

	.splash-title span {
		color: var(--accent);
		text-shadow: 3px 3px 0 #8B6000, 6px 6px 0 var(--ink);
	}

	.splash-sub {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--panel-bg);
		opacity: 0.75;
		position: relative;
		z-index: 1;
		margin-top: 6px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
</style>
