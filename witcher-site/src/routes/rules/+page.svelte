<script lang="ts">
	import RulesReference from '@ui/RulesReference.svelte';
	import { rulesReference } from '$lib/data/rulesReference';
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">Rules Reference</h1>
		<p class="list-subtitle">A quick reference for {rulesReference.system}</p>
	</div>

	<RulesReference doc={rulesReference} />

	<p class="legal-body" style="margin-top:24px;">
		A summary of game mechanics for play at the table — not a substitute for the rulebook. See
		<a href="/legal">About &amp; Legal</a> for attribution and licensing.
	</p>

	<a href="/dashboard" class="back-link" style="margin-top:16px;">&larr; Back to Dashboard</a>
</div>
