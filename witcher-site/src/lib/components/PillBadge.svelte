<script lang="ts">
	let {
		text = '',
		color = 'primary'
	}: {
		text?: string;
		color?: 'primary' | 'gold' | 'error';
	} = $props();

	const styles: Record<string, string> = {
		primary:
			'border-color: var(--primary); background: var(--surface-container-lowest); color: var(--primary);',
		gold: 'border-color: var(--secondary-container); background: var(--secondary-container); color: var(--on-secondary-container);',
		error:
			'border-color: var(--error); background: var(--error-container); color: var(--on-error-container);'
	};
</script>

<span class="pill" style={styles[color]}>{text}</span>
