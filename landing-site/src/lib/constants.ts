// $lib/constants.ts
export const COLORS = {
  bg:         '#fef9eb',
  bgLow:      '#f8f3e5',
  bgHigh:     '#ede8da',
  ink:        '#1d1c13',
  inkMuted:   '#474741',
  outline:    '#787770',
  outlineVar: '#c8c7be',
  red:        '#a9372a',
  white:      '#ffffff',
};

export const S = {
  fontHeadline: "'Epilogue', sans-serif",
  fontBody:     "'Literata', serif",
};

export interface SiteLink {
  key: string;
  game: string;
  desc: string;
  href: string;
  shot?: string;
  inDevelopment?: boolean;
}

// Canonical subdomain map, mirrored from each game site's own "sites" page.
export const SITES: SiteLink[] = [
  { key: 'godbound', game: 'Godbound', desc: 'Divine-powered heroes reshaping a broken world.', href: 'https://gb.scribe-sheets.com', shot: '/screenshots/godbound.png' },
  { key: 'mythras', game: 'Mythras', desc: 'Gritty, skill-based fantasy roleplaying.', href: 'https://mythic.scribe-sheets.com', shot: '/screenshots/mythras.png' },
  { key: 'witcher', game: 'The Witcher TTRPG', desc: 'Monster hunting in a grim, morally gray world.', href: 'https://kaer.scribe-sheets.com', shot: '/screenshots/witcher.png' },
  { key: 'mnm', game: 'Mutants & Masterminds', desc: 'Superheroic action for any power level.', href: 'https://vanguard.scribe-sheets.com', shot: '/screenshots/mnm.png' },
  { key: 'arsmagica', game: 'Ars Magica', desc: 'Wizards, covenants, and the fall of an age of magic.', href: 'https://covenant.scribe-sheets.com', inDevelopment: true },
];
