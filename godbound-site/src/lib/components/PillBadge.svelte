<script lang="ts">
	let {
		text = '',
		color = 'primary'
	}: {
		text?: string
		color?: 'primary' | 'danger'
	} = $props();

	const badgeColor = $derived(color === 'danger' ? 'var(--destructive)' : 'var(--gold)');
</script>

<span class="pill" style="border-color: {badgeColor}; background: var(--surface-elevated); color: {badgeColor};">{text}</span>
