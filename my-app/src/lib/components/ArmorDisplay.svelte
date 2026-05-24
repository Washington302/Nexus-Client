<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Armor } from '$lib/types/character.old';

  let { armor = [], encumbrance = 0, totalLoad = 0, totalArmorProtection = 0 } = $props<{
    armor: Armor[];
    encumbrance: number;
    totalLoad: number;
    totalArmorProtection: number;
  }>();
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
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 6px 12px;
  ">
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Armor & Load</span>
  </div>

  <!-- Summary row -->
  <div style="
    display: flex;
    gap: 24px;
    padding: 10px 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
    background-color: {COLORS.bgHigh};
  ">
    {#each [
      ['Protection', totalArmorProtection],
      ['Total Load', totalLoad],
      ['Encumbrance', encumbrance],
    ] as [label, value]}
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <span style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">{label}</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {COLORS.ink};
        ">{value}</span>
      </div>
    {/each}
  </div>

  <!-- Armor list -->
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background-color: {COLORS.bgHigh};">
        {#each ['Armor', 'Coverage', 'Protection', 'Load', 'Quality', 'Worn'] as header}
          <th style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            padding: 6px 12px;
            text-align: {header === 'Armor' ? 'left' : 'center'};
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each armor as piece, i}
        <tr style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};">
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            font-weight: 600;
            color: {COLORS.ink};
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.materialName}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 12px;
            color: {COLORS.inkMuted};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">{piece.coverage}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.protection}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.load}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 12px;
            color: {COLORS.inkMuted};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">{piece.quality}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {piece.worn ? COLORS.red : COLORS.inkMuted};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.worn ? '✓' : '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>