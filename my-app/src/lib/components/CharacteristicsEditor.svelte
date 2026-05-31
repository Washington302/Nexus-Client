<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { HumanCharacteristics } from '$lib/types';

  let {
    characteristics = $bindable({ scores: {} as Record<string, number> }),
  } = $props<{
    characteristics: HumanCharacteristics;
  }>();

  const labels: Record<string, string> = {
    INTELLIGENCE: 'Intelligence',
    PERCEPTION: 'Perception',
    STRENGTH: 'Strength',
    STAMINA: 'Stamina',
    PRESENCE: 'Presence',
    COMMUNICATION: 'Communication',
    DEXTERITY: 'Dexterity',
    QUICKNESS: 'Quickness',
  };

  const keys = Object.keys(labels);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  {#each keys as key}
    <div style="display: flex; align-items: center; gap: 12px;">
      <label
        for="char-{key}"
        style="
          width: 130px;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          flex-shrink: 0;
        "
      >{labels[key]}</label>
      <input
        id="char-{key}"
        type="number"
        min="-10"
        max="10"
        bind:value={characteristics.scores[key]}
        style="
          width: 60px;
          padding: 6px 8px;
          border: 1px solid {COLORS.outlineVar};
          border-radius: 4px;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
          text-align: center;
        "
      />
    </div>
  {/each}
</div>
