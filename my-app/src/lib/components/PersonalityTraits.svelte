<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { PersonalityTrait } from "$lib/types/character";

  let { traits = [] } = $props<{ traits: PersonalityTrait[] }>();
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
    ">Personality Traits</span
    >
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      {#each traits as trait, i}
        <tr
          style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};"
        >
          <td
            style="
            font-family: {S.fontBody};
            font-size: 14px;
            font-style: italic;
            color: {COLORS.ink};
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          "
          >
            {trait.name}
            {#if trait.essential}
              <span
                style="
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: {COLORS.inkMuted};
                margin-left: 4px;
              ">essential</span
              >
            {/if}
          </td>
          <td
            style="
            font-family: {S.fontHeadline};
            font-size: 18px;
            font-weight: 700;
            color: {COLORS.red};
            text-align: right;
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">+{trait.score}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
