<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Weapon } from '$lib/types';
  import Modal from './Modal.svelte';

  let {
    open = $bindable(false),
    onSave = (_w: Weapon) => {},
  } = $props<{
    open: boolean;
    onSave: (weapon: Weapon) => void;
  }>();

  let name = $state('');
  let ability = $state('');
  let baseInitiativeMod = $state(0);
  let baseAttackMod = $state(0);
  let baseDefenseMod = $state(0);
  let baseDamageMod = $state(0);
  let minimumStrength = $state(0);
  let load = $state(0);
  let cost: Weapon['cost'] = $state('Standard');
  let missile = $state(false);
  let range = $state(0);
  let requiresTwoHands = $state(false);
  let shield = $state(false);

  function reset() {
    name = ''; ability = ''; baseInitiativeMod = 0; baseAttackMod = 0; baseDefenseMod = 0;
    baseDamageMod = 0; minimumStrength = 0; load = 0; cost = 'Standard';
    missile = false; range = 0; requiresTwoHands = false; shield = false;
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name, ability, baseInitiativeMod, baseAttackMod, baseDefenseMod, baseDamageMod, minimumStrength, load, cost, missile, range, requiresTwoHands, shield, equipped: false });
    reset();
    open = false;
  }
</script>

<Modal bind:open title="Add Weapon">
  {#snippet children()}
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Name</span>
        <input type="text" bind:value={name} style="width:100%; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; box-sizing:border-box;" />
      </div>
      <div>
        <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Ability</span>
        <input type="text" bind:value={ability} placeholder="e.g. Brawl, Single Weapon" style="width:100%; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; box-sizing:border-box;" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; gap: 8px;">
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Init</span><input type="number" bind:value={baseInitiativeMod} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Atk</span><input type="number" bind:value={baseAttackMod} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Dfn</span><input type="number" bind:value={baseDefenseMod} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Dam</span><input type="number" bind:value={baseDamageMod} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Load</span><input type="number" bind:value={load} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Str Min</span><input type="number" bind:value={minimumStrength} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
      </div>
      <div>
        <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Cost</span>
        <select bind:value={cost} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
          <option value="Inexpensive">Inexpensive</option>
          <option value="Standard">Standard</option>
          <option value="Expensive">Expensive</option>
        </select>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <label style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.ink}; display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" bind:checked={missile} /> Missile
        </label>
        <label style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.ink}; display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" bind:checked={requiresTwoHands} /> Two-Handed
        </label>
        <label style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.ink}; display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" bind:checked={shield} /> Shield
        </label>
        {#if missile || range > 0}
          <label style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.ink}; display:flex; align-items:center; gap:4px;">
            Range <input type="number" bind:value={range} style="width:48px; padding:3px 4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center;" />
          </label>
        {/if}
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid {COLORS.outlineVar}; padding-top: 12px; margin-top: 4px;">
        <button onclick={() => { reset(); open = false; }} style="padding:8px 16px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; font-family:{S.fontBody}; font-size:12px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
        <button onclick={handleSave} disabled={!name.trim()} style="padding:8px 16px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:600; cursor:pointer; opacity:{!name.trim() ? 0.5 : 1};">Add Weapon</button>
      </div>
    </div>
  {/snippet}
</Modal>