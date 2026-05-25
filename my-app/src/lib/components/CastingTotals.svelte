<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import {
    castingScore,
    formulaicBase,
    ritualBase,
    spontFatigueBase,
    spontNoFatigueBase,
    ceremonialBaseTrunk,
    magicResistance,
    fastCastingBase,
    multiCastingBase,
    baseTargetingBase,
    concentrationBase,
  } from '$lib/utils/arsmagica';

  // 1. Target your updated type infrastructure
  import type { Character, MagicalArt } from '$lib/types';

  let { character } = $props<{ character: Character }>();

  // 2. Safe-navigation check on hermeticData to prevent grog/companion or unhydrated page crashes
  const arts = $derived(character?.hermeticData?.arts || {});

  // 3. Extract uppercase nested scores to align perfectly with your backend models
  const stamina      = $derived(character?.characteristics?.scores?.STAMINA ?? 0);
  const intelligence = $derived(character?.characteristics?.scores?.INTELLIGENCE ?? 0);
  const perception   = $derived(character?.characteristics?.scores?.PERCEPTION ?? 0);
  const quickness    = $derived(character?.characteristics?.scores?.QUICKNESS ?? 0);

  // 4. Transform dynamic dictionary maps to categorized array structures safely
// Explicitly cast the array values as MagicalArt[] so TypeScript knows what 'a' is!
  const techniques = $derived(
    (Object.values(arts) as MagicalArt[]).filter(a => a.type === 'TECHNIQUE')
  );
  
  const forms = $derived(
    (Object.values(arts) as MagicalArt[]).filter(a => a.type === 'FORM')
  );

  // Safe dictionary method to look up abilities from the Record structure
