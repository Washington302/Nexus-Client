<script lang="ts">
  import { COLORS, S } from '$lib/constants';

  // The game is named here, at the bottom, as an attribution line — never as the
  // app's own name or a page header. The full CC BY-SA 4.0 attribution is at
  // /legal and must stay verbatim there.
</script>

<footer style="
  max-width: 1440px;
  margin: 32px auto 0;
  padding: 16px 32px 24px;
  border-top: 1px solid {COLORS.outlineVar};
  text-align: center;
  font-family: {S.fontBody};
  font-size: 11px;
  line-height: 17px;
  color: {COLORS.inkMuted};
  box-sizing: border-box;
">
  <p style="margin: 0 0 4px;">
    <span style="font-family: {S.fontHeadline}; font-weight: 800;">Scribe Sheets</span>
    &middot; an unofficial character tool for Ars Magica.
  </p>
  <p style="margin: 0;">
    Based on the material for Ars Magica, &copy;1993&ndash;2024, licensed by Trident, Inc. d/b/a
    Atlas Games&reg;, under CC BY-SA 4.0. Ars Magica and Mythic Europe are trademarks of Trident,
    Inc. <a href="/legal" style="color: {COLORS.red};">Licence &amp; attribution</a>
  </p>
</footer>
