<script lang="ts">
	import PillBadge from '@ui/PillBadge.svelte';

	// Every sheet ships under the same product name; the game each one serves is a
	// descriptive line beneath it, never the card's title.
	const sites: { key: string; label: string; game: string; desc: string; href: string }[] = [
		{ key: 'godbound', label: 'Scribe Sheets', game: 'for Godbound', desc: 'Divine-powered heroes reshaping a broken world.', href: 'https://gb.scribe-sheets.com' },
		{ key: 'mythras', label: 'Scribe Sheets', game: 'for Mythras', desc: 'Gritty, skill-based fantasy roleplaying.', href: 'https://mythic.scribe-sheets.com' },
		{ key: 'mnm', label: 'Scribe Sheets', game: 'for Mutants & Masterminds', desc: 'Superheroic action for any power level.', href: 'https://vanguard.scribe-sheets.com' },
		{ key: 'arsmagica', label: 'Scribe Sheets', game: 'for Ars Magica', desc: 'Wizards, covenants, and the fall of an age of magic.', href: 'https://covenant.scribe-sheets.com' },
	];
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">Other Sites</h1>
		<p class="list-subtitle">Everything else I'm building</p>
	</div>

	<div class="card-grid">
		{#each sites as site}
			<a href={site.href} class="dash-card" target="_blank" rel="noopener noreferrer">
				<div class="dash-card-header">
					<span class="dash-card-label">{site.label}</span>
				</div>
				<PillBadge text={site.game} color="primary" />
				<p class="dash-card-desc">{site.desc}</p>
				<span class="dash-card-open">Visit &#8594;</span>
			</a>
		{/each}
	</div>
</div>
