<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { PersonalityTrait } from '$lib/types';

  let {
    traits = $bindable([] as PersonalityTrait[]),
  } = $props<{
    traits: PersonalityTrait[];
  }>();

  let adding = $state(false);
  let newName = $state('');
  let newScore = $state(0);
  let newEssential = $state(false);
  let newTemporary = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 10px;">
  {#each traits as trait, i}
    <div style="display: flex; align-items: center; gap: 8px;">
      <input
        type="text"
        bind:value={traits[i].name}
        style="
          width: 140px;
          padding: 6px 8px;
          border: 1px solid {COLORS.outlineVar};
          border-radius: 4px;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
        "
      />
      <input
        type="number"
        min="-10"
        max="10"
        bind:value={traits[i].score}
        style="
          width: 50px;
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
      <label style="
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: {S.fontBody};
        font-size: 11px;
        color: {COLORS.inkMuted};
        cursor: pointer;
      ">
        <input type="checkbox" bind:checked={traits[i].essential} />
        Essential
      </label>
      <label style="
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: {S.fontBody};
        font-size: 11px;
        color: {COLORS.inkMuted};
        cursor: pointer;
      ">
        <input type="checkbox" bind:checked={traits[i].temporary} />
        Temporary
      </label>
      <button
        onclick={() => { traits = traits.filter((_t: PersonalityTrait, idx: number) => idx !== i); }}
        style="
          width: 22px; height: 22px;
          border: none; border-radius: 50%;
          background: transparent;
          color: {COLORS.red};
          cursor: pointer;
          font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          padding: 0; flex-shrink: 0;
        "
        aria-label="Remove {trait.name}"
      >✕</button>
    </div>
  {/each}

  {#if adding}
    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px dashed {COLORS.outlineVar}; border-radius: 6px;">
      <input type="text" bind:value={newName} placeholder="Name" style="width:140px; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px;" />
      <input type="number" bind:value={newScore} min="-10" max="10" style="width:50px; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; text-align:center;" />
      <label style="display:flex; align-items:center; gap:4px; font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted}; cursor:pointer;"><input type="checkbox" bind:checked={newEssential} /> Essential</label>
      <label style="display:flex; align-items:center; gap:4px; font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted}; cursor:pointer;"><input type="checkbox" bind:checked={newTemporary} /> Temporary</label>
      <button onclick={() => { if (newName) { traits = [...traits, { name: newName, score: newScore, essential: newEssential, temporary: newTemporary }]; newName = ''; newScore = 0; newEssential = false; newTemporary = false; adding = false; } }} disabled={!newName} style="padding:4px 10px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.white}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;">Add</button>
      <button onclick={() => adding = false} style="padding:4px 10px; border:none; background:transparent; font-family:{S.fontBody}; font-size:11px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
    </div>
  {:else}
    <button onclick={() => adding = true} style="padding:6px 12px; border:1px dashed {COLORS.outlineVar}; border-radius:6px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; cursor:pointer; text-align:center;">+ Add Trait</button>
  {/if}
</div>
