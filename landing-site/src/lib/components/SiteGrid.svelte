<script lang="ts">
  import { COLORS, S, SITES, type SiteLink } from '$lib/constants';
</script>

{#snippet card(site: SiteLink)}
  <div style="
    height: 180px; overflow: hidden; border-bottom: 1px solid {COLORS.outlineVar}; background-color: {COLORS.bgHigh};
    display: flex; align-items: center; justify-content: center;
  ">
    {#if site.shot}
      <img
        src={site.shot}
        alt="{site.game} character sheet"
        loading="lazy"
        style="width: 100%; height: 100%; object-fit: cover; object-position: top left; display: block;"
      />
    {:else}
      <span style="font-family:{S.fontBody}; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">
        {site.inDevelopment ? 'In development' : 'Preview coming soon'}
      </span>
    {/if}
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px; padding: 20px;">
    <span style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">Scribe Sheets</span>
    <span style="
      display: inline-block; width: fit-content;
      font-family:{S.fontBody}; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em;
      color:{site.inDevelopment ? COLORS.inkMuted : COLORS.red}; border: 1px solid {site.inDevelopment ? COLORS.outlineVar : COLORS.red}; border-radius: 999px; padding: 2px 10px;
    ">for {site.game}</span>
    <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">{site.desc}</span>
    {#if site.inDevelopment}
      <span style="font-family:{S.fontHeadline}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:{COLORS.inkMuted};">Coming Soon</span>
    {:else}
      <span style="font-family:{S.fontHeadline}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:{COLORS.red};">Visit &#8594;</span>
    {/if}
  </div>
{/snippet}

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
  {#each SITES as site (site.key)}
    {#if site.inDevelopment}
      <div style="
        display: flex; flex-direction: column;
        background-color: {COLORS.bgLow}; border: 1px solid {COLORS.outlineVar};
        border-radius: 8px; overflow: hidden; opacity: 0.7;
      ">
        {@render card(site)}
      </div>
    {:else}
      <a
        href={site.href}
        style="
          display: flex; flex-direction: column;
          background-color: {COLORS.bgLow}; border: 1px solid {COLORS.outlineVar};
          border-radius: 8px; overflow: hidden; text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        "
        onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = COLORS.red; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
        onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
      >
        {@render card(site)}
      </a>
    {/if}
  {/each}

  <div style="
    display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center;
    padding: 24px; background-color: transparent; border: 1px dashed {COLORS.outlineVar};
    border-radius: 8px; text-align: center; min-height: 180px;
  ">
    <span style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.inkMuted};">More Coming</span>
    <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">New games are on the way — check back soon.</span>
  </div>
</div>
