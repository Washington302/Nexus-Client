<script lang="ts">
	import { login } from '$lib/stores/session.svelte';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = null;
		try {
			await login(email, password);
			goto('/characters');
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
			<h1 class="form-title">Sign In</h1>
			<p class="form-sub">Access your character roster</p>
		</div>

		{#if error}
			<div class="error-box">{error}</div>
		{/if}

		<div class="field-group">
			<label for="email" class="field-label">Email</label>
			<input id="email" type="email" bind:value={email} required class="comic-input" />
		</div>

		<div class="field-group">
			<label for="password" class="field-label">Password</label>
			<input id="password" type="password" bind:value={password} required class="comic-input" />
		</div>

		<button type="submit" disabled={loading} class="submit-btn"
			>{loading ? 'Signing in...' : 'Sign In'}</button
		>

		<p class="switch-link">
			Don't have an account? <a href="/auth/register">Create one</a>
		</p>
		<a href="/" class="back-link">Back to home</a>
	</form>
</div>
