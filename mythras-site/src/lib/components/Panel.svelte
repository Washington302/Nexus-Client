<script lang="ts">
	let {
		header = '',
		color = 'primary',
		children
	}: {
		header?: string;
		color?: 'primary' | 'gold' | 'teal' | 'plain';
		children: import('svelte').Snippet;
	} = $props();

	const colorClass: Record<string, string> = {
		primary: '',
		gold: 'gold',
		teal: 'teal',
		plain: 'plain'
	};
</script>

<div class="panel-full">
	<div class="panel-header {colorClass[color]}">
		<span class="panel-label">{header}</span>
	</div>
	<div class="panel-body">
		{@render children()}
	</div>
</div>
