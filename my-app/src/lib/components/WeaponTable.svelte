<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Weapon } from '$lib/types';
  import type { BaseCharacteristics } from '$lib/types/shared';
  import type { Ability } from '$lib/types/character';
  import AddWeaponModal from './AddWeaponModal.svelte';

  let {
    weapons = [],
    characteristics,
    abilities = {},
    encumbrance = 0,
    isEditable = false,
    onAdd,
    onRemove,
    onEquip,
    onUnequip,
  } = $props<{
    weapons: Weapon[];
    characteristics?: BaseCharacteristics;
    abilities?: Record<string, Ability>;
    encumbrance?: number;
    isEditable?: boolean;
    onAdd?: (weapon: Weapon) => void;
    onRemove?: (name: string) => void;
    onEquip?: (name: string) => void;
    onUnequip?: (name: string) => void;
  }>();

  const stats = $derived.by(() => {
    const qik = characteristics?.scores?.QUICKNESS ?? 0;
    const dex = characteristics?.scores?.DEXTERITY ?? 0;
    const str = characteristics?.scores?.STRENGTH ?? 0;

    return weapons.map((w: Weapon) => {
      const ab = abilities[w.ability];
      const abScore = ab?.score ?? 0;
      const spec = ab?.specialty && w.name.toLowerCase().includes(ab.specialty.toLowerCase()) ? 1 : 0;

      let atk = dex + abScore + w.baseAttackMod + spec;
      let dfn = qik + abScore + w.baseDefenseMod + spec;

      if (str < w.minimumStrength) {
        const deficit = w.minimumStrength - str;
        atk -= deficit;
        dfn -= deficit;
      }

      return {
        init: qik + w.baseInitiativeMod - encumbrance,
        atk,
        dfn,
        dam: str + w.baseDamageMod,
        weapon: w,
      };
    });
  });

  const headers = ['Weapon', 'Init', 'Atk', 'Dfn', 'Dam', 'Load', 'Range'];

  let showAddModal = $state(false);

  function fmt(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
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
  <div style="
    background-color: {COLORS.bgLow};
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 6px 12px;
    display: flex; justify-content: space-between; align-items: center;
  ">
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Weapons</span>
    <span style="text-align: right;">
      {#each stats as s}
        {#if s.weapon.equipped}
          <span style="font-family: {S.fontBody}; font-size: 10px; color: {COLORS.inkMuted}; margin-left: 8px;">
            {s.weapon.name} Init {fmt(s.init)} Atk {fmt(s.atk)} Dfn {fmt(s.dfn)} Dam {fmt(s.dam)}
          </span>
        {/if}
      {/each}
    </span>
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background-color: {COLORS.bgHigh};">
        {#each headers as header}
          <th style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            padding: 6px 12px;
            text-align: {header === 'Weapon' ? 'left' : 'center'};
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
      {#each stats as { weapon: w, init, atk, dfn, dam }, i}
        <tr style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};">
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            font-weight: 600;
            color: {COLORS.ink};
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">
            {w.name}
            {#if w.equipped}
              <span style="
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: {COLORS.red};
                margin-left: 6px;
              ">equipped</span>
            {/if}
          </td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{fmt(init)}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{fmt(atk)}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{fmt(dfn)}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{fmt(dam)}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{w.load}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{w.range === 0 ? '—' : w.range}</td>
          {#if isEditable}
            <td style="
              padding: 8px 12px;
              text-align: center;
              border-bottom: 1px solid {COLORS.outlineVar};
            ">
              <div style="display: flex; gap: 4px; justify-content: center;">
                {#if w.equipped}
                  <button onclick={() => onUnequip?.(w.name)} style="
                    font-size: 10px; padding: 2px 8px; cursor: pointer;
                    background: {COLORS.bgHigh}; border: 1px solid {COLORS.outlineVar};
                    border-radius: 4px; color: {COLORS.inkMuted};
                  ">Unequip</button>
                {:else}
                  <button onclick={() => onEquip?.(w.name)} style="
                    font-size: 10px; padding: 2px 8px; cursor: pointer;
                    background: {COLORS.bgHigh}; border: 1px solid {COLORS.outlineVar};
                    border-radius: 4px; color: {COLORS.ink};
                  ">Equip</button>
                {/if}
                <button onclick={() => onRemove?.(w.name)} style="
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
          <td colspan="8" style="padding: 8px 12px; border-bottom: 1px solid {COLORS.outlineVar}; text-align: center;">
            <button onclick={() => showAddModal = true} style="
              padding: 6px 16px; font-size: 11px; cursor: pointer;
              background: {COLORS.bgHigh}; border: 1px solid {COLORS.outlineVar};
              border-radius: 4px; color: {COLORS.ink};
              text-transform: uppercase; letter-spacing: 0.06em;
            ">+ Add Weapon</button>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<AddWeaponModal bind:open={showAddModal} onSave={(w) => onAdd?.(w)} />