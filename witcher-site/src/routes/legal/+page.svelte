<script lang="ts">
	import Panel from '@ui/Panel.svelte';

	// Both disclaimers must appear verbatim on a clearly reachable About/Legal screen.
	// Do not reword them — they are quoted exactly as RTG and CDPR require, per the
	// Legal & Licensing Reference Guide. That guide supersedes the older CDPR wording
	// still recorded in WITCHER_CONTENT_POLICY.md ("This is an unofficial fan work…").
	const APP_NAME = 'Scribe Sheets';
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">{APP_NAME}</h1>
		<p class="list-subtitle">A character tool for The Witcher TTRPG</p>
	</div>

	<div style="display:flex; flex-direction:column; gap: var(--stack-md); width:100%;">
		<Panel header="About" color="primary">
			<p class="legal-body">
				{APP_NAME} is a free, unofficial digital character sheet. It stores the characters you create
				and the content you write yourself. It ships no rulebook text, no bestiary or NPC stat blocks,
				and no official artwork — you'll need the published rulebook to play.
			</p>
			<p class="legal-body">
				It is free to use, with no fees, subscriptions, or paywalled features.
			</p>
		</Panel>

		<Panel header="Disclaimers" color="gold">
			<blockquote class="legal-quote">
				{APP_NAME} is unofficial content provided under the Homebrew Content Policy of R. Talsorian Games
				and is not approved or endorsed by RTG. This content references materials that are the property
				of R. Talsorian Games and its licensees.
			</blockquote>

			<blockquote class="legal-quote">
				{APP_NAME} is an unofficial fan work and is not approved or endorsed by CD PROJEKT RED.
			</blockquote>
		</Panel>

		<Panel header="Trademarks" color="plain">
			<p class="legal-body">
				The Witcher Roleplaying Game is published by R. Talsorian Games under license from CD
				PROJEKT RED. All associated trademarks and copyrights are the property of their respective
				owners. No affiliation is claimed or implied.
			</p>
		</Panel>
	</div>

	<a href="/dashboard" class="back-link" style="margin-top:16px;">&larr; Back to Dashboard</a>
</div>
