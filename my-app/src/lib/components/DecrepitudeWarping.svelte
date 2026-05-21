<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import Modal from './Modal.svelte';

  let { 
    decrepitudePoints = 0, 
    warpingPoints = 0,
    agingPoints = {}
  } = $props<{
    decrepitudePoints: number;
    warpingPoints: number;
    agingPoints: Record<string, number>;
  }>();

  let agingModalOpen = $state(false);
  let warpingModalOpen = $state(false);
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
    ">Decrepitude & Warping</span>
  </div>

  <!-- Scores -->
  <div style="display: grid; grid-template-columns: 1fr 1fr;">

    <!-- Decrepitude -->
    <button
      onclick={() => agingModalOpen = true}
      style="
        padding: 10px 12px;
        text-align: center;
        border: none;
        border-right: 1px solid {COLORS.outlineVar};
        background: none;
        cursor: pointer;
        transition: background-color 0.15s ease;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHigh}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
    >
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      ">Decrepitude</div>
      <div style="
        font-family: {S.fontHeadline};
        font-size: 24px;
        font-weight: 800;
        color: {decrepitudePoints > 0 ? COLORS.red : COLORS.ink};
      ">{decrepitudePoints}</div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        color: {COLORS.inkMuted};
        font-style: italic;
        margin-top: 2px;
      ">click for effects</div>
    </button>

    <!-- Warping -->
    <button
      onclick={() => warpingModalOpen = true}
      style="
        padding: 10px 12px;
        text-align: center;
        border: none;
        background: none;
        cursor: pointer;
        transition: background-color 0.15s ease;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHigh}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
    >
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      ">Warping</div>
      <div style="
        font-family: {S.fontHeadline};
        font-size: 24px;
        font-weight: 800;
        color: {warpingPoints > 0 ? COLORS.red : COLORS.ink};
      ">{warpingPoints}</div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        color: {COLORS.inkMuted};
        font-style: italic;
        margin-top: 2px;
      ">click for effects</div>
    </button>

  </div>
</div>

<!-- Aging Modal -->
<Modal bind:open={agingModalOpen} title="Effects of Aging">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    {#each Object.entries(agingPoints) as [stat, points]}
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid {COLORS.outlineVar};
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 14px;
          color: {COLORS.ink};
        ">{stat}</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 16px;
          font-weight: 700;
          color: {(points as number) > 0 ? COLORS.red : COLORS.inkMuted};
        ">{points}</span>
      </div>
    {/each}
    {#if Object.values(agingPoints).every(p => p === 0)}
      <p style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-style: italic;
        color: {COLORS.inkMuted};
      ">No aging effects yet.</p>
    {/if}
  </div>
</Modal>

<!-- Warping Modal -->
<Modal bind:open={warpingModalOpen} title="Effects of Warping">
  <p style="
    font-family: {S.fontBody};
    font-size: 13px;
    font-style: italic;
    color: {COLORS.inkMuted};
  ">No warping effects yet.</p>
</Modal>