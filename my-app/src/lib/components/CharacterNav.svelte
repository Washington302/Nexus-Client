<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type {ArsCharacter} from '$lib/types';


let { character }: { character: ArsCharacter } = $props();

  const navLinks = [
    { label: 'Character',   href: '/character' },
    { label: 'Laboratory',  href: '/character/laboratory' },
    { label: 'Covenant',    href: '/covenant' }
  ];
</script>

<div style="
  width: 100%;
  background-color: {COLORS.bg};
  border-bottom: 1px solid {COLORS.outlineVar};
  box-sizing: border-box;
  position: sticky;
  top: 48px;
  z-index: 100;
">
  <div style="
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  ">

    <!-- Character identity -->
    <div style="
      display: flex;
      flex-direction: column;
      padding: 10px 0;
    ">
      <span style="
        font-family: {S.fontHeadline};
        font-size: 20px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
        line-height: 1.2;
      ">{character.name}</span>
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.inkMuted};
      ">House {character.hermeticData?.house ?? ''} · {character.covenant}</span>
    </div>

    <!-- Nav links -->
    <div style="display: flex; align-items: center;">
      {#each navLinks as { label, href }}
        
         <a {href}
          style="
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            text-decoration: none;
            padding: 16px;
            border-bottom: 2px solid transparent;
            transition: color 0.15s ease, border-color 0.15s ease;
          "
          onmouseenter={(e) => {
            (e.currentTarget as HTMLElement).style.color = COLORS.red;
            (e.currentTarget as HTMLElement).style.borderBottomColor = COLORS.red;
          }}
          onmouseleave={(e) => {
            (e.currentTarget as HTMLElement).style.color = COLORS.inkMuted;
            (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
          }}
        >{label}</a>
      {/each}
    </div>

  </div>
</div>