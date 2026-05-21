<script lang="ts">
  import { COLORS, S } from '$lib/constants';

  const charLabels: [string, string][] = [
    ['Int/Cun', 'intelligence'],
    ['Per', 'perception'],
    ['Str', 'strength'],
    ['Sta', 'stamina'],
    ['Pre', 'presence'],
    ['Com', 'communication'],
    ['Dex', 'dexterity'],
    ['Qik', 'quickness'],
  ];
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
    ">Familiar</span>
  </div>

  <div style="
    padding: 12px;
    font-family: {S.fontBody};
    font-size: 13px;
    font-style: italic;
    color: {COLORS.inkMuted};
    border-bottom: 1px solid {COLORS.outlineVar};
  ">No familiar bonded.</div>

  <!-- Cords -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid {COLORS.outlineVar};
  ">
    {#each [['Bronze Cord', '0'], ['Silver Cord', '0'], ['Gold Cord', '0']] as [label, value]}
      <div style="
        padding: 8px 12px;
        text-align: center;
        border-right: 1px solid {COLORS.outlineVar};
      ">
        <div style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: {COLORS.inkMuted};
          margin-bottom: 4px;
        ">{label}</div>
        <div style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {COLORS.ink};
        ">{value}</div>
      </div>
    {/each}
  </div>

  <!-- Bond Qualities -->
  <div style="padding: 10px 12px;">
    <div style="
      font-family: {S.fontBody};
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.inkMuted};
      margin-bottom: 6px;
    ">Bond Qualities & Abilities</div>
    <p style="
      font-family: {S.fontBody};
      font-size: 13px;
      font-style: italic;
      color: {COLORS.inkMuted};
    ">None yet.</p>
  </div>
</div>