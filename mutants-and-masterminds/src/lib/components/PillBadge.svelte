<script lang="ts">
	let {
		text = '',
		color = 'primary'
	}: {
		text?: string
		color?: 'primary' | 'danger'
	} = $props();

	let borderColor = $derived(() => color === 'danger' ? 'var(--danger)' : 'var(--primary)');
	let bgColor = $derived(() => color === 'danger' ? 'var(--danger)' : 'var(--primary)');
</script>

<span class="pill" style="border-color: {borderColor}; background: var(--panel-bg); color: {borderColor};">{text}</span>

