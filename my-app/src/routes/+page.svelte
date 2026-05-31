<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { api } from '$lib/services/api';
  import { session, loadActiveCharacter, setActiveCharacterById } from '$lib/stores/session.svelte';
  import type { CharacterType } from '$lib/types/character';

  let showNewChar = $state(false);
  let newName = $state('');
  let newType = $state<CharacterType>('MAGUS');
  let creating = $state(false);
  let createError = $state<string | null>(null);

  const characters = $derived(session.characters);

  async function handleCreate() {
    creating = true;
    createError = null;
    try {
      await api.character.create({ name: newName, type: newType });
      await loadActiveCharacter();
      showNewChar = false;
      newName = '';
    } catch (e) {
      createError = (e as Error).message;
    } finally {
      creating = false;
    }
  }
</script>

<div style="
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
">
  <div style="
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    border-bottom: 2px solid {COLORS.ink};
    padding-bottom: 16px;
  ">
    <div>
      <h1 style="
        font-family: {S.fontHeadline};
        font-size: 32px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
        line-height: 1;
        margin-bottom: 4px;
      ">NEXUS</h1>
      <span style="
        font-family: {S.fontBody};
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.inkMuted};
      ">Ars Magica Character Manager</span>
    </div>

    <div style="display: flex; gap: 8px;">
        <a href="/covenant"
        style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          text-decoration: none;
          border: 1px solid {COLORS.outlineVar};
          padding: 8px 16px;
          background-color: {COLORS.bgLow};
          transition: all 0.15s ease;
        "
      >View Covenant</a>
      <button
        onclick={() => showNewChar = true}
        disabled={!session.userId}
        style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.white};
          background-color: {session.userId ? COLORS.red : COLORS.inkMuted};
          border: none;
          padding: 8px 16px;
          cursor: {session.userId ? 'pointer' : 'not-allowed'};
        "
      >New Character</button>
    </div>
  </div>

  {#if !session.userId}
    <p style="
      font-family: {S.fontBody};
      font-size: 14px;
      color: {COLORS.inkMuted};
      text-align: center;
      padding: 64px 0;
    ">
      <a href="/auth/login" style="color: {COLORS.red};">Sign in</a> to view your characters.
    </p>
  {:else if characters.length === 0}
    <p style="
      font-family: {S.fontBody};
      font-size: 14px;
      color: {COLORS.inkMuted};
      text-align: center;
      padding: 64px 0;
    ">No characters yet. Click "New Character" to create one.</p>
  {:else}
    <div style="margin-bottom: 32px;">
      <p style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: {COLORS.red};
        margin-bottom: 16px;
      ">My Characters</p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        {#each characters as char}
          <a href="/character"
            onclick={() => { setActiveCharacterById(char.id); }}
            style="
              display: block;
              text-decoration: none;
              background-color: {COLORS.bgLow};
              border: 1px solid {COLORS.outlineVar};
              border-radius: 6px;
              overflow: hidden;
              transition: box-shadow 0.15s ease, border-color 0.15s ease;
            "
            onmouseenter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = COLORS.red;
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            onmouseleave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar;
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div style="
              background-color: {COLORS.ink};
              padding: 12px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <span style="
                font-family: {S.fontHeadline};
                font-size: 16px;
                font-weight: 800;
                color: {COLORS.white};
              ">{char.name}</span>
              <span style="
                font-family: {S.fontBody};
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: {COLORS.red};
                font-weight: 700;
              ">{char.type}</span>
            </div>

            <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: {COLORS.inkMuted};
                ">House</span>
                <span style="
                  font-family: {S.fontBody};
                  font-size: 13px;
                  font-weight: 600;
                  color: {COLORS.ink};
                ">{char.hermeticData?.house ?? '—'}</span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: {COLORS.inkMuted};
                ">Covenant</span>
                <span style="
                  font-family: {S.fontBody};
                  font-size: 13px;
                  font-weight: 600;
                  color: {COLORS.ink};
                ">{char.covenant}</span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: {COLORS.inkMuted};
                ">Age</span>
                <span style="
                  font-family: {S.fontBody};
                  font-size: 13px;
                  font-weight: 600;
                  color: {COLORS.ink};
                ">{char.age}</span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: {COLORS.inkMuted};
                ">Player</span>
                <span style="
                  font-family: {S.fontBody};
                  font-size: 13px;
                  font-weight: 600;
                  color: {COLORS.ink};
                ">{char.player}</span>
              </div>

              <div style="height: 1px; background-color: {COLORS.outlineVar}; margin: 4px 0;" />

              <p style="
                font-family: {S.fontBody};
                font-size: 12px;
                font-style: italic;
                color: {COLORS.inkMuted};
                line-height: 1.5;
              ">{char.description}</p>
            </div>

            <div style="
              padding: 10px 16px;
              border-top: 1px solid {COLORS.outlineVar};
              background-color: {COLORS.bgHigh};
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <span style="
                font-family: {S.fontBody};
                font-size: 11px;
                color: {COLORS.inkMuted};
              ">Warping: {char.warpingPoints} · Decrepitude: {char.decrepitudePoints}</span>
              <span style="
                font-family: {S.fontBody};
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: {COLORS.red};
              ">Open →</span>
            </div>
          </a>
        {/each}

        <button
          onclick={() => showNewChar = true}
          style="
            background-color: transparent;
            border: 1px dashed {COLORS.outlineVar};
            border-radius: 6px;
            padding: 32px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.15s ease;
            min-height: 200px;
          "
          onmouseenter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = COLORS.red;
            (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgLow;
          }}
          onmouseleave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar;
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          <span style="font-size: 32px; color: {COLORS.outlineVar};">+</span>
          <span style="
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
          ">New Character</span>
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showNewChar}
  <div
    role="presentation"
    style="
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.4);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    "
    onclick={() => showNewChar = false}
    onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)}
  >
    <div
      role="dialog"
      style="
        background-color: {COLORS.white};
        border: 1px solid {COLORS.outlineVar};
        border-radius: 8px;
        padding: 32px;
        width: 400px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-sizing: border-box;
      "
      onclick={(e) => e.stopPropagation()}
    >
      <h2 style="
        font-family: {S.fontHeadline};
        font-size: 20px;
        font-weight: 800;
        color: {COLORS.ink};
        margin: 0;
      ">New Character</h2>

      {#if createError}
        <div style="
          padding: 10px 14px;
          background-color: #ffdad6;
          border: 1px solid {COLORS.red};
          border-radius: 4px;
          font-family: {S.fontBody};
          font-size: 12px;
          color: {COLORS.red};
        ">{createError}</div>
      {/if}

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="new-char-name" style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Name</label>
        <input
          id="new-char-name"
          type="text"
          bind:value={newName}
          required
          style="
            padding: 10px 12px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            background-color: {COLORS.bgLow};
            outline: none;
            box-sizing: border-box;
            width: 100%;
          "
        />
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="new-char-type" style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Type</label>
        <select
          id="new-char-type"
          bind:value={newType}
          style="
            padding: 10px 12px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            background-color: {COLORS.bgLow};
            outline: none;
            box-sizing: border-box;
            width: 100%;
          "
        >
          <option value="MAGUS">Magi</option>
          <option value="COMPANION">Companion</option>
          <option value="GROG">Grog</option>
        </select>
      </div>

      <div style="display: flex; gap: 8px;">
        <button
          onclick={handleCreate}
          disabled={creating || !newName}
          style="
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 4px;
            background-color: {creating || !newName ? COLORS.inkMuted : COLORS.red};
            color: {COLORS.white};
            font-family: {S.fontBody};
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            cursor: {creating || !newName ? 'not-allowed' : 'pointer'};
          "
        >{creating ? 'Creating...' : 'Create'}</button>
        <button
          onclick={() => showNewChar = false}
          style="
            flex: 1;
            padding: 12px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            background-color: {COLORS.bgLow};
            color: {COLORS.inkMuted};
            font-family: {S.fontBody};
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            cursor: pointer;
          "
        >Cancel</button>
      </div>
    </div>
  </div>
{/if}
