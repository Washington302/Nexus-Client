<script lang="ts">
	// Dev-only: the REAL CharacterSheet mounted against a fixture built by the
	// app's own API->render translation, so every SheetSection call site renders
	// with realistic data. No auth, no network, no database record.
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';
	import { normalizeCharacterFromApi } from '$lib/utils/character';

	// The signature demands a complete character, but ensureDefaults() inside
	// normalizeCharacterFromApi fills every gap — which is what lets a two-field
	// seed stand in for one. The cast marks that partiality as deliberate.
	const seed = { id: 'fixture', name: 'Fixture Character' } as Parameters<
		typeof normalizeCharacterFromApi
	>[0];

	let draft = $state(normalizeCharacterFromApi(seed));
	let editable = $state(true);
</script>

{#if import.meta.env.DEV}
	<label style="display:block; margin: 8px 0;">
		<input type="checkbox" bind:checked={editable} /> editable
	</label>
	<CharacterSheet {draft} {editable} />
{/if}
