<script lang="ts">
  import { COLORS, S } from '$lib/constants';

  // Every sheet ships under the same product name; the game each one serves is a
  // descriptive line beneath it, never the card's title.
  const sites = [
    { label: 'Scribe Sheets', game: 'for Godbound', desc: 'Divine-powered heroes reshaping a broken world.', href: 'https://gb.scribe-sheets.com' },
    { label: 'Scribe Sheets', game: 'for Mythras', desc: 'Gritty, skill-based fantasy roleplaying.', href: 'https://mythic.scribe-sheets.com' },
    { label: 'Scribe Sheets', game: 'for The Witcher TTRPG', desc: 'Monster hunting in a grim, morally gray world.', href: 'https://kaer.scribe-sheets.com' },
    { label: 'Scribe Sheets', game: 'for Mutants & Masterminds', desc: 'Superheroic action for any power level.', href: 'https://vanguard.scribe-sheets.com' },
  ];
</script>

<div style="max-width: 1440px; margin: 0 auto; padding: 32px; box-sizing: border-box;">
  <div style="margin-bottom: 40px;">
    <h1 style="font-family: {S.fontHeadline}; font-size: 28px; font-weight: 800; color: {COLORS.ink}; margin: 0 0 4px 0;">
      Other Sites
    </h1>
    <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted}; margin: 0;">
      Everything else I'm building
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 800px;">
    {#each sites as site}
      <a
        href={site.href}
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: flex; flex-direction: column; gap: 8px;
          padding: 24px; background-color: {COLORS.bgLow}; border: 1px solid {COLORS.outlineVar};
          border-radius: 8px; text-decoration: none; transition: border-color 0.15s;
        "
        onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = COLORS.red)}
        onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar)}
      >
        <span style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">{site.label}</span>
        <span style="
          display: inline-block; width: fit-content;
          font-family:{S.fontBody}; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em;
          color:{COLORS.red}; border: 1px solid {COLORS.red}; border-radius: 999px; padding: 2px 10px;
        ">{site.game}</span>
        <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">{site.desc}</span>
        <span style="font-family:{S.fontHeadline}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:{COLORS.red};">Visit &#8594;</span>
      </a>
    {/each}
  </div>
</div>
