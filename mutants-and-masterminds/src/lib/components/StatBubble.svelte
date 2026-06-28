<script lang="ts">
	let {
		value = 0,
		label = '',
		color = 'default'
	}: {
		value: number
		label: string
		color?: 'danger' | 'success' | 'secondary' | 'default'
	} = $props();

	let numColor = $derived(() => {
		switch (color) {
			case 'danger': return 'var(--danger)';
			case 'success': return 'var(--success)';
			case 'secondary': return 'var(--secondary)';
			default: return 'var(--primary)';
		}
	});
</script>

<div class="stat-bubble">
	<div class="stat-num" style="color: {numColor()}">{value}</div>
	<div class="stat-lbl">{label}</div>
</div>

<style>
	.stat-bubble {
		border: 3px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		border-radius: 6px;
		text-align: center;
		padding: 6px 4px;
		background: var(--panel-bg);
	}
	.stat-num {
		font-family: 'Bangers', cursive;
		font-size: 28px;
		letter-spacing: 0.03em;
		line-height: 1;
	}
	.stat-lbl {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-top: 2px;
	}
</style>
