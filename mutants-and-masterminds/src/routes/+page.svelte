<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';

	$effect(() => {
		if (session.userId) {
			goto('/characters');
		}
	});
</script>

<div class="landing">
	<SplashHeader title="Unofficial " highlight="Mutants &amp; Masterminds" subtitle="Superhero Roleplaying · Character Manager" />

	<div class="speech-bubble">
		&#9733; Welcome to the ultimate Unofficial Mutants &amp; Masterminds character manager! &#9733;
	</div>

	<div class="panel-grid">
		<ComicPanel header="&#9733; Get Started" color="blue">
			<div style="font-family:'Nunito',sans-serif;font-size:11px;line-height:1.6;color:var(--ink);">
				<p style="margin-bottom:10px;">Create and manage your superhero characters with our comic-style character sheet.</p>
				{#if !session.userId}
					<div style="margin-top:12px;">
						<a href="/auth/login" class="cta-btn">Sign In</a>
						<a href="/auth/register" class="cta-btn" style="background:var(--danger);margin-left:8px;">Create Account</a>
					</div>
				{:else}
					<a href="/characters" class="cta-btn">My Characters</a>
				{/if}
			</div>
		</ComicPanel>

		<ComicPanel header="&#9733; Features" color="dark">
			<div class="feature-list">
				<div class="feature-item">
					<span class="feature-icon">&#9733;</span>
					<span>Comic-style character sheets</span>
				</div>
				<div class="feature-item">
					<span class="feature-icon">&#9733;</span>
					<span>Track abilities, skills &amp; powers</span>
				</div>
				<div class="feature-item">
					<span class="feature-icon">&#9733;</span>
					<span>Manage power points &amp; conditions</span>
				</div>
				<div class="feature-item">
					<span class="feature-icon">&#9733;</span>
					<span>Multiple characters per account</span>
				</div>
			</div>
		</ComicPanel>
	</div>

	<div class="signature-band">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">&#9733; UNOFFICIAL MUTANTS &amp; MASTERMINDS · CHARACTER MANAGER &#9733;</span>
	</div>
</div>

<style>
	.landing {
		font-family: 'Nunito', sans-serif;
		background: var(--newsprint);
		padding: 20px;
		width: 100%;
		max-width: 1200px;
	}

	.speech-bubble {
		background: var(--panel-bg);
		border: 3px solid var(--border);
		border-radius: 16px;
		padding: 10px 14px;
		position: relative;
		display: inline-block;
		margin: 0 0 14px 10px;
		box-shadow: 3px 3px 0 var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--ink);
		letter-spacing: 0.02em;
		max-width: 90%;
	}
	.speech-bubble::before {
		content: '';
		position: absolute;
		bottom: -14px;
		left: 20px;
		border: 7px solid transparent;
		border-top-color: var(--border);
	}
	.speech-bubble::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 22px;
		border: 5px solid transparent;
		border-top-color: var(--panel-bg);
	}

	.panel-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-bottom: 14px;
	}

	.cta-btn {
		display: inline-block;
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.08em;
		background: var(--primary);
		color: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		padding: 8px 20px;
		text-decoration: none;
		text-transform: uppercase;
		transition: transform 0.1s;
	}
	.cta-btn:hover { transform: translate(1px, 1px); box-shadow: 2px 2px 0 var(--border); }

	.feature-list { display: flex; flex-direction: column; gap: 10px; }
	.feature-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--accent);
	}
	.feature-icon { color: var(--accent); font-size: 16px; }

	.signature-band {
		background: var(--border);
		color: var(--accent);
		font-family: 'Bangers', cursive;
		font-size: 15px;
		letter-spacing: 0.15em;
		text-align: center;
		padding: 5px;
		position: relative;
		overflow: hidden;
	}
	.sig-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, var(--highlight) 1px, transparent 1px);
		background-size: 10px 10px;
		opacity: 0.15;
	}
</style>
