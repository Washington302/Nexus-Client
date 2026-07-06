<script lang="ts">
	let {
		value = 0,
		label = '',
		color = 'default',
		resource = false
	}: {
		value: number | string;
		label: string;
		color?: 'danger' | 'success' | 'secondary' | 'default';
		resource?: boolean;
	} = $props();

	const numColor = $derived.by(() => {
		switch (color) {
			case 'danger':
				return 'var(--error)';
			case 'success':
				return 'var(--on-tertiary-container)';
			case 'secondary':
				return 'var(--secondary)';
			default:
				return 'var(--primary)';
		}
	});
</script>

<div class="stat-bubble" class:resource>
	<div class="stat-num" style="color: {numColor}">{value}</div>
	<div class="stat-lbl">{label}</div>
</div>
