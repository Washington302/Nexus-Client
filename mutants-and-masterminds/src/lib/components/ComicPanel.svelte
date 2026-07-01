<script lang="ts">
	let {
		header = '',
		color = 'blue',
		children
	}: {
		header?: string
		color?: 'red' | 'yellow' | 'blue' | 'dark'
		children: import('svelte').Snippet
	} = $props();
</script>

<div class="panel-full">
	<div class="panel-header {color}">
		<div class="panel-header-dots" style="color: {color === 'yellow' ? '#8B6000' : 'white'};"></div>
		<div class="panel-label {color === 'yellow' || color === 'dark' ? 'light' : 'light'}">{header}</div>
	</div>
	<div class="panel-body">
		{@render children()}
	</div>
</div>

