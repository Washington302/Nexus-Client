<script lang="ts">
  import { onMount } from 'svelte';
  import CharacterSheet from '$lib/components/CharacterSheet.svelte';
  import { api } from '$lib/services/api';
  import { session } from '$lib/stores/session.svelte';
  import type { ArsCharacter, MagicalArt } from '$lib/types/character';
  import { artScoreFromXp, abilityScoreFromXp } from '$lib/utils/arsmagica';

  let character = $state<ArsCharacter | null>(null);
  let loading = $state(true);

  let isEditable = $derived(!!session.userId);

  const STANDARD_ARTS: Record<string, MagicalArt> = {
    Creo:     { name: 'Creo',     exp: 0, score: 0, type: 'TECHNIQUE' },
    Intellego:{ name: 'Intellego',exp: 0, score: 0, type: 'TECHNIQUE' },
    Muto:     { name: 'Muto',     exp: 0, score: 0, type: 'TECHNIQUE' },
    Perdo:    { name: 'Perdo',    exp: 0, score: 0, type: 'TECHNIQUE' },
    Rego:     { name: 'Rego',     exp: 0, score: 0, type: 'TECHNIQUE' },
    Animal:   { name: 'Animal',   exp: 0, score: 0, type: 'FORM' },
    Aquam:    { name: 'Aquam',    exp: 0, score: 0, type: 'FORM' },
    Auram:    { name: 'Auram',    exp: 0, score: 0, type: 'FORM' },
    Corpus:   { name: 'Corpus',   exp: 0, score: 0, type: 'FORM' },
    Herbam:   { name: 'Herbam',   exp: 0, score: 0, type: 'FORM' },
    Ignem:    { name: 'Ignem',    exp: 0, score: 0, type: 'FORM' },
    Imaginem: { name: 'Imaginem', exp: 0, score: 0, type: 'FORM' },
    Mentem:   { name: 'Mentem',   exp: 0, score: 0, type: 'FORM' },
    Terram:   { name: 'Terram',   exp: 0, score: 0, type: 'FORM' },
    Vim:      { name: 'Vim',      exp: 0, score: 0, type: 'FORM' },
  };

  function ensureArts(charData: ArsCharacter) {
    const defaults = { ...STANDARD_ARTS };
    if (!charData.hermeticData) {
      (charData as Record<string, any>).hermeticData = { arts: defaults, house: '', wizardsSigil: '', domusMagna: '', primus: '', parens: '', covenantOfApprenticeship: '', twilightPending: false };
    } else {
      charData.hermeticData.arts = { ...defaults, ...charData.hermeticData.arts };
    }
    for (const a of Object.values(charData.hermeticData!.arts)) {
      a.score = artScoreFromXp(a.exp);
    }
  }

  function ensureAbilityScores(charData: ArsCharacter) {
    if (charData.abilities) {
      for (const a of Object.values(charData.abilities)) {
        a.score = abilityScoreFromXp(a.exp);
      }
    }
  }

  async function handleSaveField(field: string, value: unknown) {
    if (!character) return;
    await api.character.patch(character.id, field, value);
  }

  interface CollectionDoc<T> { id: string; characterId: string; abilities?: T; spells?: T; visStore?: T; }
  onMount(async () => {
    if (session.activeCharacterId) {
      try {
        const id = session.activeCharacterId;
        const [charData, abilitiesMap, spellsMap, visDoc] = await Promise.all([
          api.character.get(id),
          api.character.abilities.list(id).catch(() => ({}) as Record<string, import('$lib/types/character').Ability>),
          api.character.spells.list(id).catch(() => ({}) as Record<string, import('$lib/types/character').Spell>),
          api.character.visStore.get(id).catch(() => null as CollectionDoc<import('$lib/types/shared').RawVisStore> | null),
        ]);
        charData.abilities = abilitiesMap;
        if (visDoc?.visStore) charData.visStore = visDoc.visStore;
        ensureArts(charData);
        ensureAbilityScores(charData);
        charData.hermeticData!.spells = spellsMap;
        character = charData;
      } catch {
        character = null;
      } finally {
        loading = false;
      }
    } else {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Loading...</p>
{:else if character}
  <CharacterSheet {character} {isEditable} onSaveField={handleSaveField} />
{:else}
  <p>No character selected. <a href="/auth/login">Sign in</a> or create a character.</p>
{/if}
