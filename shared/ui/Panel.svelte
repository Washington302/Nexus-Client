<script lang="ts">
	import type { Snippet } from 'svelte';

	// `color` is emitted verbatim as a second class on .panel-header, so each app
	// keeps its own vocabulary — mythras/witcher use gold|teal|plain, m&m uses
	// red|yellow|blue|dark — and no app has to rename a CSS rule. A value with no
	// matching rule (mythras/witcher's `primary`, which IS the base .panel-header
	// style) simply matches nothing, which is why it stays the default.
	let {
		header = '',
		color = 'primary',
		children
	}: {
		header?: string;
		color?: string;
		children: Snippet;
	} = $props();
</script>

<div class="panel-full">
	<div class="panel-header {color}">
		<span class="panel-label">{header}</span>
	</div>
	<div class="panel-body">
		{@render children()}
	</div>
</div>
