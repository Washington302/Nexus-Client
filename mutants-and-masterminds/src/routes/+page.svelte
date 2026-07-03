<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';

	$effect(() => {
		if (session.userId) {
			goto('/dashboard');
		}
	});
</script>

<div class="landing">
	<SplashHeader title="Unofficial " highlight="Mutants &amp; Masterminds" subtitle="Superhero Roleplaying · Character Manager" />

	<div class="speech-bubble">
		★ Welcome to the ultimate Unofficial Mutants &amp; Masterminds character manager! ★
	</div>

	<div class="panel-grid">
		<ComicPanel header="★ Get Started" color="blue">
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

		<ComicPanel header="★ Features" color="dark">
			<div class="feature-list">
				<div class="feature-item">
					<span class="feature-icon">★</span>
					<span>Comic-style character sheets</span>
				</div>
				<div class="feature-item">
					<span class="feature-icon">★</span>
					<span>Track abilities, skills &amp; powers</span>
				</div>
				<div class="feature-item">
					<span class="feature-icon">★</span>
					<span>Manage power points &amp; conditions</span>
				</div>
				<div class="feature-item">
					<span class="feature-icon">★</span>
					<span>Multiple characters per account</span>
				</div>
			</div>
		</ComicPanel>
	</div>

	<div class="signature-band">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">★ UNOFFICIAL MUTANTS &amp; MASTERMINDS · CHARACTER MANAGER ★</span>
	</div>
</div>

