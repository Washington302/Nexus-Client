<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Laboratory } from '$lib/types';

  let { lab } = $props<{ lab: Laboratory }>();
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <!-- Identity -->
  <div style="
    padding: 12px 16px;
    border-bottom: 1px solid {COLORS.outlineVar};
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  ">
    <div>
      <h2 style="
        font-family: {S.fontHeadline};
        font-size: 20px;
        font-weight: 800;
        color: {COLORS.ink};
        line-height: 1;
        margin-bottom: 4px;
      ">{lab.name}</h2>
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.inkMuted};
      ">{lab.building} · Floor {lab.floor}</span>
    </div>
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.inkMuted};
    ">Owner: {lab.ownerName}</span>
  </div>

  <!-- Stats grid -->
  <div style="
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  ">
    {#each [
      ['Size',            lab.size],
      ['Refinement',      lab.refinement],
      ['General Quality', lab.generalQuality],
      ['Safety',          lab.safety],
      ['Health',          lab.health],
      ['Aesthetics',      lab.aesthetics],
      ['Warping',         lab.warping],
      ['Upkeep',          lab.upkeep],
    ] as [label, value]}
      <div style="
        padding: 8px 12px;
        border-right: 1px solid {COLORS.outlineVar};
        border-bottom: 1px solid {COLORS.outlineVar};
        text-align: center;
      ">
        <div style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: {COLORS.inkMuted};
          margin-bottom: 2px;
        ">{label}</div>
        <div style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {(value as number) < 0 ? COLORS.red : COLORS.ink};
        ">{(value as number) > 0 ? `+${value}` : value}</div>
      </div>
    {/each}
  </div>

  <!-- Features -->
  {#if lab.features.length > 0}
    <div style="
      padding: 8px 16px;
      border-top: 1px solid {COLORS.outlineVar};
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">Features:</span>
      {#each lab.features as feature}
        <span style="
          font-family: {S.fontBody};
          font-size: 12px;
          color: {COLORS.ink};
          border: 1px solid {COLORS.outlineVar};
          padding: 2px 8px;
          background-color: {COLORS.bgHigh};
        ">{feature}</span>
      {/each}
    </div>
  {/if}
</div>