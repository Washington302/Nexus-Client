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

