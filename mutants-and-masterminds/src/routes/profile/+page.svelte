<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ThemeCustomizer from '$lib/components/ThemeCustomizer.svelte';
</script>

<div class="page">
	<SplashHeader title="Hero" highlight="Profile" subtitle="Your account details" />

	<ComicPanel header="&#9733; Account Info" color="blue">
		{#if session.userId}
			<div class="profile-field">
				<div class="field-label">User ID</div>
				<div class="field-value">{session.userId}</div>
			</div>
			<div class="profile-field">
				<div class="field-label">Username</div>
				<div class="field-value">{session.username}</div>
			</div>
			<div class="profile-field">
				<div class="field-label">Email</div>
				<div class="field-value">{session.email}</div>
			</div>
		{:else}
			<p class="signin-prompt">
				<a href="/auth/login">Sign in</a> to view your profile.
			</p>
		{/if}
	</ComicPanel>

	<ComicPanel header="&#9733; Theme Customizer" color="dark">
		<p class="theme-intro">Customize the look and feel of your character manager. Changes save automatically.</p>
		<ThemeCustomizer />
	</ComicPanel>

	<a href="/" class="back-link">&#8592; Back to home</a>

	<div class="signature-band" style="margin-top:16px;">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">&#9733; UNOFFICIAL MUTANTS &amp; MASTERMINDS · PROFILE &#9733;</span>
	</div>
</div>

<style>
	.page {
		font-family: 'Nunito', sans-serif;
		background: var(--newsprint);
		padding: 20px;
		width: 100%;
		max-width: 1200px;
	}

	.profile-field {
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1.5px dashed var(--border);
	}

	.field-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 4px;
	}

	.field-value {
		font-family: 'Nunito', sans-serif;
		font-size: 16px;
		color: var(--ink);
	}

	.theme-intro {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--accent);
		margin-bottom: 12px;
		line-height: 1.4;
	}

	.signin-prompt {
		font-size: 16px;
		text-align: center;
		padding: 24px 0;
	}
	.signin-prompt a { color: var(--danger); font-weight: 700; }

	.back-link {
		display: inline-block;
		margin-top: 16px;
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--accent);
		text-decoration: underline;
	}

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
