<script lang="ts">
	import { session, logout } from '$lib/stores/session.svelte';
	import { goto } from '$app/navigation';
	import Panel from '$lib/components/Panel.svelte';
	import ThemeEditor from '$lib/components/ThemeEditor.svelte';

	async function handleLogout() {
		await logout();
		goto('/');
	}
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">Profile</h1>
		<p class="list-subtitle">Your account details</p>
	</div>

	{#if session.userId}
		<div class="profile-panel">
			<div class="profile-field">
				<div class="field-hdr">User ID</div>
				<div class="field-value">{session.userId}</div>
			</div>
			<div class="profile-field">
				<div class="field-hdr">Username</div>
				<div class="field-value">{session.username}</div>
			</div>
			<div class="profile-field">
				<div class="field-hdr">Email</div>
				<div class="field-value">{session.email}</div>
			</div>
		</div>

		<button onclick={handleLogout} class="comic-btn secondary" style="margin-top:16px;"
			>Sign Out</button
		>

		<div style="margin-top:16px;width:100%;">
			<Panel header="Theme Editor" color="gold">
				<p
					style="font-family:var(--font-body);font-size:13px;color:var(--on-surface-variant);margin-bottom:12px;"
				>
					Customize the look of your character sheet. Changes save automatically to this device.
				</p>
				<ThemeEditor />
			</Panel>
		</div>
	{:else}
		<div class="prompt-card">
			<p><a href="/auth/login">Sign in</a> to view your profile.</p>
		</div>
	{/if}

	<a href="/dashboard" class="back-link" style="margin-top:16px;">&larr; Back to Dashboard</a>
</div>
