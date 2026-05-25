<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import { longevityRitualAgeRollModifier, longevityRitualBonus, longevityRitualVisCost } from '$lib/utils/arsmagica';

  let { warpingPoints = 0 } = $props<{ warpingPoints: number }>();

  let labTotal = $state(0);
  let age = $state(35);

  const ageRollModifier = $derived(longevityRitualAgeRollModifier(age));
  const ritualBonus = $derived(longevityRitualBonus(labTotal));
  const visCost = $derived(longevityRitualVisCost(age));
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
    ">Longevity Ritual</span>
  </div>

  <!-- Inputs -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
  ">
    <div>
      <label style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Lab Total</label>
      <input
        type="number"
        bind:value={labTotal}
        style="
          width: 100%;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
          border: 1px solid {COLORS.outlineVar};
          padding: 4px 8px;
          box-sizing: border-box;
        "
      />
    </div>

    <div>
      <label style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Age</label>
      <input
        type="number"
        bind:value={age}
        style="
          width: 100%;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
          border: 1px solid {COLORS.outlineVar};
          padding: 4px 8px;
          box-sizing: border-box;
        "
      />
    </div>
  </div>

  <!-- Computed values -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid {COLORS.outlineVar};
  ">
    {#each [
      ['Age Roll Modifier', ageRollModifier, ageRollModifier < 0],
      ['Ritual Bonus', `+${ritualBonus}`, ritualBonus > 0],
      ['Vis Cost', `${visCost} pawns`, false],
    ] as [label, value, highlight]}
      <div style="
        padding: 10px 12px;
        text-align: center;
        border-right: 1px solid {COLORS.outlineVar};
      ">
        <div style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          margin-bottom: 4px;
        ">{label}</div>
        <div style="
          font-family: {S.fontHeadline};
          font-size: 22px;
          font-weight: 800;
          color: {highlight ? COLORS.red : COLORS.ink};
        ">{value}</div>
      </div>
    {/each}
  </div>

  <!-- Twilight Scars -->
  <div style="padding: 10px 12px;">
    <div style="
      font-family: {S.fontBody};
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.inkMuted};
      margin-bottom: 6px;
    ">Twilight Scars</div>
    <p style="
      font-family: {S.fontBody};
      font-size: 13px;
      font-style: italic;
      color: {COLORS.inkMuted};
    ">None yet.</p>
  </div>
</div>