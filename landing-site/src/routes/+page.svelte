<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import SiteGrid from '$lib/components/SiteGrid.svelte';
</script>

<div style="max-width: 1440px; margin: 0 auto; padding: 64px 32px; box-sizing: border-box;">
  <div style="text-align: center; margin-bottom: 56px;">
    <h1 style="
      font-family: {S.fontHeadline};
      font-size: 48px;
      font-weight: 800;
      color: {COLORS.ink};
      letter-spacing: -0.02em;
      margin: 0 0 12px 0;
    ">SCRIBE SHEETS</h1>
    <p style="
      font-family: {S.fontBody};
      font-size: 16px;
      color: {COLORS.inkMuted};
      max-width: 560px;
      margin: 0 auto 28px auto;
      line-height: 1.6;
    ">Character sheets and campaign tools for the tabletop games you're already
      playing.</p>
    <a href="/auth/register" style="
      display: inline-block;
      font-family: {S.fontBody};
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.white};
      background-color: {COLORS.red};
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 4px;
    ">Create Your Account</a>
  </div>

  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 32px;
    max-width: 1000px;
    margin: 0 auto 64px auto;
    padding: 32px;
    background-color: {COLORS.bgLow};
    border: 1px solid {COLORS.outlineVar};
    border-radius: 8px;
  ">
    <div>
      <h2 style="
        font-family: {S.fontHeadline};
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.red};
        margin: 0 0 8px 0;
      ">What It Is</h2>
      <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted}; line-height: 1.6; margin: 0;">
        A set of digital character sheets built for the tabletop games I
        actually play — each one styled to fit its system instead of a
        generic form.
      </p>
    </div>
    <div>
      <h2 style="
        font-family: {S.fontHeadline};
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.red};
        margin: 0 0 8px 0;
      ">Who It's For</h2>
      <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted}; line-height: 1.6; margin: 0;">
        Players and GMs who want their character saved to an account instead
        of a stack of paper or a spreadsheet — accessible from any device,
        in campaign or on your own.
      </p>
    </div>
    <div>
      <h2 style="
        font-family: {S.fontHeadline};
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.red};
        margin: 0 0 8px 0;
      ">Where It's Going</h2>
      <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted}; line-height: 1.6; margin: 0;">
        Five systems are live today, with more games in the works — one
        account will carry you into every sheet added from here on.
      </p>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <p style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: {COLORS.red};
      margin-bottom: 16px;
      text-align: center;
    ">Choose a Game</p>
  </div>

  <SiteGrid />
</div>
