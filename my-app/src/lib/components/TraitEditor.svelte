<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Trait } from '$lib/types';

  let {
    traits = $bindable({} as Record<string, Trait>),
  } = $props<{
    traits: Record<string, Trait>;
  }>();

  let adding = $state(false);
  let newName = $state('');
  let newType = $state('General');

  const traitTypes = ['General', 'Hermetic', 'Supernatural', 'Martial', 'Social', 'Mundane', 'Story'];
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  {#each Object.entries(traits) as [key, trait]}
    <div
      style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border: 1px solid {COLORS.outlineVar};
        border-radius: 6px;
        background-color: {COLORS.white};
      "
    >
      <span style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-weight: 600;
        color: {COLORS.ink};
        min-width: 100px;
      ">{key}</span>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <select
            bind:value={traits[key].type}
            style="
              padding: 4px 6px;
              border: 1px solid {COLORS.outlineVar};
              border-radius: 4px;
              font-family: {S.fontBody};
              font-size: 11px;
              color: {COLORS.ink};
              background-color: {COLORS.white};
              max-width: 100px;
            "
          >
            {#each traitTypes as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
          <select
            bind:value={traits[key].magnitude}
            style="
              padding: 4px 6px;
              border: 1px solid {COLORS.outlineVar};
              border-radius: 4px;
              font-family: {S.fontBody};
              font-size: 11px;
              color: {COLORS.ink};
              background-color: {COLORS.white};
            "
          >
            <option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option>
            <option value="FREE">Free</option>
          </select>
        </div>
        <input
          type="text"
          bind:value={traits[key].description}
          placeholder="Description"
          style="
            width: 100%;
            padding: 4px 6px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 11px;
            font-style: italic;
            color: {COLORS.inkMuted};
            background-color: {COLORS.bgLow};
            box-sizing: border-box;
          "
        />
      </div>
      <button
        onclick={() => { delete traits[key]; traits = { ...traits }; }}
        style="
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background-color: transparent;
          color: {COLORS.red};
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
        "
        aria-label="Remove {key}"
      >✕</button>
    </div>
  {/each}

  {#if adding}
    <div
      style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border: 1px dashed {COLORS.outlineVar};
        border-radius: 6px;
      "
    >
      <select
        bind:value={newType}
        style="
          padding: 4px 6px;
          border: 1px solid {COLORS.outlineVar};
          border-radius: 4px;
          font-family: {S.fontBody};
          font-size: 11px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
        "
      >
        {#each traitTypes as t}
          <option value={t}>{t}</option>
        {/each}
      </select>
      <input
        type="text"
        bind:value={newName}
        placeholder="Name"
        style="
          flex: 1;
          padding: 4px 6px;
          border: 1px solid {COLORS.outlineVar};
          border-radius: 4px;
          font-family: {S.fontBody};
          font-size: 12px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
        "
      />
      <button
        onclick={() => {
          if (newName) {
            traits[newName] = {
              type: newType,
              magnitude: 'MINOR',
              flaw: false,
              active: true,
              replaceable: true,
              effects: [],
            };
            traits = { ...traits };
            newName = '';
            newType = 'General';
            adding = false;
          }
        }}
        disabled={!newName}
        style="
          padding: 4px 10px;
          border: 1px solid {COLORS.outlineVar};
          border-radius: 4px;
          background-color: {COLORS.white};
          color: {COLORS.ink};
          font-family: {S.fontBody};
          font-size: 11px;
          cursor: pointer;
        "
      >Add</button>
      <button
        onclick={() => adding = false}
        style="
          padding: 4px 10px;
          border: none;
          border-radius: 4px;
          background-color: transparent;
          color: {COLORS.inkMuted};
          font-family: {S.fontBody};
          font-size: 11px;
          cursor: pointer;
        "
      >Cancel</button>
    </div>
  {:else}
    <button
      onclick={() => adding = true}
      style="
        padding: 6px 12px;
        border: 1px dashed {COLORS.outlineVar};
        border-radius: 6px;
        background-color: transparent;
        color: {COLORS.inkMuted};
        font-family: {S.fontBody};
        font-size: 12px;
        cursor: pointer;
        text-align: center;
      "
    >+ Add Trait</button>
  {/if}
</div>
