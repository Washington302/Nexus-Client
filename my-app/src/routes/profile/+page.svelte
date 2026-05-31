<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { session } from '$lib/stores/session.svelte';
</script>

<div style="
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 32px;
  box-sizing: border-box;
">
  <h1 style="
    font-family: {S.fontHeadline};
    font-size: 28px;
    font-weight: 800;
    color: {COLORS.ink};
    letter-spacing: -0.01em;
    margin-bottom: 32px;
  ">Profile</h1>

  <div style="
    background-color: {COLORS.white};
    border: 1px solid {COLORS.outlineVar};
    border-radius: 8px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  ">
    {#if session.userId}
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">User ID</span>
        <span style="
          font-family: {S.fontBody};
          font-size: 14px;
          color: {COLORS.ink};
        ">{session.userId}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Username</span>
        <span style="
          font-family: {S.fontBody};
          font-size: 14px;
          color: {COLORS.ink};
        ">{session.username}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Email</span>
        <span style="
          font-family: {S.fontBody};
          font-size: 14px;
          color: {COLORS.ink};
        ">{session.email}</span>
      </div>
    {:else}
      <p style="
        font-family: {S.fontBody};
        font-size: 14px;
        color: {COLORS.inkMuted};
      ">
        <a href="/auth/login" style="color: {COLORS.red};">Sign in</a> to view your profile.
      </p>
    {/if}
  </div>

  <a href="/" style="
    display: inline-block;
    margin-top: 24px;
    font-family: {S.fontBody};
    font-size: 12px;
    color: {COLORS.inkMuted};
    text-decoration: underline;
  ">← Back to home</a>
</div>
