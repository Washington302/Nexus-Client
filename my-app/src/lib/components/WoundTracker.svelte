<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Wound } from '$lib/types';

  let { track, size = 0 } = $props<{ track: Wound[]; size: number }>();

  let localTrack = $state<Wound[]>(track.map((w: Wound) => ({ ...w })));

  function toggleWound(wi: number, bi: number) {
    const current = localTrack[wi].currentWounds;
    localTrack[wi] = {
      ...localTrack[wi],
      currentWounds: bi + 1 === current ? bi : bi + 1
    };
  }

  const thresholds: Record<string, string> = {
    LIGHT:         `1–${5 + size}`,
    MEDIUM:        `${6 + size}–${10 + size}`,
    HEAVY:         `${11 + size}–${15 + size}`,
    INCAPACITATED: `${16 + size}+`,
    DEAD:          `${21 + size}+`,
  };

  function penaltyDisplay(wound: Wound) {
    if (wound.penalty === 0) return '—';
    return `${wound.penalty}`;
  }

  function penaltyColor(penalty: number) {
    if (penalty <= -5) return COLORS.red;
    if (penalty <= -3) return '#b85c00';
    return COLORS.inkMuted;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  ">
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Wounds</span>
    <span style="
      font-family: {S.fontBody};
      font-size: 10px;
      font-style: italic;
      color: {COLORS.inkMuted};
    ">Size {size >= 0 ? '+' : ''}{size}</span>
  </div>

  <div style="
    display: grid;
    grid-template-columns: 130px 70px 60px 1fr;
    padding: 4px 12px;
    background-color: {COLORS.bgHigh};
    border-bottom: 1px solid {COLORS.outlineVar};
  ">
    {#each ['Wound', 'Range', 'Penalty', 'Boxes'] as header}
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">{header}</div>
    {/each}
  </div>

  {#each localTrack as wound, wi}
    {@const hasWounds = wound.currentWounds > 0}
    <div style="
      display: grid;
      grid-template-columns: 130px 70px 60px 1fr;
      padding: 8px 12px;
      border-bottom: 1px solid {COLORS.outlineVar};
      background-color: {hasWounds ? COLORS.bgHigh : wi % 2 === 0 ? COLORS.bgLow : COLORS.white};
      align-items: center;
      transition: background-color 0.15s ease;
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-weight: 600;
        color: {hasWounds ? COLORS.red : COLORS.ink};
      ">{wound.type.charAt(0) + wound.type.slice(1).toLowerCase()}</span>

      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        color: {COLORS.inkMuted};
        font-style: italic;
      ">{thresholds[wound.type] ?? '—'}</span>

      <span style="
        font-family: {S.fontHeadline};
        font-size: 16px;
        font-weight: 800;
        color: {penaltyColor(wound.penalty)};
      ">{penaltyDisplay(wound)}</span>

      <!-- Styled wound boxes -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        {#each Array(wound.maxWounds) as _, bi}
          {@const filled = bi < wound.currentWounds}
          <button
            onclick={() => toggleWound(wi, bi)}
            style="
              width: 22px;
              height: 22px;
              border: 1.5px solid {filled ? COLORS.red : COLORS.outlineVar};
              background-color: {filled ? COLORS.red : 'transparent'};
              border-radius: 3px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
              transition: all 0.15s ease;
              color: {COLORS.white};
              font-size: 12px;
              line-height: 1;
            "
          >{filled ? '✕' : ''}</button>
        {/each}
      </div>
    </div>
  {/each}
</div>