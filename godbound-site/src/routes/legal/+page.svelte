<script lang="ts">
	import SplashHeader from '$lib/components/SplashHeader.svelte';

	// The disclaimer below is mandatory and must appear verbatim. Do not reword it.
	// See the Legal & Licensing Reference Guide.
	const APP_NAME = 'Scribe Sheets';
</script>

<div class="page">
	<SplashHeader
		title="Scribe"
		highlight="Sheets"
		subtitle="An unofficial character tool for Godbound"
	/>

	<div style="display:flex; flex-direction:column; gap:16px;">
		<div class="gb-panel">
			<div class="gb-panel-header">About</div>
			<p class="legal-body">
				{APP_NAME} is an independent digital character sheet. It implements game mechanics — hit
				points, Effort, Influence, Word abilities, gift mechanics, damage conversion, and character
				creation rules — which are not themselves copyrightable.
			</p>
			<p class="legal-body">
				It ships no verbatim setting text, no proprietary fiction or lore, and no official artwork.
				You'll need the published rulebook to play. It is free to use, with no fees, subscriptions,
				or paywalled features.
			</p>
		</div>

		<div class="gb-panel">
			<div class="gb-panel-header">Disclaimer</div>
			<blockquote class="legal-quote">
				{APP_NAME} is an independent fan creation and is not affiliated with Sine Nomine Publishing. Godbound
				is Copyright &copy; 2016 Sine Nomine Publishing and Kevin Crawford.
			</blockquote>
		</div>

		<div class="gb-panel">
			<div class="gb-panel-header">Trademarks</div>
			<p class="legal-body">
				Godbound is published by Sine Nomine Publishing. Godbound and all associated trademarks and
				copyrights are the property of their respective owners. This tool references those materials
				only to describe what it is for.
			</p>
		</div>
	</div>

	<a href="/dashboard" class="back-link" style="display:block; margin-top:16px; text-align:center;"
		>&larr; Back to Dashboard</a
	>
</div>
