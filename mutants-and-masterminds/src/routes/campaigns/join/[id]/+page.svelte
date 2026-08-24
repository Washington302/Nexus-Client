<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';

	let error = $state<string | null>(null);
	let joining = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id || !session.userId) return;
		joining = true;
		error = null;
		api.campaign
			.join(id)
			.then(() => goto(`/campaigns/${id}`))
			.catch((e) => {
				error = (e as Error).message?.includes('403')
					? 'This campaign is invite-only. Ask the GM to add you directly.'
					: (e as Error).message;
			})
			.finally(() => {
				joining = false;
			});
	});
</script>

<div class="page">
	{#if !session.userId}
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to join this campaign.</p></div>
	{:else if joining}
		<div class="prompt-card"><p>Joining campaign...</p></div>
	{:else if error}
		<SplashHeader title="Couldn't" highlight="Join" subtitle="" />
		<div class="prompt-card"><p>{error}</p></div>
	{/if}
</div>