const ability = (name: string): number =>
  character?.abilities?.[name]?.score ?? 0;

  const magicTheory    = $derived(ability('Magic Theory'));
  const artesLiberales = $derived(ability('Artes Liberales'));
  const philosophiae   = $derived(ability('Philosophiae'));
  const finesse        = $derived(ability('Finesse'));
  const concentration  = $derived(ability('Concentration'));
  const penetration    = $derived(ability('Penetration'));
  const parma          = $derived(ability('Parma Magica'));

  // 5. Reactive selection state variables initialized to safe defaults
  let selectedTechnique = $state('Creo');
  let selectedForm = $state('Animal');
  let aura = $state(0);
  
  // Dynamic score resolution
  const techScore = $derived(arts[selectedTechnique]?.score ?? 0);
  const formScore = $derived(arts[selectedForm]?.score ?? 0);

  // 6. Rules formulas calculations
  const castingScoreBase = $derived(castingScore(techScore, formScore, stamina, aura));
  const formulaic        = $derived(formulaicBase(techScore, formScore, stamina, aura));
  const ritual           = $derived(ritualBase(techScore, formScore, stamina, aura, artesLiberales, philosophiae));
  const spontFatigue     = $derived(spontFatigueBase(techScore, formScore, stamina, aura));
  const spontNoFatigue   = $derived(spontNoFatigueBase(techScore, formScore, stamina, aura));

  const fastCasting           = $derived(fastCastingBase(quickness, finesse));
  const multiCasting          = $derived(multiCastingBase(intelligence, finesse));
  const baseTargeting         = $derived(baseTargetingBase(perception, finesse));
  const concentrationTotal    = $derived(concentrationBase(stamina, concentration));
  const magicResistanceTotal  = $derived(magicResistance(parma, formScore));
  const ceremonialCasting     = $derived(ceremonialBaseTrunk(castingScoreBase, artesLiberales, philosophiae));

  // Shared Styles
  const selectStyle = `
    width: 100%;
    font-family: ${S.fontBody};
    font-size: 13px;
    color: ${COLORS.ink};
    background-color: ${COLORS.white};
    border: 1px solid ${COLORS.outlineVar};
    padding: 4px 8px;
    box-sizing: border-box;
  `;

  const labelStyle = `
    font-family: ${S.fontBody};
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${COLORS.inkMuted};
    display: block;
    margin-bottom: 4px;
  `;

  const rowLabel = `
    font-family: ${S.fontBody};
    font-size: 12px;
    font-weight: 600;
    color: ${COLORS.ink};
    padding: 8px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
  `;

  const rowFormula = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-style: italic;
    color: ${COLORS.inkMuted};
    display: block;
    margin-top: 2px;
  `;

  const rowValue = `
    font-family: ${S.fontHeadline};
    font-size: 16px;
    font-weight: 800;
    color: ${COLORS.red};
    padding: 8px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    text-align: right;
  `;
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <div style="
    background-color: {COLORS.bgLow};
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 6px 12px;
  ">
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Base Casting Totals</span>
  </div>

  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr 80px;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
    background-color: {COLORS.bgHigh};
  ">
    <div>
      <label style={labelStyle} for="technique-select">Technique</label>
      <select bind:value={selectedTechnique} style={selectStyle}>
        {#each techniques as tech}
          <option value={tech.name}>{tech.name} ({tech.score})</option>
        {/each}
      </select>
    </div>

    <div>
      <label style={labelStyle} for="form-select">Form</label>
      <select bind:value={selectedForm} style={selectStyle}>
        {#each forms as form}
          <option value={form.name}>{form.name} ({form.score})</option>
        {/each}
      </select>
    </div>

    <div>
      <label style={labelStyle} for="aura-input">Aura</label>
      <input type="number" id="aura-input" bind:value={aura} style={selectStyle} />
    </div>
  </div>

  <div style="
    background-color: {COLORS.bgHigh};
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  ">
    <div>
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">Casting Score</span>
      <span style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-style: italic;
        color: {COLORS.inkMuted};
        margin-left: 8px;
      ">Tech + Form + Sta + Aura</span>
    </div>
    <span style="
      font-family: {S.fontHeadline};
      font-size: 22px;
      font-weight: 800;
      color: {COLORS.ink};
    ">{castingScoreBase}</span>
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      <tr>
        <td style={rowLabel}>
          Formulaic
          <span style={rowFormula}>Casting Score + die</span>
        </td>
        <td style={rowValue}>{formulaic} + die</td>
      </tr>
      <tr>
        <td style={rowLabel}>
          Ritual
          <span style={rowFormula}>Casting Score + AL + Phil + stress die</span>
        </td>
        <td style={rowValue}>{ritual} + die</td>
      </tr>
      <tr>
        <td style={rowLabel}>
          Spontaneous (Fatigue)
          <span style={rowFormula}>(Casting Score + stress die) / 2</span>
        </td>
        <td style={rowValue}>{spontFatigue} + die/2</td>
      </tr>
      <tr>
        <td style={rowLabel}>
          Spontaneous (No Fatigue)
          <span style={rowFormula}>Casting Score / 5</span>
        </td>
        <td style={rowValue}>{spontNoFatigue}</td>
      </tr>
    </tbody>
  </table>

  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid {COLORS.outlineVar};
  ">
    {#each [
      ['Fast Casting Speed', fastCasting, 'Qik + Finesse + die'],
      ['Concentration', concentrationTotal, 'Sta + Concentration + die'],
      ['Magic Resistance', magicResistanceTotal, 'Parma × 5 + Form'],
      ['Multiple Casting', multiCasting, 'Int + Finesse + die'],
      ['Base Targeting', baseTargeting, 'Per + Finesse + die'],
      ['Ceremonial Casting', ceremonialCasting, 'Casting Score + AL + Phil'],
    ] as [label, value, formula]}
      <div style="
        padding: 8px 12px;
        border-bottom: 1px solid {COLORS.outlineVar};
        border-right: 1px solid {COLORS.outlineVar};
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: 600;
            color: {COLORS.ink};
          ">{label}</div>
          <div style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-style: italic;
            color: {COLORS.inkMuted};
          ">{formula}</div>
        </div>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 16px;
          font-weight: 800;
          color: {COLORS.red};
        ">{value}</span>
      </div>
    {/each}
  </div>
</div>