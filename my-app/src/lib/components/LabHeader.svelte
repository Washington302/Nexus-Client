<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Laboratory, LabFeature, Character } from '$lib/types';
  import LabTotal from './LabTotal.svelte';

  let { lab, character } = $props<{ lab: Laboratory, character: Character }>();

  // Safe navigation wrapper converting your feature record map into an array cleanly
  const featuresList = $derived(Object.values(lab?.features || {}) as LabFeature[]);

  // Keep stats matrix mapping strictly synchronized with uppercase database keys
  const statsRows = $derived([
    ['Size',            lab?.characteristics?.scores?.SIZE ?? 0],
    ['Refinement',      lab?.characteristics?.scores?.REFINEMENT ?? 0],
    ['General Quality', lab?.characteristics?.scores?.GENERAL_QUALITY ?? 0],
    ['Safety',          lab?.characteristics?.scores?.SAFETY ?? 0],
    ['Health',          lab?.characteristics?.scores?.HEALTH ?? 0],
    ['Aesthetics',      lab?.characteristics?.scores?.AESTHETICS ?? 0],
    ['Warping',         lab?.characteristics?.scores?.WARPING ?? 0],
    ['Upkeep',          lab?.characteristics?.scores?.UPKEEP ?? 0],
  ]);
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <div style="
    padding: 12px 16px;
    border-bottom: 1px solid {COLORS.outlineVar};
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  ">
    <div>
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-style: italic;
        color: {COLORS.inkMuted};
      ">{lab?.building ?? 'Main Structure'} · Floor {lab?.floor ?? 1}</span>
    </div>
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.inkMuted};
    ">Owner: {lab?.ownerName ?? 'Unknown'}</span>
  </div>

  <div style="
    display: grid;
  ">
<LabTotal {character} />
  </div>

  {#if featuresList.length > 0}
    <div style="
      padding: 12px 16px;
      border-top: 1px solid {COLORS.outlineVar};
      background-color: {COLORS.bgHigh};
      display: flex;
      flex-direction: column;
      gap: 8px;
    ">
      <div style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.red};
      ">Laboratory Features</div>
      
      <div style="
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      ">
        {#each featuresList as feature}
          <div style="
            display: inline-flex;
            flex-direction: column;
            padding: 6px 10px;
            background-color: {COLORS.white};
            border: 1px solid {feature.isFocusFeature ? COLORS.red : COLORS.outlineVar};
            border-radius: 4px;
            max-width: 240px;
          ">
            <span style="
              font-family: {S.fontBody};
              font-size: 12px;
              font-weight: 700;
              color: {COLORS.ink};
            ">{feature.name}</span>
            
            {#if feature.isFocusFeature}
              <span style="
                font-family: {S.fontBody};
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: {COLORS.red};
                font-weight: 700;
                margin-top: 2px;
              ">★ Lab Focus</span>
            {#if feature.supportedActivities && feature.supportedActivities.length > 0}
              <span style="
                font-family: {S.fontBody};
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: {COLORS.inkMuted};
                margin-top: 2px;
              ">
                Modifies: {feature.supportedActivities.join(', ')}
              </span>
            {/if}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>