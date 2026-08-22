<script lang="ts">
	// The $lib SplashHeader wrapper hard-codes the "★ Character Sheet ★" eyebrow,
	// which is wrong here — so this page uses the shared one directly.
	import SplashHeader from '@ui/SplashHeader.svelte';
	import RulesReference from '@ui/RulesReference.svelte';
	import { rulesReference } from '$lib/data/rulesReference';
</script>

<div class="comic-wrap">
	<SplashHeader
		eyebrow="★ Rules Reference ★"
		title="Rules"
		highlight="Reference"
		subtitle="A quick reference for {rulesReference.system}"
	/>

	<div style="margin-top:16px;">
		<RulesReference doc={rulesReference} />
	</div>

	<p class="legal-body" style="margin-top:24px;">
		A summary of game mechanics for play at the table — not a substitute for the rulebook. See
		<a href="/legal">About &amp; Legal</a> for attribution and licensing.
	</p>

	<a href="/dashboard" class="back-link" style="margin-top:16px;">&larr; Back to Dashboard</a>
</div>
