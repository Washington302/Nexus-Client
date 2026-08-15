<script lang="ts">
	// The game is named here, at the bottom, as an attribution line — never as the
	// app's own name or a page header. The disclaimer is verbatim per the Legal &
	// Licensing Reference Guide; keep it in step with /legal.
	import SiteFooter from '@ui/SiteFooter.svelte';
</script>

<SiteFooter tagline="an unofficial character tool for Godbound.">
	{#snippet legal()}
		Scribe Sheets is an independent fan creation and is not affiliated with Sine Nomine Publishing.
		Godbound is Copyright &copy; 2016 Sine Nomine Publishing and Kevin Crawford.
		<a href="/legal">About &amp; Legal</a>
	{/snippet}
</SiteFooter>
