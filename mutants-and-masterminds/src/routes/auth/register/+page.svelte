<script lang="ts">
	import { COMIC, FONT } from '$lib/constants';
	import { register } from '$lib/stores/session.svelte';
	import { goto } from '$app/navigation';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		loading = true;
		try {
			await register(username, email, password);
			goto('/dashboard');
		} catch (e) {
			error = (e as Error).message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-page">
	<form onsubmit={handleSubmit} class="auth-form">
		<div class="form-header">
			<h1 class="form-title">Create Account</h1>
			<p class="form-sub">Join the league of heroes</p>
		</div>

		{#if error}
			<div class="error-box">{error}</div>
		{/if}

		<div class="field-group">
			<label for="reg-username" class="field-label">Username</label>
			<input id="reg-username" type="text" bind:value={username} required class="comic-input" />
		</div>

		<div class="field-group">
			<label for="reg-email" class="field-label">Email</label>
			<input id="reg-email" type="email" bind:value={email} required class="comic-input" />
		</div>

		<div class="field-group">
			<label for="reg-password" class="field-label">Password</label>
			<input id="reg-password" type="password" bind:value={password} required minlength={6} class="comic-input" />
		</div>

		<div class="field-group">
			<label for="reg-confirm" class="field-label">Confirm Password</label>
			<input id="reg-confirm" type="password" bind:value={confirmPassword} required minlength={6} class="comic-input" />
		</div>

		<button type="submit" disabled={loading} class="submit-btn">{loading ? 'Registering...' : 'Create Account'}</button>

		<p class="switch-link">
			Already have an account? <a href="/auth/login">Sign in</a>
		</p>
		<a href="/" class="back-link">Back to home</a>
	</form>
</div>

