<script lang="ts">
  import { onMount } from 'svelte';
  import type { Covenant } from '$lib/types/covenant';
  import { api } from '$lib/services/api';
  import { session, loadActiveCharacter } from '$lib/stores/session.svelte';
  import { Tabs, CovenantHeader, ChipList, Inhabitants, Library, Reputations, Finances, Possessions, CovenantVis, CovenantCalendar } from '$lib/components';
  import { COLORS, S } from '$lib/constants';

  let covenant = $state<Covenant | null>(null);
  let loading = $state(true);

  // Create dialog
  let showCreate = $state(false);
  let newName = $state('');
  let newTribunal = $state('');
  let creating = $state(false);
  let createError = $state<string | null>(null);
  let showJoin = $state(false);
  let joinCovId = $state('');
  let joining = $state(false);
  let joinError = $state<string | null>(null);

  const tabList = ['Inhabitants', 'Library', 'Possessions', 'Finances', 'Calendar', 'Vis Sources'];
  let activeTab = $state('Inhabitants');

  async function loadCovenant() {
    loading = true;
    try {
      const charId = session.activeCharacter?.covenantId;
      if (charId) {
        const cov = await api.covenant.get(charId);
        const [lib, labs, vis, magic] = await Promise.all([
          api.covenant.library.get(charId).catch(() => null),
          api.covenant.laboratories.get(charId).catch(() => null),
          api.covenant.vis.get(charId).catch(() => null),
          api.covenant.magicItems.get(charId).catch(() => null),
        ]);
        covenant = {
          ...cov,
          books: lib?.books,
          labTextLevels: lib?.labTextLevels,
          castingTabletLevels: lib?.castingTabletLevels,
          laboratories: labs?.laboratories,
          visSources: vis?.visSources,
          visStocks: vis?.visStocks,
          magicItems: magic?.magicItems,
        };
      } else {
        covenant = null;
      }
    } catch {
      covenant = null;
    } finally {
      loading = false;
    }
  }

  async function addCharacterToCovenant(charId: string, charType: string, covId: string) {
    const cov = await api.covenant.get(covId);
    const listKey = charType === 'MAGUS' ? 'magiIds' : charType === 'COMPANION' ? 'companionIds' : 'namedGrogIds';
    if (!cov[listKey].includes(charId)) {
      cov[listKey] = [...cov[listKey], charId];
    }
    return api.covenant.update(covId, cov);
  }

  async function handleCreate() {
    creating = true;
    createError = null;
    try {
      covenant = await api.covenant.create(newName, newTribunal);
      if (session.activeCharacter) {
        await api.character.patch(session.activeCharacter.id, 'covenantId', covenant.id);
        await api.character.patch(session.activeCharacter.id, 'covenant', covenant.name);
        await addCharacterToCovenant(session.activeCharacter.id, session.activeCharacter.type, covenant.id);
      }
      showCreate = false;
      newName = '';
      newTribunal = '';
    } catch (e) {
      createError = (e as Error).message;
    } finally {
      creating = false;
    }
  }

  onMount(loadCovenant);
</script>

<div style="
  background-color: {COLORS.bg}; 
  min-height: 100vh; 
  box-sizing: border-box;
  display: flex; 
  justify-content: center; 
  padding: 32px;
