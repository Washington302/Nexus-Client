<script lang="ts">
  import { COLORS, S } from "$lib/constants";

  let { warpingPoints = 0 } = $props<{ warpingPoints: number }>();

  let labTotal = $state(0);
  let age = $state(35);
  const ageRollModifier = $derived(-Math.floor(age / 10));
</script>

<div
  style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
"
>
  <div
    style="
    background-color: {COLORS.bgLow};
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 6px 12px;
  "
  >
    <span
      style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Longevity Ritual</span
    >
  </div>

  <div
    style="
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    padding: 12px;
  "
  >
    <div>
      <label
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Lab Total</label
      >
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
      <label
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Age</label
      >
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

    <div style="text-align: center;">
      <div
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      "
      >
        Age Roll Modifier
      </div>
      <div
        style="
        font-family: {S.fontHeadline};
        font-size: 24px;
        font-weight: 800;
        color: {ageRollModifier < 0 ? COLORS.red : COLORS.ink};
      "
      >
        {ageRollModifier}
      </div>
    </div>
  </div>

  <div
    style="
    padding: 10px 12px;
    border-top: 1px solid {COLORS.outlineVar};
  "
  >
    <div
      style="
      font-family: {S.fontBody};
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.inkMuted};
      margin-bottom: 6px;
    "
    >
      Twilight Scars
    </div>
    <p
      style="
      font-family: {S.fontBody};
      font-size: 13px;
      font-style: italic;
      color: {COLORS.inkMuted};
    "
    >
      None yet.
    </p>
  </div>
</div>
