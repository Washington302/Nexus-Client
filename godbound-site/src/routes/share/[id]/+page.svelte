<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import { normalizeCharacterFromApi } from '$lib/utils/character';
	import SplashHeader from '@ui/SplashHeader.svelte';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';

	let char = $state<GodboundCharacter | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id) {
			error = 'No character specified.';
			loading = false;
			return;
		}
		loading = true;
		error = null;
		api.character.getPublic(id)
			.then((data) => { char = normalizeCharacterFromApi(data); })
			.catch((e) => { error = (e as Error).message; })
			.finally(() => { loading = false; });
	});
</script>

<div class="page">
	{#if loading}
		<div class="prompt-card"><p>Loading character...</p></div>
	{:else if error || !char}
		<div class="prompt-card"><p>{error ?? 'Character not found.'}</p></div>
	{:else}
		<SplashHeader title={char.name} highlight="" subtitle={char.goal || 'Shared character sheet'} />

		<CharacterSheet draft={char} editable={false} />
	{/if}
</div>
