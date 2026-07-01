<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ThemeCustomizer from '$lib/components/ThemeCustomizer.svelte';
</script>

<div class="page">
	<SplashHeader title="Hero" highlight="Profile" subtitle="Your account details" />

	<ComicPanel header="★ Account Info" color="blue">
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

	<ComicPanel header="★ Theme Customizer" color="dark">
		<p class="theme-intro">Customize the look and feel of your character manager. Changes save automatically.</p>
		<ThemeCustomizer />
	</ComicPanel>

	<a href="/" class="back-link">&#8592; Back to home</a>

	<div class="signature-band" style="margin-top:16px;">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">★ UNOFFICIAL MUTANTS &amp; MASTERMINDS · PROFILE ★</span>
	</div>
</div>

