<script lang="ts">
	// The game is named here, at the bottom, as an attribution line — never as the
	// app's own name or a page header. Keep this wording in step with /legal, whose
	// disclaimers are quoted verbatim per WITCHER_CONTENT_POLICY.md.
	import SiteFooter from '@ui/SiteFooter.svelte';
</script>

<SiteFooter tagline="an unofficial, free character tool for use with The Witcher TTRPG.">
	{#snippet legal()}
		Scribe Sheets is unofficial content provided under the Homebrew Content Policy of R. Talsorian
		Games and is not approved or endorsed by RTG. Scribe Sheets is an unofficial fan work and is not
		approved or endorsed by CD PROJEKT RED. <a href="/legal">About &amp; Legal</a>
	{/snippet}
</SiteFooter>