">
  <div style="
    width: 100%; 
    display: flex; 
    flex-direction: column; 
    gap: 32px;
  ">
    {#if loading}
      <p style="font-family: {S.fontBody}; color: {COLORS.inkMuted};">Loading covenant...</p>
    {:else if covenant}
      <header style="width: 100%;">
        <CovenantHeader {covenant} />
      </header>

      <div style="
        display: grid; 
        grid-template-columns: 280px 1fr; 
        gap: 32px; 
        align-items: start;
      ">
        <aside style="
          background-color: {COLORS.bgLow}; 
          border: 1px solid rgba(51, 65, 85, 0.5); 
          padding: 24px; 
          border-radius: 16px; 
          display: flex; 
          flex-direction: column; 
          gap: 24px;
        ">
          <div>
            <ChipList
              virtues={covenant.boons}
              flaws={covenant.hooks}
              virtuesLabel="Boons"
              flawsLabel="Hooks"
            />
          </div>
          <div style="border-top: 1px solid; margin: 4px 0;"></div>
          <div>
            <Reputations reputations={covenant.reputations} />
          </div>
          <div style="border-top: 1px solid; margin: 4px 0;"></div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:{COLORS.inkMuted};">Share & Link</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <code style="flex:1; font-size:11px; padding:4px 6px; background:{COLORS.bgLow}; border:1px solid {COLORS.outlineVar}; border-radius:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{covenant!.id}</code>
              <button onclick={() => navigator.clipboard.writeText(covenant!.id)} style="padding:4px 8px; border:1px solid {COLORS.outlineVar}; border-radius:3px; background:{COLORS.white}; font-family:{S.fontBody}; font-size:10px; cursor:pointer; white-space:nowrap; flex-shrink:0;">Copy</button>
            </div>
            <p style="font-family:{S.fontBody}; font-size:10px; color:{COLORS.inkMuted}; margin:0; line-height:1.4;">Share this ID with other players. They can link their characters to this covenant from the character page.</p>
          </div>
        </aside>

        <section style="display: flex; flex-direction: column; gap: 20px; border: 1px solid; padding: 24px; border-radius: 16px;">
          <div style="padding: 8px; border-radius: 12px;">
            <Tabs tabs={tabList} bind:activeTab={activeTab} />
          </div>
          <main style="
            padding: 32px; 
            border-radius: 16px; 
            min-height: 500px;
            max-height: 500px;
            overflow-y: auto;
            scrollbar-width: none;
            box-sizing: border-box;
          ">
            {#if activeTab === 'Inhabitants'}
              <Inhabitants {covenant} />
            {:else if activeTab === 'Library'}
              <Library {covenant} />
            {:else if activeTab === 'Possessions'}
              <Possessions {covenant} />
            {:else if activeTab === 'Finances'}
              <Finances {covenant} />
            {:else if activeTab === 'Calendar'}
              <CovenantCalendar {covenant} />
            {:else if activeTab === 'Vis Sources'}
              <CovenantVis {covenant} />
            {/if}
          </main>
        </section>
      </div>
    {:else}
      <div style="text-align: center; padding: 64px 0;">
        <p style="font-family: {S.fontBody}; font-size: 14px; color: {COLORS.inkMuted}; margin-bottom: 24px;">
          No covenant linked to this character.
        </p>
        {#if session.userId}
          <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <button
              onclick={() => showCreate = true}
              style="
                padding: 12px 24px;
                border: none;
                border-radius: 4px;
                background-color: {COLORS.red};
                color: {COLORS.white};
                font-family: {S.fontBody};
                font-size: 13px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                cursor: pointer;
              "
            >Create Covenant</button>
            <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">or</span>
            {#if showJoin}
              <div style="display: flex; flex-direction: column; gap: 8px; width: 320px;">
                <input type="text" bind:value={joinCovId} placeholder="Paste covenant ID" style="padding:10px 12px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; text-align:center;" />
                {#if joinError}
                  <p style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.red}; margin:0;">{joinError}</p>
                {/if}
                <div style="display: flex; gap: 8px;">
                  <button onclick={async () => { if (!joinCovId || !session.activeCharacter) return; joining = true; joinError = null; try { await api.character.patch(session.activeCharacter.id, 'covenantId', joinCovId); await addCharacterToCovenant(session.activeCharacter.id, session.activeCharacter.type, joinCovId); await loadActiveCharacter(); await loadCovenant(); showJoin = false; joinCovId = ''; } catch { joinError = 'Failed to join covenant. Check the ID.'; } finally { joining = false; } }} disabled={joining || !joinCovId} style="flex:1; padding:10px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; opacity:{joining || !joinCovId ? 0.5 : 1};">{joining ? 'Joining...' : 'Join'}</button>
                  <button onclick={() => { showJoin = false; joinCovId = ''; joinError = null; }} style="padding:10px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:transparent; font-family:{S.fontBody}; font-size:12px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
                </div>
              </div>
            {:else}
              <button onclick={() => showJoin = true} style="padding:8px 16px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; cursor:pointer;">Join Existing Covenant</button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showCreate}
  <div
    role="presentation"
    style="
      position: fixed; inset: 0; background-color: rgba(0,0,0,0.4); z-index: 500;
      display: flex; align-items: center; justify-content: center;
    "
    onclick={() => showCreate = false}
    onkeydown={(e) => e.key === 'Escape' && (showCreate = false)}
  >
    <div
      role="dialog"
      style="
        background-color: {COLORS.white}; border: 1px solid {COLORS.outlineVar};
        border-radius: 8px; padding: 32px; width: 400px;
        display: flex; flex-direction: column; gap: 20px; box-sizing: border-box;
      "
      onclick={(e) => e.stopPropagation()}
    >
      <h2 style="font-family: {S.fontHeadline}; font-size: 20px; font-weight: 800; color: {COLORS.ink}; margin: 0;">
        Create Covenant
      </h2>

      {#if createError}
        <div style="padding: 10px 14px; background-color: #ffdad6; border: 1px solid {COLORS.red}; border-radius: 4px; font-family: {S.fontBody}; font-size: 12px; color: {COLORS.red};">
          {createError}
        </div>
      {/if}

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="cov-name" style="font-family: {S.fontBody}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: {COLORS.inkMuted};">Name</label>
        <input id="cov-name" type="text" bind:value={newName} required style="
          padding: 10px 12px; border: 1px solid {COLORS.outlineVar}; border-radius: 4px;
          font-family: {S.fontBody}; font-size: 14px; color: {COLORS.ink};
          background-color: {COLORS.bgLow}; outline: none; box-sizing: border-box; width: 100%;
        " />
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="cov-tribunal" style="font-family: {S.fontBody}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: {COLORS.inkMuted};">Tribunal</label>
        <input id="cov-tribunal" type="text" bind:value={newTribunal} required style="
          padding: 10px 12px; border: 1px solid {COLORS.outlineVar}; border-radius: 4px;
          font-family: {S.fontBody}; font-size: 14px; color: {COLORS.ink};
          background-color: {COLORS.bgLow}; outline: none; box-sizing: border-box; width: 100%;
        " />
      </div>

      <div style="display: flex; gap: 8px;">
        <button
          onclick={handleCreate}
          disabled={creating || !newName || !newTribunal}
          style="
            flex: 1; padding: 12px; border: none; border-radius: 4px;
            background-color: {creating || !newName || !newTribunal ? COLORS.inkMuted : COLORS.red};
            color: {COLORS.white}; font-family: {S.fontBody}; font-size: 13px;
            font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
            cursor: {creating || !newName || !newTribunal ? 'not-allowed' : 'pointer'};
          "
        >{creating ? 'Creating...' : 'Create'}</button>
        <button
          onclick={() => showCreate = false}
          style="
            flex: 1; padding: 12px; border: 1px solid {COLORS.outlineVar}; border-radius: 4px;
            background-color: {COLORS.bgLow}; color: {COLORS.inkMuted};
            font-family: {S.fontBody}; font-size: 13px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;
          "
        >Cancel</button>
      </div>
    </div>
  </div>
{/if}


