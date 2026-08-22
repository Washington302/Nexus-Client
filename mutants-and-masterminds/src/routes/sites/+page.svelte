<script lang="ts">
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '@ui/Panel.svelte';

	// Every sheet ships under the same product name; the game each one serves is a
	// descriptive line beneath it, never the card's title.
	const sites: { key: string; label: string; game: string; desc: string; href: string }[] = [
		{ key: 'godbound', label: 'Scribe Sheets', game: 'for Godbound', desc: 'Divine-powered heroes reshaping a broken world.', href: 'https://gb.scribe-sheets.com' },
		{ key: 'mythras', label: 'Scribe Sheets', game: 'for Mythras', desc: 'Gritty, skill-based fantasy roleplaying.', href: 'https://mythic.scribe-sheets.com' },
		{ key: 'witcher', label: 'Scribe Sheets', game: 'for The Witcher TTRPG', desc: 'Monster hunting in a grim, morally gray world.', href: 'https://kaer.scribe-sheets.com' },
		{ key: 'arsmagica', label: 'Scribe Sheets', game: 'for Ars Magica', desc: 'Wizards, covenants, and the fall of an age of magic.', href: 'https://covenant.scribe-sheets.com' },
	];
</script>

<div class="page">
	<SplashHeader title="My Other" highlight="Sites" subtitle="Everything else I'm building" />

	<ComicPanel header="★ Other Projects" color="dark">
		<div class="card-grid">
			{#each sites as site}
				{#if site.href}
					<a href={site.href} class="site-card {site.key}" target="_blank" rel="noopener noreferrer">
						<div class="site-card-header">
							<span class="site-card-label">{site.label}</span>
							<span class="site-card-game">{site.game}</span>
						</div>
						<p class="site-card-desc">{site.desc}</p>
						<span class="site-card-open">Visit &#8594;</span>
					</a>
				{:else}
					<div class="site-card {site.key} pending">
						<div class="site-card-header">
							<span class="site-card-label">{site.label}</span>
							<span class="site-card-game">{site.game}</span>
						</div>
						<p class="site-card-desc">{site.desc}</p>
						<span class="site-card-open">Deploying soon</span>
					</div>
				{/if}
			{/each}
		</div>
	</ComicPanel>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;600&family=Montserrat:wght@700&family=Roboto:wght@400&family=Literata:wght@600;700&family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@600&family=Epilogue:wght@600;700&display=swap');

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 16px;
	}

	.site-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 18px;
		border-radius: 6px;
		text-decoration: none;
		transition: transform 0.15s;
	}
	.site-card:not(.pending):hover { transform: translateY(-3px); }
	.site-card.pending { opacity: 0.7; cursor: default; }

	.site-card-label {
		font-size: 20px;
		font-weight: 700;
		display: block;
	}
	/* The game name lives here, small, under the product name — never as the title.
	   It's a bordered chip so it stays legible against every theme's background,
	   dark ones included; each theme sets its own border/text color below. */
	.site-card-game {
		display: inline-block;
		width: fit-content;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-top: 4px;
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid;
	}
	.site-card-desc {
		font-size: 13px;
		line-height: 1.5;
		flex: 1;
		margin: 0;
	}
	.site-card-open {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	/* Godbound — dark, elegant divine/epic fantasy: gold on near-black */
	.site-card.godbound {
		background: oklch(0.15 0.005 260);
		border: 1px solid oklch(0.72 0.12 80 / 0.4);
		box-shadow: 0 0 0 1px oklch(0.72 0.12 80 / 0.1);
	}
	.site-card.godbound .site-card-label {
		font-family: 'Cormorant Garamond', serif;
		color: oklch(0.82 0.14 80);
		letter-spacing: 0.02em;
	}
	.site-card.godbound .site-card-desc {
		font-family: 'Inter', sans-serif;
		color: oklch(0.85 0.02 80);
	}
	.site-card.godbound .site-card-open { color: oklch(0.72 0.12 80); }
	.site-card.godbound .site-card-game {
		font-family: 'Inter', sans-serif;
		color: oklch(0.82 0.14 80);
		border-color: oklch(0.72 0.12 80 / 0.5);
	}

	/* Mythras — clean Material-derived light theme: maroon on parchment-pink */
	.site-card.mythras {
		background: #fff8f7;
		border: 1px solid #390009;
		box-shadow: 4px 4px 0 #390009;
	}
	.site-card.mythras .site-card-label {
		font-family: 'Montserrat', sans-serif;
		color: #390009;
		text-transform: uppercase;
	}
	.site-card.mythras .site-card-desc {
		font-family: 'Roboto', sans-serif;
		color: #390009;
	}
	.site-card.mythras .site-card-game {
		font-family: 'Montserrat', sans-serif;
		color: #390009;
		border-color: #390009;
	}
	.site-card.mythras .site-card-open {
		color: #390009;
		background: #fed488;
		display: inline-block;
		padding: 3px 8px;
		border-radius: 3px;
		width: fit-content;
	}

	/* Witcher — weathered monster-hunter field journal: bone/parchment on near-black */
	.site-card.witcher {
		background: #131313;
		border: 1px solid #4d453e;
	}
	.site-card.witcher .site-card-label {
		font-family: 'Literata', serif;
		color: #f6e1cd;
	}
	.site-card.witcher .site-card-desc {
		font-family: 'Hanken Grotesk', sans-serif;
		color: #b7ab9c;
	}
	.site-card.witcher .site-card-game {
		font-family: 'JetBrains Mono', monospace;
		color: #e57373;
		border-color: #6b3a3a;
	}
	.site-card.witcher .site-card-open {
		font-family: 'JetBrains Mono', monospace;
		color: #e57373;
	}

	/* Ars Magica — illuminated manuscript / warm parchment */
	.site-card.arsmagica {
		background: #fef9eb;
		border: 2px solid #c8c7be;
	}
	.site-card.arsmagica .site-card-label {
		font-family: 'Epilogue', sans-serif;
		color: #1d1c13;
	}
	.site-card.arsmagica .site-card-desc {
		font-family: 'Literata', serif;
		color: #474741;
	}
	.site-card.arsmagica .site-card-game {
		font-family: 'Epilogue', sans-serif;
		color: #a9372a;
		border-color: #a9372a;
	}
	.site-card.arsmagica .site-card-open { color: #a9372a; }
</style>
