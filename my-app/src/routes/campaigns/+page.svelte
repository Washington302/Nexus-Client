<script lang="ts">
  import { onMount } from 'svelte';
  import { COLORS, S } from '$lib/constants';
  import { api } from '$lib/services/api';
  import { session, loadCampaigns, setActiveCampaign } from '$lib/stores/session.svelte';
  import type { Campaign } from '$lib/types/campaign';

  let campaigns = $state<Campaign[]>([]);
  let loading = $state(true);
  let showCreate = $state(false);
  let newName = $state('');
  let newTribunal = $state('');
  let creating = $state(false);
  let createError = $state('');

  onMount(async () => {
    try {
      campaigns = await api.campaign.list();
    } catch { /* ignore */ }
    loading = false;
  });

  async function handleCreate() {
    if (!newName.trim()) return;
    creating = true;
    createError = '';
    try {
      await api.campaign.create(newName.trim(), newTribunal.trim());
      campaigns = await api.campaign.list();
      showCreate = false;
      newName = '';
      newTribunal = '';
      await loadCampaigns();
    } catch (e) {
      createError = (e as Error).message || 'Failed to create';
    } finally {
      creating = false;
    }
  }

  async function selectCampaign(c: Campaign) {
    await setActiveCampaign(c.id);
  }

  async function handleDelete(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.campaign.delete(id);
      campaigns = await api.campaign.list();
      if (session.activeCampaignId === id) {
        session.activeCampaign = null;
        session.activeCampaignId = null;
      }
    } catch { /* ignore */ }
  }
</script>

<div style="max-width: 1440px; margin: 0 auto; padding: 32px; box-sizing: border-box;">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
    <div>
      <h1 style="font-family:{S.fontHeadline}; font-size:28px; font-weight:800; color:{COLORS.ink}; margin:0 0 4px 0;">Campaigns</h1>
      <p style="font-family:{S.fontBody}; font-size:13px; color:{COLORS.inkMuted}; margin:0;">Ars Magica sagas and campaigns</p>
    </div>
    <button onclick={() => showCreate = true} style="padding:8px 16px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">+ New Campaign</button>
  </div>

  {#if loading}
    <p style="font-family:{S.fontBody}; font-size:13px; color:{COLORS.inkMuted};">Loading...</p>
  {:else if campaigns.length === 0}
    <div style="padding:40px; text-align:center; background:{COLORS.bgLow}; border:1px dashed {COLORS.outlineVar}; border-radius:8px;">
      <p style="font-family:{S.fontBody}; font-size:14px; color:{COLORS.inkMuted};">No campaigns yet. Create your first Ars Magica saga!</p>
    </div>
  {:else}
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
      {#each campaigns as c}
        <div onclick={() => selectCampaign(c)}
          style="display:flex; flex-direction:column; gap:8px; padding:20px; background:{COLORS.bgLow}; border:2px solid {c.id === session.activeCampaignId ? COLORS.red : COLORS.outlineVar}; border-radius:8px; cursor:pointer; transition:border-color 0.15s;"
          onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.red}
          onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = c.id === session.activeCampaignId ? COLORS.red : COLORS.outlineVar}
          role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && selectCampaign(c)}
        >
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <span style="font-family:{S.fontHeadline}; font-size:18px; font-weight:800; color:{COLORS.ink};">{c.name}</span>
            <button onclick={(e: MouseEvent) => handleDelete(c.id, e)} style="background:none; border:none; color:{COLORS.inkMuted}; cursor:pointer; font-size:16px; padding:2px 6px;">×</button>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            {#if 'tribunalRegion' in c}
              <span style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted};">{(c as { tribunalRegion?: string }).tribunalRegion ?? ''}</span>
            {/if}
            <span style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted};">{c.gameSystem}</span>
          </div>
          <div style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted};">
            {c.members.length} member{c.members.length !== 1 ? 's' : ''} · {c.sharedCharacters.length} character{c.sharedCharacters.length !== 1 ? 's' : ''}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Create Modal -->
{#if showCreate}
  <div style="position:fixed; inset:0; z-index:500; display:flex; align-items:center; justify-content:center; background-color:rgba(0,0,0,0.4);"
    onclick={() => showCreate = false} onkeydown={(e) => e.key === 'Escape' && (showCreate = false)}
  >
    <div onclick={(e) => e.stopPropagation()} style="background:{COLORS.white}; border-radius:8px; padding:32px; width:400px; display:flex; flex-direction:column; gap:20px;">
      <h2 style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink}; margin:0;">New Campaign</h2>

      {#if createError}
        <div style="padding:10px 14px; background:#ffdad6; border:1px solid {COLORS.red}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; color:{COLORS.red};">{createError}</div>
      {/if}

      <div style="display:flex; flex-direction:column; gap:4px;">
        <label for="camp-name" style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Name</label>
        <input id="camp-name" type="text" bind:value={newName} required style="padding:10px 12px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:14px; color:{COLORS.ink}; background:{COLORS.bgLow}; outline:none; width:100%; box-sizing:border-box;" />
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <label for="camp-tribunal" style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Tribunal Region</label>
        <input id="camp-tribunal" type="text" bind:value={newTribunal} placeholder="e.g. Rhine Tribunal" style="padding:10px 12px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:14px; color:{COLORS.ink}; background:{COLORS.bgLow}; outline:none; width:100%; box-sizing:border-box;" />
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick={handleCreate} disabled={creating || !newName} style="flex:1; padding:12px; border:none; border-radius:4px; background:{creating || !newName ? COLORS.inkMuted : COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; cursor:{creating || !newName ? 'not-allowed' : 'pointer'};">{creating ? 'Creating...' : 'Create'}</button>
        <button onclick={() => showCreate = false} style="flex:1; padding:12px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer;">Cancel</button>
      </div>
    </div>
  </div>
{/if}
