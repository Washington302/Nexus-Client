<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Covenant } from "$lib/types/covenant";
  import type { Book } from "$lib/types/shared";

  let { covenant }: { covenant: Covenant } = $props();

  // ── Split books by type ───────────────────────────────────────────────────
  const books = $derived(covenant.books ?? []);
  const labTextLevels = $derived(covenant.labTextLevels ?? 0);
  const castingTabletLevels = $derived(covenant.castingTabletLevels ?? 0);

  const magicalBooks = $derived(
    books.filter((b) => b.type === "SUMMA" || b.type === "TRACTATUS"),
  );
  const labTexts = $derived(
    books.filter((b) => b.type === "LAB_TEXTS"),
  );
  const mundaneBooks = $derived(
    books.filter((b) => b.type === "MUNDANE"),
  );

  // ── Condition display ─────────────────────────────────────────────────────
  function conditionColor(condition: number): string {
    if (condition >= 5) return COLORS.ink;
    if (condition >= 3) return "#b8860b";
    return COLORS.red;
  }

  function conditionLabel(condition: number): string {
    if (condition >= 5) return "Fine";
    if (condition >= 4) return "Good";
    if (condition >= 3) return "Fair";
    if (condition >= 2) return "Poor";
    return "Damaged";
  }

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

  const tdBaseStyle = `
    font-family: ${S.fontBody};
    font-size: 13px;
    color: ${COLORS.ink};
    padding: 8px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    vertical-align: middle;
  `;
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <!-- Summary strip -->
  <div
    style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  "
  >
    {#each [["Lab Text Levels", labTextLevels], ["Casting Tablet Levels", castingTabletLevels]] as [label, value]}
      <div
        style="
        background-color: {COLORS.bgLow};
        border: 1px solid {COLORS.outlineVar};
        border-radius: 6px;
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        ">{label}</span
        >
        <span
          style="
          font-family: {S.fontHeadline};
          font-size: 22px;
          font-weight: 800;
          color: {COLORS.red};
        ">{value}</span
        >
      </div>
    {/each}
  </div>

  <!-- Magical Books -->
  {#if magicalBooks.length > 0}
    <div>
      <p style={sectionHeaderStyle}>Magical Books</p>
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
              <th style="{thStyle} text-align: left;">Title</th>
              <th style="{thStyle} text-align: left;">Author</th>
              <th style="{thStyle} text-align: center;">Type</th>
              <th style="{thStyle} text-align: left;">Subject</th>
              <th style="{thStyle} text-align: center;">Level</th>
              <th style="{thStyle} text-align: center;">Quality</th>
              <th style="{thStyle} text-align: left;">Language</th>
              <th style="{thStyle} text-align: center;">Condition</th>
            </tr>
          </thead>
          <tbody>
            {#each magicalBooks as book, i}
              <tr
                style="background-color: {i % 2 === 0
                  ? COLORS.bgLow
                  : COLORS.white};"
              >
                <td style="{tdBaseStyle} font-weight: 600;">{book.title}</td>
                <td
                  style="{tdBaseStyle} font-style: italic; color: {COLORS.inkMuted};"
                  >{book.author}</td
                >
                <td style="{tdBaseStyle} text-align: center;">
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: {COLORS.white};
                    background-color: {COLORS.inkMuted};
                    padding: 2px 6px;
                    border-radius: 2px;
                  ">{book.type}</span
                  >
                </td>
                <td style={tdBaseStyle}>{book.subject}</td>
                <td
                  style="
                  {tdBaseStyle}
                  text-align: center;
                  font-family: {S.fontHeadline};
                  font-size: 15px;
                  font-weight: 700;
                ">{book.level}</td
                >
                <td
                  style="
                  {tdBaseStyle}
                  text-align: center;
                  font-family: {S.fontHeadline};
                  font-size: 15px;
                  font-weight: 700;
                  color: {COLORS.red};
                ">{book.quality}</td
                >
                <td style="{tdBaseStyle} color: {COLORS.inkMuted};"
                  >{book.language}</td
                >
                <td style="{tdBaseStyle} text-align: center;">
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 700;
                    color: {conditionColor(book.condition)};
                  ">{conditionLabel(book.condition)}</span
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Lab Texts -->
  {#if labTexts.length > 0}
    <div>
      <p style={sectionHeaderStyle}>Laboratory Texts</p>
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
              <th style="{thStyle} text-align: left;">Title</th>
              <th style="{thStyle} text-align: left;">Author</th>
              <th style="{thStyle} text-align: left;">Arts</th>
              <th style="{thStyle} text-align: center;">Level</th>
              <th style="{thStyle} text-align: center;">Quality</th>
              <th style="{thStyle} text-align: left;">Language</th>
              <th style="{thStyle} text-align: center;">Condition</th>
            </tr>
          </thead>
          <tbody>
            {#each labTexts as book, i}
              <tr
                style="background-color: {i % 2 === 0
                  ? COLORS.bgLow
                  : COLORS.white};"
              >
                <td style="{tdBaseStyle} font-weight: 600;">{book.title}</td>
                <td
                  style="{tdBaseStyle} font-style: italic; color: {COLORS.inkMuted};"
                  >{book.author}</td
                >
                <td style={tdBaseStyle}>{book.subject}</td>
                <td
                  style="
                  {tdBaseStyle}
                  text-align: center;
                  font-family: {S.fontHeadline};
                  font-size: 15px;
                  font-weight: 700;
                ">{book.level}</td
                >
                <td
                  style="
                  {tdBaseStyle}
                  text-align: center;
                  font-family: {S.fontHeadline};
                  font-size: 15px;
                  font-weight: 700;
                  color: {COLORS.red};
                ">{book.quality}</td
                >
                <td style="{tdBaseStyle} color: {COLORS.inkMuted};"
                  >{book.language}</td
                >
                <td style="{tdBaseStyle} text-align: center;">
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 700;
                    color: {conditionColor(book.condition)};
                  ">{conditionLabel(book.condition)}</span
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Mundane Books -->
  {#if mundaneBooks.length > 0}
    <div>
      <p style={sectionHeaderStyle}>Mundane Books</p>
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
              <th style="{thStyle} text-align: left;">Title</th>
              <th style="{thStyle} text-align: left;">Author</th>
              <th style="{thStyle} text-align: center;">Type</th>
              <th style="{thStyle} text-align: left;">Ability</th>
              <th style="{thStyle} text-align: center;">Level</th>
              <th style="{thStyle} text-align: center;">Quality</th>
              <th style="{thStyle} text-align: left;">Language</th>
              <th style="{thStyle} text-align: center;">Condition</th>
            </tr>
          </thead>
          <tbody>
            {#each mundaneBooks as book, i}
              <tr
                style="background-color: {i % 2 === 0
                  ? COLORS.bgLow
                  : COLORS.white};"
              >
                <td style="{tdBaseStyle} font-weight: 600;">{book.title}</td>
                <td
                  style="{tdBaseStyle} font-style: italic; color: {COLORS.inkMuted};"
                  >{book.author}</td
                >
                <td style="{tdBaseStyle} text-align: center;">
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: {COLORS.ink};
                    background-color: {COLORS.bgHigh};
                    border: 1px solid {COLORS.outlineVar};
                    padding: 2px 6px;
                    border-radius: 2px;
                  ">{book.type}</span
                  >
                </td>
                <td style={tdBaseStyle}>{book.subject}</td>
                <td
                  style="
                  {tdBaseStyle}
                  text-align: center;
                  font-family: {S.fontHeadline};
                  font-size: 15px;
                  font-weight: 700;
                ">{book.level}</td
                >
                <td
                  style="
                  {tdBaseStyle}
                  text-align: center;
                  font-family: {S.fontHeadline};
                  font-size: 15px;
                  font-weight: 700;
                  color: {COLORS.red};
                ">{book.quality}</td
                >
                <td style="{tdBaseStyle} color: {COLORS.inkMuted};"
                  >{book.language}</td
                >
                <td style="{tdBaseStyle} text-align: center;">
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 700;
                    color: {conditionColor(book.condition)};
                  ">{conditionLabel(book.condition)}</span
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Empty state -->
  {#if magicalBooks.length === 0 && labTexts.length === 0 && mundaneBooks.length === 0}
    <div
      style="
      background-color: {COLORS.bgLow};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 6px;
      padding: 32px;
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
        No books recorded in the library.
      </p>
    </div>
  {/if}
</div>
