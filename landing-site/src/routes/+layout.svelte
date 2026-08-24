<script lang="ts">
  import { COLORS, S } from '$lib/constants';

  let { children } = $props();
</script>

<header style="
  border-bottom: 2px solid {COLORS.ink};
  padding: 16px 32px;
">
  <div style="
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  ">
    <a href="/" style="
      font-family: {S.fontHeadline};
      font-size: 18px;
      font-weight: 800;
      color: {COLORS.ink};
      letter-spacing: -0.01em;
      text-decoration: none;
    ">SCRIBE SHEETS</a>
    <nav style="display: flex; gap: 20px;">
      <a href="/auth/login" style="
        font-family: {S.fontBody};
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        text-decoration: none;
      ">Sign In</a>
      <a href="/auth/register" style="
        font-family: {S.fontBody};
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.red};
        text-decoration: none;
      ">Create Account</a>
    </nav>
  </div>
</header>

{@render children()}

<footer style="
  border-top: 1px solid {COLORS.outlineVar};
  padding: 24px 32px;
  margin-top: 48px;
">
  <p style="
    max-width: 1440px;
    margin: 0 auto;
    font-family: {S.fontBody};
    font-size: 11px;
    color: {COLORS.inkMuted};
    text-align: center;
  ">&copy; {new Date().getFullYear()} Scribe Sheets. Each game's rules and setting content is used under its own publisher license — see that game's site for its specific notice.</p>
</footer>
