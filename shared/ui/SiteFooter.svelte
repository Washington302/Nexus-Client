<script lang="ts">
	import type { Snippet } from 'svelte';

	// Structure only. The attribution wording is publisher-mandated and differs
	// per game, so each app supplies it from its own SiteFooter wrapper — `legal`
	// is a snippet rather than a string because every notice contains a link and
	// escaped entities that must survive verbatim.
	let { tagline, legal }: { tagline: string; legal: Snippet } = $props();
</script>

<footer class="site-footer">
	<p>
		<span class="site-footer-brand">Scribe Sheets</span> &middot; {tagline}
	</p>
	<p>{@render legal()}</p>
</footer>
