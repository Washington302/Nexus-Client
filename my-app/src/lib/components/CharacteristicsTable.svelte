<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { HumanCharacteristics } from '$lib/types';

  let { characteristics } = $props<{ characteristics: HumanCharacteristics }>();

  const rows = $derived([
    ['Int', 'Intelligence',  characteristics.scores.INTELLIGENCE],
    ['Per', 'Perception',    characteristics.scores.PERCEPTION],
    ['Str', 'Strength',      characteristics.scores.STRENGTH],
    ['Sta', 'Stamina',       characteristics.scores.STAMINA],
    ['Pre', 'Presence',      characteristics.scores.PRESENCE],
    ['Com', 'Communication', characteristics.scores.COMMUNICATION],
    ['Dex', 'Dexterity',     characteristics.scores.DEXTERITY],
    ['Qik', 'Quickness',     characteristics.scores.QUICKNESS],
  ]);

  function scoreColor(score: number) {
    return score > 0 ? COLORS.red : score < 0 ? COLORS.inkMuted : COLORS.ink;
  }

  function formatScore(score: number) {
    return score > 0 ? `+${score}` : `${score}`;
  }
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <!-- Header -->
  <div style="
    background-color: {COLORS.bgLow};
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
  ">
    <span style="
      font-family: {S.fontBody};
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Characteristic</span>
    <span style="
      font-family: {S.fontBody};
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Score</span>
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      {#each rows as [abbr, label, score], i}
        <tr style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};">
          <td style="
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">
            <div style="
              font-family: {S.fontBody};
              font-size: 14px;
              font-weight: 700;
              color: {COLORS.ink};
            ">{abbr}</div>
            <div style="
              font-family: {S.fontBody};
              font-size: 11px;
              font-style: italic;
              color: {COLORS.inkMuted};
            ">{label}</div>
          </td>
          <td style="
            padding: 8px 12px;
            text-align: right;
            border-bottom: 1px solid {COLORS.outlineVar};
            font-family: {S.fontHeadline};
            font-size: 18px;
            font-weight: 700;
            color: {scoreColor(score as number)};
          ">{formatScore(score as number)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>