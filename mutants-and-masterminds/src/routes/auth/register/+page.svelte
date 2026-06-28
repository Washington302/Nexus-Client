<script lang="ts">
	import { COMIC, FONT } from '$lib/constants';
	import { api, setToken } from '$lib/services/api';
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
			const res = await api.auth.register(username, email, password);
			if (!res.token) throw new Error(res.error ?? 'Registration failed');
			setToken(res.token);
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

<style>
	.auth-page {
		background: var(--newsprint);
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 32px;
		box-sizing: border-box;
	}

	.auth-form {
		width: 100%;
		max-width: 400px;
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 6px 6px 0 var(--border);
		padding: 32px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-header { text-align: center; }

	.form-title {
		font-family: 'Bangers', cursive;
		font-size: 32px;
		color: var(--primary);
		margin: 0;
		letter-spacing: 0.04em;
	}

	.form-sub {
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		color: var(--accent);
		margin: 4px 0 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.error-box {
		padding: 10px 14px;
		background: #ffdad6;
		border: 2px solid var(--danger);
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--danger);
	}

	.field-group { display: flex; flex-direction: column; gap: 4px; }

	.field-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.comic-input {
		padding: 10px 12px;
		border: 2.5px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 16px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
		width: 100%;
		box-sizing: border-box;
	}
	.comic-input:focus { border-color: var(--primary); }

	.submit-btn {
		font-family: 'Bangers', cursive;
		font-size: 18px;
		letter-spacing: 0.08em;
		background: var(--primary);
		color: white;
		border: 3px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		padding: 10px;
		cursor: pointer;
		text-transform: uppercase;
		transition: transform 0.1s;
	}
	.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.submit-btn:hover:not(:disabled) { transform: translate(1px, 1px); box-shadow: 2px 2px 0 var(--border); }

	.switch-link {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--accent);
		text-align: center;
	}
	.switch-link a { color: var(--danger); font-weight: 700; }

	.back-link {
		display: block;
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--accent);
		text-align: center;
	}
</style>
