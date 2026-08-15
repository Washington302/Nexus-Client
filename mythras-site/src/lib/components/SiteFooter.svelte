<script lang="ts">
	// The game is named here, at the bottom, as an attribution line — never as the
	// app's own name or a page header. The full ORC Notice & Attribution lives at
	// /legal and must stay verbatim there.
	import SiteFooter from '@ui/SiteFooter.svelte';
</script>

<SiteFooter tagline="an unofficial character tool for Mythras.">
	{#snippet legal()}
		Based on Mythras Imperative, published by The Design Mechanism, Copyright 2023. Licensed under
		the ORC License. Mythras and all associated trademarks are the property of their respective
		owners. <a href="/legal">Full notice &amp; attribution</a>
	{/snippet}
</SiteFooter>
