<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Reputation } from "$lib/types/character";

  let { reputations = [] } = $props<{ reputations: Reputation[] }>();
</script>

<div
  style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
"
>
  <div
    style="
    background-color: {COLORS.bgLow};
    padding: 6px 12px;
  "
  >
    <span
      style="
      font-family: {S.fontBody};
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Reputations</span
    >
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      {#each reputations as rep, i}
        <tr
          style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};"
        >
          <td
            style="
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          "
          >
            <div
              style="
              font-family: {S.fontBody};
              font-size: 14px;
              font-style: italic;
              color: {COLORS.ink};
            "
            >
              {rep.name}
            </div>
            <div
              style="
              font-family: {S.fontBody};
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: {COLORS.inkMuted};
            "
            >
              {rep.type} · {rep.scope}
            </div>
          </td>
          <td
            style="
            font-family: {S.fontHeadline};
            font-size: 18px;
            font-weight: 700;
            color: {COLORS.ink};
            text-align: right;
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{rep.score}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
