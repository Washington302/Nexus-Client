<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Covenant, CovenantSeason } from '$lib/types/covenant';

  let { covenant }: { covenant: Covenant } = $props();

  const seasonColors: Record<CovenantSeason, string> = {
    SPRING: '#4a7c59',
    SUMMER: '#b8860b',
    AUTUMN: '#b85c00',
    WINTER: '#4a6fa5',
  };

  const seasonLabel: Record<CovenantSeason, string> = {
    SPRING: 'Spring',
    SUMMER: 'Summer',
    AUTUMN: 'Autumn',
    WINTER: 'Winter',
  };

  const seasonColor = $derived(seasonColors[covenant.season] ?? COLORS.inkMuted);
  const seasonName  = $derived(seasonLabel[covenant.season]  ?? covenant.season);

  const regioDisplay = $derived(
    covenant.regioLevels?.length > 0
      ? covenant.regioLevels.join(', ')
      : '—'
  );
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">

  <!-- Name + Tribunal banner -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: {COLORS.bgHigh};
    border-bottom: 2px solid {COLORS.ink};
  ">
    <div style="
      padding: 14px 16px;
      border-right: 1px solid {COLORS.outline};
    ">
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      ">Covenant Name</div>
      <div style="
        font-family: {S.fontHeadline};
        font-size: 22px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
      ">{covenant.name}</div>
    </div>

    <div style="padding: 14px 16px;">
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      ">Tribunal</div>
      <div style="
        font-family: {S.fontHeadline};
        font-size: 22px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
      ">{covenant.tribunal}</div>
    </div>
  </div>

  <!-- Detail rows -->
  <div style="display: grid; grid-template-columns: 1fr 1fr;">

    <!-- Row 1 -->
    <div style="
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 8px 16px;
      border-right: 1px solid {COLORS.outlineVar};
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        white-space: nowrap;
      ">Saga:</span>
      <span style="
        font-family: {S.fontBody};
        font-size: 13px;
        color: {COLORS.ink};
      ">{covenant.saga}</span>
    </div>

    <div style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <div style="
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 8px 16px;
        border-right: 1px solid {COLORS.outlineVar};
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          white-space: nowrap;
        ">Founded:</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 13px;
          font-weight: 700;
          color: {COLORS.ink};
        ">{covenant.foundingYear}</span>
      </div>
      <div style="
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 8px 16px;
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          white-space: nowrap;
        ">Current Year:</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 13px;
          font-weight: 700;
          color: {COLORS.red};
        ">{covenant.currentYear}</span>
      </div>
    </div>

    <!-- Row 2 -->
    <div style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-right: 1px solid {COLORS.outlineVar};
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <div style="
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 8px 16px;
        border-right: 1px solid {COLORS.outlineVar};
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          white-space: nowrap;
        ">Aura Type:</span>
        <span style="
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
        ">{covenant.auraType}</span>
      </div>
      <div style="
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 8px 16px;
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          white-space: nowrap;
        ">Aura Level:</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 13px;
          font-weight: 700;
          color: {COLORS.ink};
        ">{covenant.auraLevel}</span>
      </div>
    </div>

    <div style="
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        white-space: nowrap;
      ">Regio Levels:</span>
      <span style="
        font-family: {S.fontBody};
        font-size: 13px;
        color: {COLORS.ink};
      ">{regioDisplay}</span>
    </div>

    <!-- Row 3 -->
    <div style="
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 8px 16px;
      border-right: 1px solid {COLORS.outlineVar};
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        white-space: nowrap;
      ">Living Conditions (Magi):</span>
      <span style="
        font-family: {S.fontHeadline};
        font-size: 13px;
        font-weight: 700;
        color: {covenant.livingConditionsMagi >= 0 ? COLORS.ink : COLORS.red};
      ">{covenant.livingConditionsMagi >= 0 ? `+${covenant.livingConditionsMagi}` : covenant.livingConditionsMagi}</span>
    </div>

    <div style="
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        white-space: nowrap;
      ">Living Conditions (Mundanes):</span>
      <span style="
        font-family: {S.fontHeadline};
        font-size: 13px;
        font-weight: 700;
        color: {covenant.livingConditionsMundane >= 0 ? COLORS.ink : COLORS.red};
      ">{covenant.livingConditionsMundane >= 0 ? `+${covenant.livingConditionsMundane}` : covenant.livingConditionsMundane}</span>
    </div>

    <!-- Row 4 -->
    <div style="
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 8px 16px;
      border-right: 1px solid {COLORS.outlineVar};
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        white-space: nowrap;
      ">Season:</span>
      <span style="
        font-family: {S.fontHeadline};
        font-size: 13px;
        font-weight: 700;
        color: {seasonColor};
      ">{seasonName}</span>
    </div>

    <div style="
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 8px 16px;
    ">
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        white-space: nowrap;
      ">Aegis of the Hearth:</span>
      <span style="
        font-family: {S.fontHeadline};
        font-size: 13px;
        font-weight: 700;
        color: {COLORS.ink};
      ">{covenant.aegisLevel > 0 ? `Level ${covenant.aegisLevel}` : '—'}</span>
    </div>

  </div>
</div>