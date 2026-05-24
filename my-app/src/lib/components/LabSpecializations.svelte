<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Laboratory } from '$lib/types';

  let { lab } = $props<{ lab: Laboratory }>();

  const activityEntries = $derived(Object.entries(lab.activitySpecializations));
  const techEntries = $derived(Object.entries(lab.artSpecializations).filter(([k]) =>
    ['Creo','Intellego','Muto','Perdo','Rego'].includes(k)
  ));
  const formEntries = $derived(Object.entries(lab.artSpecializations).filter(([k]) =>
    !['Creo','Intellego','Muto','Perdo','Rego'].includes(k)
  ));

  const sectionLabel = `
    font-family: ${S.fontBody};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${COLORS.red};
    padding: 6px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    background-color: ${COLORS.bgLow};
  `;
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <div style={sectionLabel}>Specializations</div>

  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">

    <!-- Activity -->
    <div style="border-right: 1px solid {COLORS.outlineVar};">
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        padding: 4px 12px;
        border-bottom: 1px solid {COLORS.outlineVar};
        background-color: {COLORS.bgHigh};
      ">Activity</div>
      {#each activityEntries as [name, score]}
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 6px 12px;
          border-bottom: 1px solid {COLORS.outlineVar};
        ">
          <span style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.ink};">{name}</span>
          <span style="font-family: {S.fontHeadline}; font-size: 14px; font-weight: 700; color: {COLORS.red};">+{score}</span>
        </div>
      {/each}
      {#if activityEntries.length === 0}
        <div style="padding: 8px 12px; font-family: {S.fontBody}; font-size: 12px; font-style: italic; color: {COLORS.inkMuted};">None</div>
      {/if}
    </div>

    <!-- Technique -->
    <div style="border-right: 1px solid {COLORS.outlineVar};">
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        padding: 4px 12px;
        border-bottom: 1px solid {COLORS.outlineVar};
        background-color: {COLORS.bgHigh};
      ">Technique</div>
      {#each techEntries as [name, score]}
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 6px 12px;
          border-bottom: 1px solid {COLORS.outlineVar};
        ">
          <span style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.ink};">{name}</span>
          <span style="font-family: {S.fontHeadline}; font-size: 14px; font-weight: 700; color: {COLORS.red};">+{score}</span>
        </div>
      {/each}
      {#if techEntries.length === 0}
        <div style="padding: 8px 12px; font-family: {S.fontBody}; font-size: 12px; font-style: italic; color: {COLORS.inkMuted};">None</div>
      {/if}
    </div>

    <!-- Form -->
    <div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        padding: 4px 12px;
        border-bottom: 1px solid {COLORS.outlineVar};
        background-color: {COLORS.bgHigh};
      ">Form</div>
      {#each formEntries as [name, score]}
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 6px 12px;
          border-bottom: 1px solid {COLORS.outlineVar};
        ">
          <span style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.ink};">{name}</span>
          <span style="font-family: {S.fontHeadline}; font-size: 14px; font-weight: 700; color: {COLORS.red};">+{score}</span>
        </div>
      {/each}
      {#if formEntries.length === 0}
        <div style="padding: 8px 12px; font-family: {S.fontBody}; font-size: 12px; font-style: italic; color: {COLORS.inkMuted};">None</div>
      {/if}
    </div>

  </div>
</div>