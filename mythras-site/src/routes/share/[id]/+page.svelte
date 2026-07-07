<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { MythrasCharacter } from '$lib/services/api';
	import { ensureDefaults, recomputeDerivedAttributes } from '$lib/utils/character';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';

	let char = $state<MythrasCharacter | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		error = null;
		api.character
			.getPublic(id)
			.then((c) => {
				ensureDefaults(c);
				recomputeDerivedAttributes(c);
				char = c;
			})
			.catch((e) => {
				error = (e as Error).message || 'This character is not available for sharing.';
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="page">
	{#if loading}
		<div class="prompt-card"><p>Loading character…</p></div>
	{:else if error}
		<div class="prompt-card"><p>{error}</p></div>
	{:else if char}
		<div class="list-header">
			<h1 class="list-title">{char.name}</h1>
			<p class="list-subtitle">{char.raceCulture || 'Unknown Culture'} &middot; {char.career || 'Unknown Career'}</p>
		</div>

		<CharacterSheet draft={char} editable={false} />
	{/if}
</div>
