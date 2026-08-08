<script lang="ts">
  import { COLORS, S } from '$lib/constants';

  // The CC BY-SA 4.0 attribution below is mandatory and must appear verbatim.
  // Do not reword it. Note the copyleft term: any Ars Magica game data, text, or
  // rules this app ships must itself be available under CC BY-SA 4.0.
  const APP_NAME = 'Scribe Sheets';

  const panel = `
    background-color: ${COLORS.bgLow};
    border: 1px solid ${COLORS.outlineVar};
    border-radius: 6px;
    padding: 24px;
  `;
  const panelHeader = `
    font-family: ${S.fontHeadline};
    font-size: 16px;
    font-weight: 800;
    color: ${COLORS.ink};
    margin-bottom: 12px;
  `;
  const body = `
    font-family: ${S.fontBody};
    font-size: 14px;
    line-height: 21px;
    color: ${COLORS.ink};
    margin-bottom: 12px;
  `;
  const quote = `
    ${body}
    margin-bottom: 12px;
    border-left: 3px solid ${COLORS.red};
    background-color: ${COLORS.bgHigh};
    padding: 12px 14px;
    border-radius: 0 4px 4px 0;
  `;
</script>

<div style="max-width: 900px; margin: 0 auto; padding: 32px; box-sizing: border-box;">
  <div style="border-bottom: 2px solid {COLORS.ink}; padding-bottom: 16px; margin-bottom: 32px;">
    <h1 style="
      font-family: {S.fontHeadline};
      font-size: 32px;
      font-weight: 800;
      color: {COLORS.ink};
      line-height: 1;
      margin-bottom: 4px;
    ">{APP_NAME}</h1>
    <span style="
      font-family: {S.fontBody};
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.inkMuted};
    ">An unofficial character tool for Ars Magica</span>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style={panel}>
      <div style={panelHeader}>About</div>
      <p style={body}>
        {APP_NAME} is an independent digital character sheet. It implements Ars Magica Fifth Edition
        material — Hermetic magic formulas, spell effects, Virtues and Flaws, the Arts, aging, and
        laboratory mechanics — under the Creative Commons licence set out below.
      </p>
      <p style="{body} margin-bottom: 0;">
        It ships no official artwork, book layout designs, maps or cartography, and no Atlas Games or
        Paradox logos. You'll need the published rulebook to play.
      </p>
    </div>

    <div style={panel}>
      <div style={panelHeader}>Licence &amp; Attribution</div>
      <blockquote style={quote}>
        Based on the material for Ars Magica, &copy;1993&ndash;2024, licensed by Trident, Inc. d/b/a
        Atlas Games&reg;, under Creative Commons Attribution-ShareAlike 4.0 International license 4.0
        (CC-BY-SA 4.0).
      </blockquote>
      <blockquote style="{quote} margin-bottom: 0;">
        Ars Magica Open License Logo &copy;2024 Trident, Inc. The Ars Magica Open License Logo, Ars
        Magica, and Mythic Europe are trademarks of Trident, Inc., and are used with permission.
      </blockquote>
    </div>

    <div style={panel}>
      <div style={panelHeader}>Share-Alike</div>
      <p style="{body} margin-bottom: 0;">
        CC BY-SA 4.0 is a copyleft licence. Any Ars Magica game data, text, or rules content
        distributed by {APP_NAME} is likewise made available under
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          style="color: {COLORS.red};">Creative Commons Attribution-ShareAlike 4.0 International</a
        >. Characters you write yourself remain yours.
      </p>
    </div>
  </div>

  <p style="text-align: center; margin-top: 24px;">
    <a href="/" style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.red};"
      >&larr; Back to Characters</a
    >
  </p>
</div>
