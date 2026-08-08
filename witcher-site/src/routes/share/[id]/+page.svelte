<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { WitcherCharacter } from '$lib/services/api';
	import { normalizeCharacterFromApi, label } from '$lib/utils/character';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';

	let char = $state<WitcherCharacter | null>(null);
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
				char = normalizeCharacterFromApi(c);
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
			<p class="list-subtitle">
				{char.raceInfo.race ? label(char.raceInfo.race) : 'Unknown Race'} &middot;
				{char.professionInfo.profession
					? label(char.professionInfo.profession)
					: 'Unknown Profession'}
			</p>
		</div>

		<CharacterSheet draft={char} editable={false} />
	{/if}
</div>
