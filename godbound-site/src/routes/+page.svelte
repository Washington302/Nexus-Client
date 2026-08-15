<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '@ui/SplashHeader.svelte';

	$effect(() => {
		if (session.userId) {
			goto('/dashboard');
		}
	});
</script>

<div class="page">
	<SplashHeader
		title="Scribe"
		highlight="Sheets"
		subtitle="A character tool for the Godbound roleplaying game"
	/>

	<div class="gb-panel" style="text-align:center;">
		<p style="margin-bottom:16px; color:var(--muted-foreground);">
			Track your character, campaign roster, and chronicle in one place. Free, with no paywalls.
		</p>
		<p style="margin-bottom:16px; font-size:12px; color:var(--muted-foreground);">
			Unofficial fan work — see <a href="/legal" style="color:var(--gold-bright);">About &amp; Legal</a>.
		</p>
		{#if !session.userId}
			<div>
				<a href="/auth/login" class="gb-btn" style="text-decoration:none; display:inline-block;">Sign In</a>
				<a href="/auth/register" class="gb-btn secondary" style="text-decoration:none; display:inline-block; margin-left:8px;">Create Account</a>
			</div>
		{:else}
			<a href="/dashboard" class="gb-btn" style="text-decoration:none; display:inline-block;">Go to Dashboard</a>
		{/if}
	</div>
</div>
