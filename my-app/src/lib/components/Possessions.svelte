<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Covenant } from '$lib/types/covenant';
  import type { Laboratory } from '$lib/types/laboratory';
  import MagicItems from '$lib/components/MagicItems.svelte';
  import { calculateLabPoints, labMaintenanceCost } from '$lib/utils/arsmagica';

  let { covenant }: { covenant: Covenant } = $props();

  type LabUsage = 'LIGHT' | 'TYPICAL' | 'HEAVY';

  const USAGE_MULTIPLIER: Record<LabUsage, number> = {
    LIGHT: 0.5,
    TYPICAL: 1.0,
    HEAVY: 1.5,
  };

  // Per-card local usage state — keyed by lab id
  let usageSelections = $state<Record<string, LabUsage>>(
    Object.fromEntries(covenant.laboratories.map(lab => [lab.id, 'TYPICAL']))
  );

  function getUpkeepScore(lab: Laboratory): number {
    return lab.characteristics.scores.UPKEEP ?? 0;
  }

  function getLabCalculations(lab: Laboratory) {
    const usage = usageSelections[lab.id] ?? 'TYPICAL';
    const upkeepScore = getUpkeepScore(lab);
    const basePoints = calculateLabPoints(upkeepScore);
    const adjustedPoints = basePoints * USAGE_MULTIPLIER[usage];
    const costInPounds = Math.round(adjustedPoints / 10);
    return { usage, upkeepScore, basePoints, adjustedPoints, costInPounds };
  }

  // Total upkeep across all labs
  const totalLabCost = $derived(
    covenant.laboratories.reduce((sum, lab) => {
      return sum + getLabCalculations(lab).costInPounds;
    }, 0)
  );

  const usageLabels: Record<LabUsage, string> = {
    LIGHT: 'Light (≤1 season)',
    TYPICAL: 'Typical (~2 seasons)',
    HEAVY: 'Heavy (≥3 seasons)',
  };

  const usageColors: Record<LabUsage, string> = {
    LIGHT: COLORS.inkMuted,
    TYPICAL: COLORS.ink,
    HEAVY: '#b85c00',
  };
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">

  <!-- Lab Overview Cards -->
  <div>
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 10px;
    ">
      <p style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: {COLORS.red};
        margin: 0;
      ">Laboratories</p>

      <div style="
        display: flex;
        align-items: baseline;
        gap: 8px;
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Total Upkeep Cost</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {COLORS.red};
        ">{totalLabCost}sp</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
      {#each covenant.laboratories as lab}
        {@const calc = getLabCalculations(lab)}

        <div style="
          background-color: {COLORS.bgLow};
          border: 1px solid {COLORS.outlineVar};
          border-radius: 6px;
          overflow: hidden;
        ">

          <!-- Card header -->
          <div style="
            background-color: {COLORS.bgHigh};
            padding: 10px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <div style="
                font-family: {S.fontHeadline};
                font-size: 15px;
                font-weight: 800;
                color: {COLORS.ink};
              ">{lab.ownerName}</div>
              <div style="
                font-family: {S.fontBody};
                font-size: 11px;
                color: {COLORS.inkMuted};
                margin-top: 2px;
              ">{lab.building} · Floor {lab.floor}</div>
            </div>
            <div style="
              font-family: {S.fontHeadline};
              font-size: 22px;
              font-weight: 800;
              color: {COLORS.red};
            ">{calc.costInPounds}sp</div>
          </div>

          <!-- Upkeep breakdown -->
          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            border-bottom: 1px solid {COLORS.outlineVar};
          ">
            {#each [
              ['Upkeep Score', calc.upkeepScore >= 0 ? `+${calc.upkeepScore}` : `${calc.upkeepScore}`],
              ['Base Points', calc.basePoints],
              ['Adj. Points', calc.adjustedPoints],
            ] as [label, value]}
              <div style="
                padding: 8px 10px;
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
                  font-size: 16px;
                  font-weight: 700;
                  color: {COLORS.ink};
                ">{value}</div>
              </div>
            {/each}
          </div>

          <!-- Usage selector -->
          <div style="padding: 10px 14px;">
            <div style="
              font-family: {S.fontBody};
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {COLORS.inkMuted};
              margin-bottom: 8px;
            ">Usage</div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
              {#each Object.entries(usageLabels) as [level, label]}
                {@const isSelected = usageSelections[lab.id] === level}
                <button
                  onclick={() => usageSelections[lab.id] = level as LabUsage}
                  style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    padding: 4px 0;
                    cursor: pointer;
                    text-align: left;
                  "
                >
                  <!-- Radio indicator -->
                  <div style="
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 1.5px solid {isSelected ? usageColors[level as LabUsage] : COLORS.outlineVar};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: border-color 0.15s ease;
                  ">
                    {#if isSelected}
                      <div style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background-color: {usageColors[level as LabUsage]};
                      "></div>
                    {/if}
                  </div>
                  <span style="
                    font-family: {S.fontBody};
                    font-size: 12px;
                    font-weight: {isSelected ? '700' : '400'};
                    color: {isSelected ? usageColors[level as LabUsage] : COLORS.inkMuted};
                    transition: color 0.15s ease;
                  ">{label}</span>
                </button>
              {/each}
            </div>
          </div>

        </div>
      {/each}
    </div>
  </div>

  <!-- Covenant Magic Items -->
  {#if covenant.magicItems && covenant.magicItems.length > 0}
    <div>
      <p style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: {COLORS.red};
        margin: 0 0 10px 0;
      ">Covenant Magic Items</p>
      <MagicItems items={covenant.magicItems} />
    </div>
  {/if}

  <!-- Empty state -->
  {#if covenant.laboratories.length === 0 && (!covenant.magicItems || covenant.magicItems.length === 0)}
    <div style="
      background-color: {COLORS.bgLow};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 6px;
      padding: 32px;
      text-align: center;
    ">
      <p style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-style: italic;
        color: {COLORS.inkMuted};
      ">No laboratories or magic items recorded.</p>
    </div>
  {/if}

</div>