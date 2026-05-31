<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import Modal from './Modal.svelte';

  let { 
    decrepitudePoints = 0, 
    warpingPoints = 0,
    agingPoints = {},
    onSave = async (_field: string, _data: unknown) => {},
  } = $props<{
    decrepitudePoints: number;
    warpingPoints: number;
    agingPoints: Record<string, number>;
    onSave?: (field: string, data: unknown) => Promise<void>;
  }>();

  let agingModalOpen = $state(false);
  let warpingModalOpen = $state(false);

  // Editable copies
  let localAgingPoints = $state({} as Record<string, number>);
  let localWarping = $state(0);

  function openAging() {
    localAgingPoints = { ...agingPoints };
    agingModalOpen = true;
  }

  function openWarping() {
    localWarping = warpingPoints;
    warpingModalOpen = true;
  }

  async function saveAging() {
    await onSave('agingPoints', localAgingPoints);
    agingModalOpen = false;
  }

  async function saveWarping() {
    await onSave('warpingPoints', localWarping);
    warpingModalOpen = false;
  }

  function addAgingPoint(stat: string) {
    localAgingPoints[stat] = (localAgingPoints[stat] ?? 0) + 1;
    localAgingPoints = { ...localAgingPoints };
  }

  function removeAgingPoint(stat: string) {
    const current = localAgingPoints[stat] ?? 0;
    if (current > 0) {
      localAgingPoints[stat] = current - 1;
      if (localAgingPoints[stat] === 0) {
        const { [stat]: _, ...rest } = localAgingPoints;
        localAgingPoints = rest;
      } else {
        localAgingPoints = { ...localAgingPoints };
      }
    }
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
      onclick={openAging}
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
      onclick={openWarping}
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
    {#each Object.entries(localAgingPoints) as [stat, points]}
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
        <div style="display: flex; align-items: center; gap: 6px;">
          <button onclick={() => removeAgingPoint(stat)} style="width:22px; height:22px; border:1px solid {COLORS.outlineVar}; border-radius:3px; background:{COLORS.bgLow}; cursor:pointer; font-size:13px; line-height:1; padding:0;">−</button>
          <span style="
            font-family: {S.fontHeadline};
            font-size: 16px;
            font-weight: 700;
            min-width: 24px;
            text-align: center;
            color: {(points as number) > 0 ? COLORS.red : COLORS.inkMuted};
          ">{points}</span>
          <button onclick={() => addAgingPoint(stat)} style="width:22px; height:22px; border:1px solid {COLORS.outlineVar}; border-radius:3px; background:{COLORS.bgLow}; cursor:pointer; font-size:13px; line-height:1; padding:0;">+</button>
        </div>
      </div>
    {/each}
    {#if Object.values(localAgingPoints).every(p => p === 0) || Object.keys(localAgingPoints).length === 0}
      <p style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-style: italic;
        color: {COLORS.inkMuted};
      ">No aging effects yet.</p>
    {/if}
    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button onclick={saveAging} style="flex:1; padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Save</button>
      <button onclick={() => agingModalOpen = false} style="flex:1; padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Cancel</button>
    </div>
  </div>
</Modal>

<!-- Warping Modal -->
<Modal bind:open={warpingModalOpen} title="Effects of Warping">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink};">Warping Points</span>
      <input type="number" min="0" bind:value={localWarping} style="width:80px; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; text-align:center;" />
    </div>
    <div style="display: flex; gap: 8px; margin-top: 4px;">
      <button onclick={saveWarping} style="flex:1; padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Save</button>
      <button onclick={() => warpingModalOpen = false} style="flex:1; padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Cancel</button>
    </div>
  </div>
</Modal>