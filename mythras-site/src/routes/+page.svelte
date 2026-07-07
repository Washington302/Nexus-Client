<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';

	$effect(() => {
		if (session.userId) {
			goto('/characters');
		}
	});
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">Mythic Workbook</h1>
		<p class="list-subtitle">Mythras Character Sheet &middot; Digital Companion</p>
	</div>

	<div class="panel-full" style="width:100%;">
		<div class="panel-header">
			<span class="panel-label">Get Started</span>
		</div>
		<div class="panel-body">
			<p style="font-family:var(--font-body);font-size:14px;color:var(--on-surface);margin-bottom:16px;">
				Create and manage your Mythras characters on a single two-page digital sheet.
			</p>
			{#if !session.userId}
				<div style="display:flex;gap:8px;">
					<a href="/auth/login" class="signin-btn" style="border-color:var(--primary);color:var(--primary);"
						>Sign In</a
					>
					<a href="/auth/register" class="comic-btn" style="text-decoration:none;">Create Account</a>
				</div>
			{:else}
				<a href="/characters" class="comic-btn" style="text-decoration:none;">My Characters</a>
			{/if}
		</div>
	</div>
</div>
