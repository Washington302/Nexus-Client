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

<style>
	.panel-full {
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
		overflow: hidden;
		position: relative;
	}

	.panel-header {
		padding: 8px 12px 7px;
		border-bottom: 3px solid var(--border);
		position: relative;
		overflow: hidden;
	}

	.panel-header-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
		background-size: 10px 10px;
		opacity: 0.18;
	}

	.panel-header.red { background: var(--danger); }
	.panel-header.yellow { background: var(--highlight); }
	.panel-header.blue { background: var(--primary); }
	.panel-header.dark { background: var(--border); }

	.panel-label {
		font-family: 'Bangers', cursive;
		font-size: 18px;
		letter-spacing: 0.05em;
		position: relative;
		z-index: 1;
		color: white;
		text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
	}

	.panel-header.yellow .panel-label {
		color: var(--ink);
		text-shadow: none;
	}

	.panel-header.dark .panel-label {
		color: var(--newsprint);
	}

	.panel-body {
		padding: 12px;
	}
</style>
