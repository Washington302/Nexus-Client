<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { MagicalArt } from '$lib/types';
  import { artScoreFromXp } from '$lib/utils/arsmagica';

  let {
    arts = $bindable({} as Record<string, MagicalArt>),
  } = $props<{
    arts: Record<string, MagicalArt>;
  }>();

  let adding = $state(false);
  let newName = $state('');
  let newType = $state<'TECHNIQUE' | 'FORM' | 'ALTERNATIVE'>('ALTERNATIVE');
  let newExp = $state(0);

  function remove(key: string) {
    const { [key]: _, ...rest } = arts;
    arts = rest;
  }

  const entries = $derived(Object.entries(arts) as [string, MagicalArt][]);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <p style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; margin:0;">Techniques</p>
    {#each entries as [key, art]}
      {#if art.type === 'TECHNIQUE'}
        <div style="display:flex; align-items:center; gap:6px; padding:4px 0;">
          <span style="flex:1; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink};">{art.name}</span>
          <input type="number" min="0" value={art.exp} oninput={(e) => { const v = Number((e.target as HTMLInputElement).value); arts[key].exp = v; arts[key].score = artScoreFromXp(v); }} style="width:60px; padding:3px 5px; border:1px solid {COLORS.outlineVar}; border-radius:3px; font-family:{S.fontBody}; font-size:11px; text-align:center;" />
          <span style="width:24px; font-family:{S.fontHeadline}; font-size:13px; font-weight:700; text-align:center;">{art.score}</span>
          <button onclick={() => remove(key)} style="width:22px;height:22px;border:1px solid {COLORS.outlineVar};border-radius:50%;background:{COLORS.bgHigh};color:{COLORS.red};cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;line-height:1;" title="Remove">✕</button>
        </div>
      {/if}
    {/each}
  </div>

  <div style="display: flex; flex-direction: column; gap: 4px;">
    <p style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; margin:0;">Forms</p>
    {#each entries as [key, art]}
      {#if art.type === 'FORM'}
        <div style="display:flex; align-items:center; gap:6px; padding:4px 0;">
          <span style="flex:1; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink};">{art.name}</span>
          <input type="number" min="0" value={art.exp} oninput={(e) => { const v = Number((e.target as HTMLInputElement).value); arts[key].exp = v; arts[key].score = artScoreFromXp(v); }} style="width:60px; padding:3px 5px; border:1px solid {COLORS.outlineVar}; border-radius:3px; font-family:{S.fontBody}; font-size:11px; text-align:center;" />
          <span style="width:24px; font-family:{S.fontHeadline}; font-size:13px; font-weight:700; text-align:center;">{art.score}</span>
          <button onclick={() => remove(key)} style="width:22px;height:22px;border:1px solid {COLORS.outlineVar};border-radius:50%;background:{COLORS.bgHigh};color:{COLORS.red};cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;line-height:1;" title="Remove">✕</button>
        </div>
      {/if}
    {/each}
  </div>

  {#if adding}
    <div style="display:flex; flex-direction:column; gap:6px; padding:8px; border:1px dashed {COLORS.outlineVar}; border-radius:6px;">
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="text" bind:value={newName} placeholder="Art name" style="flex:1; padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;" />
        <select bind:value={newType} style="padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:11px;">
          <option value="TECHNIQUE">Technique</option>
          <option value="FORM">Form</option>
          <option value="ALTERNATIVE">Alternative</option>
        </select>
      </div>
      <div style="display:flex; gap:6px;">
        <button onclick={() => { if (newName) { arts[newName] = { name: newName, exp: newExp, score: artScoreFromXp(newExp), type: newType }; arts = { ...arts }; newName = ''; newExp = 0; adding = false; } }} disabled={!newName} style="padding:4px 10px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.white}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;">Add</button>
        <button onclick={() => adding = false} style="padding:4px 10px; border:none; background:transparent; font-family:{S.fontBody}; font-size:11px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
      </div>
    </div>
  {:else}
    <button onclick={() => adding = true} style="padding:6px 12px; border:1px dashed {COLORS.outlineVar}; border-radius:6px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; cursor:pointer; text-align:center;">+ Add Art</button>
  {/if}
</div>
