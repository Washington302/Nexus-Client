<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Covenant } from "$lib/types/covenant";
  import type { StandardVis, ExtraordinaryVis } from "$lib/types/shared";

  let { covenant }: { covenant: Covenant } = $props();

  // ── All 15 hermetic arts in canonical order ───────────────────────────────
  const TECHNIQUES = ["Creo", "Intellego", "Muto", "Perdo", "Rego"];
  const FORMS = [
    "Animal",
    "Aquam",
    "Auram",
    "Corpus",
    "Herbam",
    "Ignem",
    "Imaginem",
    "Mentem",
    "Terram",
    "Vim",
  ];
  const ALL_ARTS = [...TECHNIQUES, ...FORMS];

  // ── Source status colors ──────────────────────────────────────────────────
  const statusColor: Record<string, string> = {
    REGISTERED: "#4a7c59",
    CONTESTED: "#b85c00",
    UNCLAIMED: COLORS.inkMuted,
  };

  // ── Extraordinary vis type colors ─────────────────────────────────────────
  const sourceTypeColor: Record<string, string> = {
    STANDARD: COLORS.inkMuted,
    DEDICATED: "#b8860b",
    INFERNAL: COLORS.red,
    FAERIE: "#4a7c59",
    DIVINE: "#4a6fa5",
    SPELL_LIKE: "#6a4c93",
  };

  const sourceTypeIcon: Record<string, string> = {
    STANDARD: "◆",
    DEDICATED: "⚡",
    INFERNAL: "💀",
    FAERIE: "✦",
    DIVINE: "☩",
    SPELL_LIKE: "🔮",
  };

  // ── Vis stock lookups ─────────────────────────────────────────────────────
  function getStockPawns(art: string): number {
    return covenant.visStocks.standard.find((v) => v.art === art)?.pawns ?? 0;
  }

  const totalStandardPawns = $derived(
    covenant.visStocks.standard.reduce((sum, v) => sum + v.pawns, 0),
  );

  const totalSourcePawns = $derived(
    covenant.visSources.reduce((sum, s) => sum + s.pawnsPerYear, 0),
  );

  // ── Shared styles ─────────────────────────────────────────────────────────
  const sectionHeaderStyle = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${COLORS.red};
    margin: 0 0 10px 0;
  `;

  const thStyle = `
    font-family: ${S.fontBody};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${COLORS.inkMuted};
    padding: 6px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    white-space: nowrap;
  `;

  const tdStyle = `
    font-family: ${S.fontBody};
    font-size: 13px;
    color: ${COLORS.ink};
    padding: 8px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    vertical-align: middle;
  `;
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <!-- Vis Sources -->
  <div>
    <p style={sectionHeaderStyle}>Vis Sources</p>
    <div
      style="
      background-color: {COLORS.bgLow};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 6px;
      overflow: hidden;
    "
    >
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: {COLORS.bgHigh};">
            <th style="{thStyle} text-align: left;">Source</th>
            <th style="{thStyle} text-align: left;">Art</th>
            <th style="{thStyle} text-align: center;">Pawns / Year</th>
            <th style="{thStyle} text-align: left;">Harvest Time</th>
            <th style="{thStyle} text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each covenant.visSources as source, i}
            <tr
              style="background-color: {i % 2 === 0
                ? COLORS.bgLow
                : COLORS.white};"
            >
              <td style="{tdStyle} font-weight: 600;">{source.name}</td>
              <td style={tdStyle}>
                <span
                  style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.06em;
                  color: {COLORS.white};
                  background-color: {COLORS.inkMuted};
                  padding: 2px 8px;
                  border-radius: 2px;
                ">{source.artType}</span
                >
              </td>
              <td
                style="
                {tdStyle}
                text-align: center;
                font-family: {S.fontHeadline};
                font-size: 16px;
                font-weight: 800;
                color: {COLORS.red};
              ">{source.pawnsPerYear}</td
              >
              <td
                style="{tdStyle} font-style: italic; color: {COLORS.inkMuted};"
                >{source.harvestTime}</td
              >
              <td style="{tdStyle} text-align: center;">
                <span
                  style="
                  font-family: {S.fontBody};
                  font-size: 10px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.06em;
                  color: {statusColor[source.status] ?? COLORS.inkMuted};
                  border: 1px solid {statusColor[source.status] ??
                    COLORS.outlineVar};
                  padding: 2px 8px;
                  border-radius: 2px;
                ">{source.status}</span
                >
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr style="background-color: {COLORS.bgHigh};">
            <td
              style="
              {tdStyle}
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: {COLORS.inkMuted};
              border-bottom: none;
            "
              colspan="2">Total Annual Income</td
            >
            <td
              style="
              {tdStyle}
              text-align: center;
              font-family: {S.fontHeadline};
              font-size: 18px;
              font-weight: 800;
              color: {COLORS.red};
              border-bottom: none;
            ">{totalSourcePawns}</td
            >
            <td colspan="2" style="border-bottom: none;"></td>
          </tr>
        </tfoot>
      </table>

      {#if covenant.visSources.length === 0}
        <div style="padding: 24px; text-align: center;">
          <p
            style="
            font-family: {S.fontBody};
            font-size: 13px;
            font-style: italic;
            color: {COLORS.inkMuted};
          "
          >
            No vis sources registered.
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Vis Stocks -->
  <div
    style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;"
  >
    <!-- Standard vis grid -->
    <div>
      <p style={sectionHeaderStyle}>Covenant Vault — Standard Vis</p>
      <div
        style="
        background-color: {COLORS.bgLow};
        border: 1px solid {COLORS.outlineVar};
        border-radius: 6px;
        overflow: hidden;
      "
      >
        <!-- Techniques -->
        <div
          style="
          padding: 4px 12px;
          background-color: {COLORS.bgHigh};
          border-bottom: 1px solid {COLORS.outlineVar};
          font-family: {S.fontBody};
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        "
        >
          Techniques
        </div>

        {#each TECHNIQUES as art}
          {@const pawns = getStockPawns(art)}
          <div
            style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 7px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          "
          >
            <span
              style="
              font-family: {S.fontBody};
              font-size: 13px;
              font-weight: 600;
              color: {COLORS.ink};
            ">{art}</span
            >
            <span
              style="
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {pawns > 0 ? COLORS.red : COLORS.inkMuted};
            ">{pawns}</span
            >
          </div>
        {/each}

        <!-- Forms -->
        <div
          style="
          padding: 4px 12px;
          background-color: {COLORS.bgHigh};
          border-bottom: 1px solid {COLORS.outlineVar};
          border-top: 1px solid {COLORS.outlineVar};
          font-family: {S.fontBody};
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        "
        >
          Forms
        </div>

        {#each FORMS as art}
          {@const pawns = getStockPawns(art)}
          <div
            style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 7px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          "
          >
            <span
              style="
              font-family: {S.fontBody};
              font-size: 13px;
              font-weight: 600;
              color: {COLORS.ink};
            ">{art}</span
            >
            <span
              style="
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {pawns > 0 ? COLORS.red : COLORS.inkMuted};
            ">{pawns}</span
            >
          </div>
        {/each}

        <!-- Total -->
        <div
          style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: {COLORS.bgHigh};
        "
        >
          <span
            style="
            font-family: {S.fontBody};
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
          ">Total Pawns</span
          >
          <span
            style="
            font-family: {S.fontHeadline};
            font-size: 18px;
            font-weight: 800;
            color: {COLORS.red};
          ">{totalStandardPawns}</span
          >
        </div>
      </div>
    </div>

    <!-- Extraordinary vis -->
    <div>
      <p style={sectionHeaderStyle}>Extraordinary & Tainted Vis</p>

      {#if covenant.visStocks.extraordinary.length === 0}
        <div
          style="
          background-color: {COLORS.bgLow};
          border: 1px solid {COLORS.outlineVar};
          border-radius: 6px;
          padding: 24px;
          text-align: center;
        "
        >
          <p
            style="
            font-family: {S.fontBody};
            font-size: 13px;
            font-style: italic;
            color: {COLORS.inkMuted};
          "
          >
            No extraordinary vis in the vault.
          </p>
        </div>
      {:else}
        <div style="display: flex; flex-direction: column; gap: 8px;">
          {#each covenant.visStocks.extraordinary as vis}
            {@const typeColor =
              sourceTypeColor[vis.sourceType] ?? COLORS.inkMuted}
            <div
              style="
              border: 1px solid {typeColor};
              border-left: 3px solid {typeColor};
              border-radius: 3px;
              padding: 10px 12px;
              background-color: {COLORS.white};
            "
            >
              <div
                style="display: flex; justify-content: space-between; align-items: start;"
              >
                <div>
                  <div
                    style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"
                  >
                    <span
                      style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 0.08em;
                      color: {typeColor};
                    ">{sourceTypeIcon[vis.sourceType]} {vis.sourceType}</span
                    >
                  </div>
                  <div
                    style="
                    font-family: {S.fontBody};
                    font-size: 13px;
                    font-weight: 600;
                    color: {COLORS.ink};
                  "
                  >
                    {vis.name}
                  </div>
                  <div
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    color: {COLORS.inkMuted};
                    margin-top: 2px;
                  "
                  >
                    {vis.arts.join(" / ")}
                  </div>
                </div>
                <span
                  style="
                  font-family: {S.fontHeadline};
                  font-size: 20px;
                  font-weight: 800;
                  color: {COLORS.ink};
                ">{vis.pawns} {vis.pawns === 1 ? "pawn" : "pawns"}</span
                >
              </div>

              {#if vis.effect}
                <div
                  style="
                  margin-top: 8px;
                  padding: 8px 10px;
                  background-color: {COLORS.bgLow};
                  border: 1px solid {COLORS.outlineVar};
                  border-radius: 2px;
                "
                >
                  <div
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    color: {COLORS.inkMuted};
                    font-style: italic;
                  "
                  >
                    {vis.effect.description}
                  </div>
                  <div
                    style="
                    font-family: {S.fontBody};
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: {COLORS.inkMuted};
                    margin-top: 2px;
                  "
                  >
                    Level {vis.effect.level}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
