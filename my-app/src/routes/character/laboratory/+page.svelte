<script lang="ts">
  import { onMount } from 'svelte';
  import { COLORS } from '$lib/constants';
  import { api } from '$lib/services/api';
  import { session } from '$lib/stores/session.svelte';
  import {
    ArtsGrid,
    CastingTotals,
    LongevityRitual,
    RawVis,
    ChipList,
    MagicItems,
    PersonalityTraits,
    LabHeader,
    LabSpecializations
  } from '$lib/components';
  import SanctumChambers from '$lib/components/SanctumChambers.svelte';
  import type { ArsCharacter } from '$lib/types/character';
  import type { Laboratory } from '$lib/types/laboratory';

  let character = $state<ArsCharacter | null>(null);
  let lab = $state<Laboratory | null>(null);
  let loading = $state(true);

  const artsList = $derived(Object.values(character?.hermeticData?.arts ?? {}));

  onMount(async () => {
    const charId = session.activeCharacterId;
    if (!charId) { loading = false; return; }
    try {
      const [charData, labDoc] = await Promise.all([
        api.character.get(charId),
        api.character.laboratory.get(charId).catch(() => null),
      ]);
      character = charData;
      lab = labDoc?.laboratoryDetails ?? null;
    } catch {
      character = null;
      lab = null;
    } finally {
      loading = false;
    }
  });
</script>

<div style="
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
  background-color: {COLORS.bg};
  min-height: 100vh;
">

  {#if loading}
    <p>Loading...</p>
  {:else if !character || !lab}
    <p>No laboratory found. Create or link a covenant to set up your lab.</p>
  {:else}

    <div style="margin-bottom: 24px;">
      <LabHeader {lab} {character} />
    </div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: start;">

      <div style="position: sticky; top: 96px; height: fit-content; align-self: start;">
        <ArtsGrid {artsList} />
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
          <ChipList virtues={lab.virtues} flaws={lab.flaws} />
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <LabSpecializations {lab} />
            <PersonalityTraits traits={lab.personalityTraits} />
          </div>
        </div>

        <div class="ink-divider" />
        <MagicItems items={lab.magicItems} />
        <SanctumChambers chambers={lab.sanctumChambers} />

        <CastingTotals {character} />
        <LongevityRitual warpingPoints={character.warpingPoints} />

        <RawVis personalVis={{ standard: [], extraordinary: [] }} labVis={lab.visStock} />

      </div>
    </div>
  {/if}
</div>
