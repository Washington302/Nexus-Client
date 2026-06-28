<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Armor } from '$lib/types/combat';
  import type { Weapon } from '$lib/types';
  import type { BaseCharacteristics } from '$lib/types/shared';
  import AddArmorModal from './AddArmorModal.svelte';

  let {
    armor = [],
    weapons = [],
    characteristics,
    isEditable = false,
    onAdd,
    onRemove,
    onWear,
    onRemoveWorn,
  } = $props<{
    armor: Armor[];
    weapons?: Weapon[];
    characteristics?: BaseCharacteristics;
    isEditable?: boolean;
    onAdd?: (piece: Armor) => void;
    onRemove?: (name: string) => void;
    onWear?: (name: string) => void;
    onRemoveWorn?: (name: string) => void;
  }>();

  const str = $derived(characteristics?.scores?.STRENGTH ?? 0);
  const sta = $derived(characteristics?.scores?.STAMINA ?? 0);
  const wornArmor = $derived(armor.filter((p: Armor) => p.worn));
  const shieldLoad = $derived((weapons ?? []).filter((w: Weapon) => w.shield && w.equipped).reduce((sum: number, w: Weapon) => sum + w.load, 0));
  const totalArmorLoad = $derived(wornArmor.reduce((sum: number, p: Armor) => sum + p.load, 0));
  const totalLoad = $derived(totalArmorLoad + shieldLoad);
  const totalArmorProtection = $derived(wornArmor.reduce((sum: number, p: Armor) => sum + p.protection, 0));
  const encumbrance = $derived(Math.max(0, totalLoad - str));
  const soak = $derived(sta + totalArmorProtection);

  let showAddModal = $state(false);
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
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
    ">Armor & Load</span>
  </div>

  <div style="
    display: flex;
    gap: 24px;
    padding: 10px 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
    background-color: {COLORS.bgHigh};
  ">
    {#each [
      ['Soak', soak],
      ['Protection', totalArmorProtection],
      ['Total Load', totalLoad],
      ['Encumbrance', encumbrance],
    ] as [label, value]}
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <span style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">{label}</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {COLORS.ink};
        ">{value}</span>
      </div>
    {/each}
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background-color: {COLORS.bgHigh};">
        {#each ['Armor', 'Coverage', 'Protection', 'Load', 'Quality', 'Worn'] as header}
          <th style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            padding: 6px 12px;
            text-align: {header === 'Armor' ? 'left' : 'center'};
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{header}</th>
        {/each}
        {#if isEditable}
          <th style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            padding: 6px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">Actions</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each armor as piece, i}
        <tr style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};">
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            font-weight: 600;
            color: {COLORS.ink};
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.materialName}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 12px;
            color: {COLORS.inkMuted};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">{piece.coverage}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.protection}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.load}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 12px;
            color: {COLORS.inkMuted};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">{piece.quality}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {piece.worn ? COLORS.red : COLORS.inkMuted};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{piece.worn ? '✓' : '—'}</td>
          {#if isEditable}
            <td style="
              padding: 8px 12px;
              text-align: center;
              border-bottom: 1px solid {COLORS.outlineVar};
            ">
              <div style="display: flex; gap: 4px; justify-content: center;">
                {#if piece.worn}
                  <button onclick={() => onRemoveWorn?.(piece.materialName)} style="
                    font-size: 10px; padding: 2px 8px; cursor: pointer;
                    background: {COLORS.bgHigh}; border: 1px solid {COLORS.outlineVar};
                    border-radius: 4px; color: {COLORS.inkMuted};
                  ">Remove</button>
                {:else}
                  <button onclick={() => onWear?.(piece.materialName)} style="
                    font-size: 10px; padding: 2px 8px; cursor: pointer;
                    background: {COLORS.bgHigh}; border: 1px solid {COLORS.outlineVar};
                    border-radius: 4px; color: {COLORS.ink};
                  ">Wear</button>
                {/if}
                <button onclick={() => onRemove?.(piece.materialName)} style="
                  font-size: 10px; padding: 2px 8px; cursor: pointer;
                  background: none; border: 1px solid {COLORS.red}; border-radius: 4px; color: {COLORS.red};
                ">Remove</button>
              </div>
            </td>
          {/if}
        </tr>
      {/each}
      {#if isEditable}
        <tr>
          <td colspan="7" style="padding: 8px 12px; border-bottom: 1px solid {COLORS.outlineVar}; text-align: center;">
            <button onclick={() => showAddModal = true} style="
              padding: 6px 16px; font-size: 11px; cursor: pointer;
              background: {COLORS.bgHigh}; border: 1px solid {COLORS.outlineVar};
              border-radius: 4px; color: {COLORS.ink};
              text-transform: uppercase; letter-spacing: 0.06em;
            ">+ Add Armor</button>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<AddArmorModal bind:open={showAddModal} onSave={(a) => onAdd?.(a)} />