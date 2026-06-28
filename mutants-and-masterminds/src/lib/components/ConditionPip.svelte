<script lang="ts">
	let {
		label = '',
		color = 'gray'
	}: {
		label?: string
		color?: 'gray' | 'yellow' | 'red' | 'black'
	} = $props();
</script>

<div class="condition-row">
	<div class="condition-pip {color}"></div>
	{label}
</div>

<style>
	.condition-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 0;
		border-bottom: 1.5px dashed var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--ink);
	}
	.condition-pip {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid var(--border);
		flex-shrink: 0;
	}
	.condition-pip.red { background: var(--danger); }
	.condition-pip.yellow { background: var(--highlight); }
	.condition-pip.gray { background: var(--accent); }
	.condition-pip.black { background: var(--border); }
</style>
