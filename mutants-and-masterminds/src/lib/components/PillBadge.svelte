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

<style>
	.pill {
		display: inline-block;
		border: 2.5px solid;
		border-radius: 20px;
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		padding: 2px 10px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin: 2px;
		box-shadow: 2px 2px 0 var(--border);
	}
</style>
