<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { FatigueLevel } from '$lib/types';

  let { currentFatigueLevel = $bindable('Fresh' as FatigueLevel) } = $props<{ currentFatigueLevel: FatigueLevel }>();

  const levels: { level: FatigueLevel; penalty: number | null; recovery: string }[] = [
    { level: 'Fresh',       penalty: null, recovery: '—' },
    { level: 'Winded',      penalty: 0,    recovery: '2 min' },
    { level: 'Weary',       penalty: -1,   recovery: '10 min' },
    { level: 'Tired',       penalty: -3,   recovery: '30 min' },
    { level: 'Dazed',       penalty: -5,   recovery: '1 hr' },
    { level: 'Unconscious', penalty: null, recovery: '2 hrs' },
  ];

  const currentIndex = $derived(levels.findIndex(l => l.level === currentFatigueLevel));
  const penalty = $derived(levels[currentIndex]?.penalty ?? null);

  function penaltyColor(p: number | null) {
    if (p === null) return COLORS.inkMuted;
    if (p <= -5) return COLORS.red;
    if (p <= -3) return '#b85c00';
    return COLORS.ink;
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
    ">Fatigue</span>
    <span style="
      font-family: {S.fontHeadline};
      font-size: 14px;
      font-weight: 700;
      color: {penaltyColor(penalty)};
    ">Penalty: {penalty !== null ? penalty : '—'}</span>
  </div>

  {#each levels as { level, penalty: p, recovery }, i}
    {@const isActive = i === currentIndex}
    {@const isPast = i < currentIndex}

    <button
      onclick={() => currentFatigueLevel = level}
      style="
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border: none;
        border-bottom: 1px solid {COLORS.outlineVar};
        background-color: {isActive ? COLORS.bgHigh : i % 2 === 0 ? COLORS.bgLow : COLORS.white};
        cursor: pointer;
        text-align: left;
        transition: background-color 0.15s ease;
      "
    >
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1.5px solid {isActive ? COLORS.red : COLORS.outlineVar};
        background-color: {isPast ? COLORS.outlineVar : 'transparent'};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.15s ease;
      ">
        {#if isActive}
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: {COLORS.red};
          " />
        {/if}
      </div>

      <span style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-weight: {isActive ? '700' : '400'};
        color: {isActive ? COLORS.red : isPast ? COLORS.inkMuted : COLORS.ink};
        flex: 1;
        transition: color 0.15s ease;
      ">{level}</span>

      <span style="
        font-family: {S.fontHeadline};
        font-size: 16px;
        font-weight: 800;
        color: {penaltyColor(p)};
        width: 36px;
        text-align: center;
      ">{p !== null ? p : '—'}</span>

      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        color: {COLORS.inkMuted};
        width: 56px;
        text-align: right;
      ">{recovery}</span>
    </button>
  {/each}
</div>