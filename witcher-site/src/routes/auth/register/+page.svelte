<script lang="ts">
	import { api, setToken } from '$lib/services/api';
	import { loadSession, loadActiveCharacter } from '$lib/stores/session.svelte';
	import { goto } from '$app/navigation';

	const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,40}$/;

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		if (username.length < 3 || username.length > 30) {
			error = 'Username must be between 3 and 30 characters.';
			return;
		}
		if (!PASSWORD_PATTERN.test(password)) {
			error =
				'Password must be 8-40 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).';
			return;
		}
		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		loading = true;
		try {
			const res = await api.auth.register(username, email, password);
			if (!res.token) throw new Error(res.error ?? 'Registration failed');
			setToken(res.token);
			await loadSession();
			await loadActiveCharacter();
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
			<h1 class="form-title">Create Account</h1>
			<p class="form-sub">Join The Witcher Journal</p>
		</div>

		{#if error}
			<div class="error-box">{error}</div>
		{/if}

		<div class="field-group">
			<label for="reg-username" class="field-label">Username</label>
			<input
				id="reg-username"
				type="text"
				bind:value={username}
				required
				minlength={3}
				maxlength={30}
				class="comic-input"
			/>
			<span class="field-hint">3-30 characters.</span>
		</div>

		<div class="field-group">
			<label for="reg-email" class="field-label">Email</label>
			<input id="reg-email" type="email" bind:value={email} required class="comic-input" />
		</div>

		<div class="field-group">
			<label for="reg-password" class="field-label">Password</label>
			<input
				id="reg-password"
				type="password"
				bind:value={password}
				required
				minlength={8}
				maxlength={40}
				pattern={PASSWORD_PATTERN.source}
				class="comic-input"
			/>
			<span class="field-hint"
				>8-40 characters, with at least one uppercase letter, one lowercase letter, one number, and
				one special character (!@#$%^&*).</span
			>
		</div>

		<div class="field-group">
			<label for="reg-confirm" class="field-label">Confirm Password</label>
			<input
				id="reg-confirm"
				type="password"
				bind:value={confirmPassword}
				required
				minlength={8}
				maxlength={40}
				class="comic-input"
			/>
		</div>

		<button type="submit" disabled={loading} class="submit-btn"
			>{loading ? 'Registering...' : 'Create Account'}</button
		>

		<p class="switch-link">
			Already have an account? <a href="/auth/login">Sign in</a>
		</p>
		<a href="/" class="back-link">Back to home</a>
	</form>
</div>
