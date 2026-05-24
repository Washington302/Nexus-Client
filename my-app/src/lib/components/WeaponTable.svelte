<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Weapon } from '$lib/types';

  let { weapons = [] } = $props<{ weapons: Weapon[] }>();

  const headers = ['Weapon', 'Init', 'Atk', 'Dfn', 'Dam', 'Load', 'Range'];
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <!-- Header -->
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
    ">Weapons</span>
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
      </tr>
    </thead>
    <tbody>
      {#each weapons as weapon, i}
        <tr style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};">
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            font-weight: 600;
            color: {COLORS.ink};
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">
            {weapon.name}
            {#if weapon.equipped}
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
          ">{weapon.baseInitiativeMod}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{weapon.baseAttackMod}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{weapon.baseDefenseMod}</td>
          <td style="
            font-family: {S.fontHeadline};
            font-size: 14px;
            font-weight: 700;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{weapon.baseDamageMod}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{weapon.load}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{weapon.range === 0 ? '—' : weapon.range}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>