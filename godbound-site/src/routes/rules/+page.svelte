<script lang="ts">
	import SplashHeader from '@ui/SplashHeader.svelte';
	import RulesReference from '@ui/RulesReference.svelte';
	import { rulesReference } from '$lib/data/rulesReference';
</script>

<div class="page">
	<SplashHeader
		title="Rules"
		highlight="Reference"
		subtitle="A quick reference for {rulesReference.system}"
	/>

	<RulesReference doc={rulesReference} />

	<p class="legal-body" style="margin-top:24px;">
		A summary of game mechanics for play at the table — not a substitute for the rulebook. See
		<a href="/legal">About &amp; Legal</a> for attribution and licensing.
	</p>

	<a href="/characters" class="back-link" style="margin-top:16px;">&larr; Back to Characters</a>
</div>
