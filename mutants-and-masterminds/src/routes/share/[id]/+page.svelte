<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { MnmCharacter } from '$lib/services/api';
	import { normalizeCharacterFromApi } from '$lib/utils/character';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';

	let char = $state<MnmCharacter | null>(null);
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
			.then((data) => {
				char = normalizeCharacterFromApi(data);
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : 'Character not found.';
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

{#if loading}
	<div class="loading-wrap">
		<ComicPanel header="★ Loading" color="blue">
			<p>Loading character&hellip;</p>
		</ComicPanel>
	</div>
{:else if error}
	<div class="error-wrap">
		<ComicPanel header="⚠ Error" color="red">
			<p>{error}</p>
		</ComicPanel>
	</div>
{:else if char}
	<CharacterSheet draft={char} editable={false} headerTitle="Shared File · Scribe " />
{/if}
