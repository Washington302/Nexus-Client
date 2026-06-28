<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { session } from '$lib/stores/session.svelte';
</script>

<div style="max-width: 1440px; margin: 0 auto; padding: 32px; box-sizing: border-box;">
  <div style="margin-bottom: 40px;">
    <h1 style="font-family: {S.fontHeadline}; font-size: 28px; font-weight: 800; color: {COLORS.ink}; margin: 0 0 4px 0;">
      Dashboard
    </h1>
    <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted}; margin: 0;">
      Ars Magica campaign hub
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 800px;">
    <a href="/" style="
      display: flex; flex-direction: column; gap: 8px;
      padding: 24px; background-color: {COLORS.bgLow}; border: 1px solid {COLORS.outlineVar};
      border-radius: 8px; text-decoration: none; transition: border-color 0.15s;
    " onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.red} onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar}>
      <span style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">My Characters</span>
      <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">View and manage all your characters</span>
    </a>

    <a href="/covenant" style="
      display: flex; flex-direction: column; gap: 8px;
      padding: 24px; background-color: {COLORS.bgLow}; border: 1px solid {COLORS.outlineVar};
      border-radius: 8px; text-decoration: none; transition: border-color 0.15s;
    " onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.red} onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar}>
      <span style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">Covenant</span>
      <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Manage your covenant</span>
    </a>

    <a href="/campaigns" style="
      display: flex; flex-direction: column; gap: 8px;
      padding: 24px; background-color: {COLORS.bgLow}; border: 1px solid {COLORS.outlineVar};
      border-radius: 8px; text-decoration: none; transition: border-color 0.15s;
    " onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.red} onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar}>
      <span style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">Campaigns</span>
      <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Start and manage your sagas</span>
    </a>
  </div>

  {#if !session.userId}
    <div style="margin-top: 40px; padding: 24px; background-color: {COLORS.bgLow}; border-radius: 8px; text-align: center;">
      <p style="font-family:{S.fontBody}; font-size:13px; color:{COLORS.inkMuted};">
        <a href="/auth/login" style="color:{COLORS.red};">Sign in</a> to access all features.
      </p>
    </div>
  {/if}
</div>
