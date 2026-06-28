<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Armor } from '$lib/types/combat';
  import Modal from './Modal.svelte';

  let {
    open = $bindable(false),
    onSave = (_a: Armor) => {},
  } = $props<{
    open: boolean;
    onSave: (piece: Armor) => void;
  }>();

  let materialName = $state('');
  let coverage: Armor['coverage'] = $state('PARTIAL');
  let quality: Armor['quality'] = $state('STANDARD');
  let protection = $state(0);
  let load = $state(0);
  let perceptionPenalty = $state(0);
  let costTier: Armor['costTier'] = $state('STANDARD');
  let purchasePoints = $state(0);
  let damageLevels = $state(0);
  let targetSize = $state(0);
  let magical = $state(false);

  function reset() {
    materialName = ''; coverage = 'PARTIAL'; quality = 'STANDARD'; protection = 0; load = 0;
    perceptionPenalty = 0; costTier = 'STANDARD'; purchasePoints = 0; damageLevels = 0; targetSize = 0; magical = false;
  }

  function handleSave() {
    if (!materialName.trim()) return;
    onSave({ id: '', materialName, coverage, protection, load, quality, perceptionPenalty, costTier, purchasePoints, damageLevels, targetSize, worn: false, magical });
    reset();
    open = false;
  }
</script>

<Modal bind:open title="Add Armor">
  {#snippet children()}
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Material Name</span>
        <input type="text" bind:value={materialName} style="width:100%; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; box-sizing:border-box;" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div>
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Coverage</span>
          <select bind:value={coverage} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
            <option value="PARTIAL">Partial</option>
            <option value="FULL">Full</option>
          </select>
        </div>
        <div>
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Quality</span>
          <select bind:value={quality} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
            <option value="SHODDY">Shoddy</option>
            <option value="STANDARD">Standard</option>
            <option value="SUPERIOR">Superior</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="WONDROUS">Wondrous</option>
          </select>
        </div>
        <div>
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Cost Tier</span>
          <select bind:value={costTier} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
            <option value="INEXPENSIVE">Inexpensive</option>
            <option value="STANDARD">Standard</option>
            <option value="EXPENSIVE">Expensive</option>
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Protection</span><input type="number" bind:value={protection} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Load</span><input type="number" bind:value={load} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Perception Pen</span><input type="number" bind:value={perceptionPenalty} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        <div><span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Damage Levels</span><input type="number" bind:value={damageLevels} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <label style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.ink}; display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" bind:checked={magical} /> Magical
        </label>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid {COLORS.outlineVar}; padding-top: 12px; margin-top: 4px;">
        <button onclick={() => { reset(); open = false; }} style="padding:8px 16px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; font-family:{S.fontBody}; font-size:12px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
        <button onclick={handleSave} disabled={!materialName.trim()} style="padding:8px 16px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:600; cursor:pointer; opacity:{!materialName.trim() ? 0.5 : 1};">Add Armor</button>
      </div>
    </div>
  {/snippet}
</Modal>