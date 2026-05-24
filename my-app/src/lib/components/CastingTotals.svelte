<script lang="ts">
  import { COLORS, S } from '$lib/constants';

import type { Character, Art, Ability } from '$lib/types/character.old';

  let { character } = $props<{ character: Character }>();

  const stamina = $derived(character.characteristics.stamina);
const techniques = $derived(
  (Object.values(character.hermeticData.arts) as Art[]).filter(a => a.type === 'TECHNIQUE')
);
const forms = $derived(
  (Object.values(character.hermeticData.arts) as Art[]).filter(a => a.type === 'FORM')
);

const ability = (name: string): number =>
  (character.abilities as Ability[]).find(a => a.name === name)?.score ?? 0;

const magicTheory    = $derived(ability('Magic Theory'));
const artesLiberales = $derived(ability('Artes Liberales'));
const philosophiae   = $derived(ability('Philosophiae'));
const finesse        = $derived(ability('Finesse'));
const concentration  = $derived(ability('Concentration'));
const penetration    = $derived(ability('Penetration'));
const parma          = $derived(ability('Parma Magica'));


  const perception = $derived(character.characteristics.perception);
  const intelligence = $derived(character.characteristics.intelligence);
  const quickness = $derived(character.characteristics.quickness);

  // Selected technique and form for total calculation
  let selectedTechnique = $state(techniques[0]?.name ?? 'Creo');
  let selectedForm = $state(forms[0]?.name ?? 'Animal');

  let aura = $state(0);

  const techScore = $derived(character.hermeticData.arts[selectedTechnique]?.score ?? 0);
  const formScore = $derived(character.hermeticData.arts[selectedForm]?.score ?? 0);

  // Core casting score — everything derives from this
  const castingScore = $derived(techScore + formScore + stamina + aura);

  // Casting totals per rulebook
  const formulaic = $derived(castingScore); // + stress/simple die at table
  const ritual = $derived(castingScore + artesLiberales + philosophiae); // + stress die
  const spontFatigue = $derived(Math.floor((castingScore) / 2)); // + stress die then /2
  const spontNoFatigue = $derived(Math.floor(castingScore / 5));

  // Other totals
  const fastCasting = $derived(quickness + finesse);
  const multiCasting = $derived(intelligence + finesse);
  const baseTargeting = $derived(perception + finesse);
  const concentrationTotal = $derived(stamina + concentration);
  const magicResistance = $derived((parma * 5) + formScore);

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
  <!-- Header -->
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

  <!-- Selectors -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr 80px;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
    background-color: {COLORS.bgHigh};
  ">
    <div>
      <label style={labelStyle}>Technique</label>
      <select bind:value={selectedTechnique} style={selectStyle}>
        {#each techniques as tech}
          <option value={tech.name}>{tech.name} ({tech.score})</option>
        {/each}
      </select>
    </div>

    <div>
      <label style={labelStyle}>Form</label>
      <select bind:value={selectedForm} style={selectStyle}>
        {#each forms as form}
          <option value={form.name}>{form.name} ({form.score})</option>
        {/each}
      </select>
    </div>

    <div>
      <label style={labelStyle}>Aura</label>
      <input
        type="number"
        bind:value={aura}
        style={selectStyle}
      />
    </div>
  </div>

  <!-- Casting Score Banner -->
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
    ">{castingScore}</span>
  </div>

  <!-- Main Casting Totals -->
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

  <!-- Secondary Totals -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid {COLORS.outlineVar};
  ">
    {#each [
      ['Fast Casting Speed', fastCasting, 'Qik + Finesse + die'],
      ['Concentration', concentrationTotal, 'Sta + Concentration + die'],
      ['Magic Resistance', magicResistance, 'Parma × 5 + Form'],
      ['Multiple Casting', multiCasting, 'Int + Finesse + die'],
      ['Base Targeting', baseTargeting, 'Per + Finesse + die'],
      ['Ceremonial Casting', castingScore + artesLiberales + philosophiae, 'Casting Score + AL + Phil'],
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