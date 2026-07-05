<script lang="ts">
	import { session, logout } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
</script>

<div class="page">
	<SplashHeader title="Godbound" highlight="Profile" subtitle="Your account details" />

	{#if session.userId}
		<div class="gb-panel">
			<div class="gb-panel-header">Account Info</div>
			<div class="field-group">
				<div class="field-label">User ID</div>
				<div>{session.userId}</div>
			</div>
			<div class="field-group">
				<div class="field-label">Username</div>
				<div>{session.username}</div>
			</div>
			<div class="field-group" style="margin-bottom:0;">
				<div class="field-label">Email</div>
				<div>{session.email}</div>
			</div>
		</div>

		<button onclick={logout} class="gb-btn secondary">Sign Out</button>
	{:else}
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your profile.</p></div>
	{/if}

	<a href="/dashboard" class="back-link">&larr; Back to Dashboard</a>
</div>
