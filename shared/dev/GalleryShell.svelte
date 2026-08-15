<script lang="ts">
	import type { Snippet } from 'svelte';

	// Dev-only chrome for the shared-component gallery. Apps compose the sections
	// they actually use — mounting a section for a component the app does not
	// otherwise import would make check-contract require that component's classes.
	let { children }: { children: Snippet } = $props();
</script>

{#if import.meta.env.DEV}
	<h1>Shared component gallery</h1>
	<p>
		Shared components in this app's theme. If something looks unstyled, this app is missing a class
		the component emits — run <code>npm run check:contract</code>.
	</p>
	{@render children()}
{/if}
