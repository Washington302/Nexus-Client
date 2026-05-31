<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { ArsCharacter } from '$lib/types';

  let { character } = $props<{ character: ArsCharacter }>();

  const rows = $derived([
    ['Birth Name',      character.birthName],
    ['Year Born',       character.yearBorn],
    ['Gender',          character.gender],
    ['Nationality',     character.raceNationality],
    ['Origin',          character.placeOfOrigin],
    ['Religion',        character.religion],
    ['Profession',      character.titleProfession],
    ['Height',          `${character.height}m`],
    ['Weight',          `${character.weight}kg`],
    ['Hair',            character.hair],
    ['Eyes',            character.eyes],
    ['Handedness',      character.handedness],
    ['Saga',            character.saga],
    ['Setting',         character.setting],
    ['Current Year',    character.currentYear],
    ['Covenant',        character.covenant],
  ]);
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      {#each rows as [label, value], i}
        <tr style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};">
          <td style="
            font-family: {S.fontBody};
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            padding: 8px 12px;
            width: 40%;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{label}</td>
          <td style="
            font-family: {S.fontBody};
            font-size: 13px;
            color: {COLORS.ink};
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>