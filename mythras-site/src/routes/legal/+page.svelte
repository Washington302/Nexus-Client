<script lang="ts">
	import Panel from '$lib/components/Panel.svelte';

	// The ORC Notice & Attribution below is mandatory and must appear verbatim.
	// Do not reword it. See the Legal & Licensing Reference Guide.
	const APP_NAME = 'Scribe Sheets';
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">{APP_NAME}</h1>
		<p class="list-subtitle">An unofficial character tool for Mythras</p>
	</div>

	<div style="display:flex; flex-direction:column; gap:16px; width:100%;">
		<Panel header="About" color="primary">
			<p class="legal-body">
				{APP_NAME} is an unofficial digital character sheet. It implements game mechanics — percentile
				skill checks, Action Points, Strike Rank, hit location and armour point math, fatigue tracking
				— from the Mythras Imperative SRD, licensed under the ORC License.
			</p>
			<p class="legal-body">
				It ships no proprietary lore, no trademarked setting material, no non-SRD deity lists, and no
				official artwork or logos. You'll need the published rulebook to play.
			</p>
		</Panel>

		<Panel header="ORC Notice &amp; Attribution" color="gold">
			<blockquote class="legal-quote">
				This product is based on the following Reserved Material: Mythras, The Design Mechanism
				Copyright 2016, Written by Pete Nash and Lawrence Whitaker.
			</blockquote>
			<blockquote class="legal-quote">
				Based on Mythras Imperative, Written by Pete Nash and Lawrence Whitaker, and published by The
				Design Mechanism, Copyright 2023. Licensed under the ORC License.
			</blockquote>
		</Panel>

		<Panel header="Trademarks" color="plain">
			<p class="legal-body">
				Mythras is published by The Design Mechanism. Mythras and all associated trademarks and
				copyrights are the property of their respective owners. {APP_NAME} is an independent tool and
				is not endorsed by The Design Mechanism.
			</p>
		</Panel>
	</div>

	<a href="/characters" class="back-link" style="margin-top:16px;">&larr; Back to Characters</a>
</div>
