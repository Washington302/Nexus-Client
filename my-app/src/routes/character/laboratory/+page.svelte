<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { character } from '$lib/data/character';
  import {
    ArtsGrid,
    CastingTotals,
    LabTotal,
    LongevityRitual,
    RawVis,
    ChipList,
    PersonalityTraits,
  } from '$lib/components';
  import LabHeader from '$lib/components/LabHeader.svelte';
  import LabSpecializations from '$lib/components/LabSpecializations.svelte';

  const lab = character.hermeticData.laboratory;
  const artsList = Object.values(character.hermeticData.arts);

  const personalVis = character.hermeticData.rawVis;
  const labVis = lab.visStore;
</script>

<div style="
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
  background-color: {COLORS.bg};
  min-height: 100vh;
">

  <!-- Lab Header -->
  <div style="margin-bottom: 24px;">
    <LabHeader {lab} />
  </div>

  <!-- Main Grid -->
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: start;">

    <!-- Left: Arts -->
    <div style="position: sticky; top: 96px; height: fit-content; align-self: start;">
      <ArtsGrid {artsList} />
    </div>

    <!-- Right: Everything else -->
    <div style="display: flex; flex-direction: column; gap: 16px;">

      <!-- Top row: Virtues/Flaws + Specializations -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
        <ChipList virtues={lab.virtues} flaws={lab.flaws} />
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <LabSpecializations {lab} />
          <PersonalityTraits traits={Object.entries(lab.personalityTraits).map(([name, score]) => ({
            name,
            score: score as number,
            complexion: 'MELANCHOLIC' as const,
            essential: false,
            temporary: false
          }))} />
        </div>
      </div>

      <div class="ink-divider" />

      <!-- Casting Totals -->
      <CastingTotals {character} />

      <!-- Lab Total + Longevity side by side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
        <LabTotal {character} />
        <LongevityRitual warpingPoints={character.warpingPoints} />
      </div>

      <!-- Vis -->
      <RawVis {personalVis} {labVis} />

    </div>
  </div>
</div>