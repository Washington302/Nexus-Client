<script lang="ts">
  import { COLORS, S } from "$lib/constants";

  interface VisEntry {
    art: string;
    pawns: number;
    physicalForm: string;
  }

  let { entries = [] } = $props<{ entries: VisEntry[] }>();
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
    ">Raw Vis</span
    >
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background-color: {COLORS.bgHigh};">
        {#each ["Art", "Pawns", "Physical Form"] as header}
          <th
            style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            padding: 6px 12px;
            text-align: left;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{header}</th
          >
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if entries.length === 0}
        <tr>
          <td
            colspan="3"
            style="
            font-family: {S.fontBody};
            font-size: 13px;
            font-style: italic;
            color: {COLORS.inkMuted};
            padding: 12px;
            text-align: center;
          ">No vis recorded.</td
          >
        </tr>
      {:else}
        {#each entries as entry, i}
          <tr
            style="background-color: {i % 2 === 0
              ? COLORS.bgLow
              : COLORS.white};"
          >
            <td
              style="
              font-family: {S.fontBody};
              font-size: 14px;
              font-weight: 600;
              color: {COLORS.ink};
              padding: 8px 12px;
              border-bottom: 1px solid {COLORS.outlineVar};
            ">{entry.art}</td
            >
            <td
              style="
              font-family: {S.fontHeadline};
              font-size: 14px;
              font-weight: 700;
              color: {COLORS.red};
              padding: 8px 12px;
              border-bottom: 1px solid {COLORS.outlineVar};
            ">{entry.pawns}</td
            >
            <td
              style="
              font-family: {S.fontBody};
              font-size: 13px;
              color: {COLORS.inkMuted};
              font-style: italic;
              padding: 8px 12px;
              border-bottom: 1px solid {COLORS.outlineVar};
            ">{entry.physicalForm}</td
            >
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
