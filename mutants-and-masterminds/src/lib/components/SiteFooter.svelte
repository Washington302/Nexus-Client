<script lang="ts">
	// The game is named here, at the bottom, as an attribution line — never as the
	// app's own name or a page header. The OGL notice is verbatim; the full license
	// and the §15 COPYRIGHT NOTICE live at /legal and must stay reachable.
	import SiteFooter from '@ui/SiteFooter.svelte';
</script>

<SiteFooter tagline="an unofficial character tool for Mutants &amp; Masterminds.">
	{#snippet legal()}
		Scribe Sheets uses Open Game Content under the Open Game License v1.0a. Mutants &amp; Masterminds
		and its associated logos are trademarks of Green Ronin Publishing.
		<a href="/legal">Open Game License &amp; Legal</a>
	{/snippet}
</SiteFooter>
