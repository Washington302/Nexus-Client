<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Character, Art, Ability } from '$lib/types/character';

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

  const techScore = $derived(
    character.hermeticData.arts[selectedTechnique]?.score ?? 0
  );
  const formScore = $derived(
    character.hermeticData.arts[selectedForm]?.score ?? 0
  );

  const formulaic = $derived(techScore + formScore + stamina);
  const ritual = $derived(techScore + formScore + stamina + artesLiberales + philosophiae);
  const spontFatigue = $derived(Math.floor((techScore + formScore + stamina) / 2));
  const spontNoFatigue = $derived(Math.floor((techScore + formScore + stamina) / 5));

  const labTotal = $derived(intelligence + magicTheory);
  const parmaTotal = $derived(parma * 5);

  const rowLabel = `
    font-family: ${S.fontBody};
    font-size: 12px;
    font-weight: 600;
    color: ${COLORS.inkMuted};
    padding: 8px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    width: 50%;
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

  const rowFormula = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-style: italic;
    color: ${COLORS.inkMuted};
    display: block;
    margin-top: 2px;
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

  <!-- Technique + Form selectors -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
    background-color: {COLORS.bgHigh};
  ">
    <div>
      <label style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Technique</label>
      <select
        bind:value={selectedTechnique}
        style="
          width: 100%;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
          border: 1px solid {COLORS.outlineVar};
          padding: 4px 8px;
          box-sizing: border-box;
        "
      >
        {#each techniques as tech}
          <option value={tech.name}>{tech.name} ({tech.score})</option>
        {/each}
      </select>
    </div>

    <div>
      <label style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Form</label>
      <select
        bind:value={selectedForm}
        style="
          width: 100%;
          font-family: {S.fontBody};
          font-size: 13px;
          color: {COLORS.ink};
          background-color: {COLORS.white};
          border: 1px solid {COLORS.outlineVar};
          padding: 4px 8px;
          box-sizing: border-box;
        "
      >
        {#each forms as form}
          <option value={form.name}>{form.name} ({form.score})</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Totals table -->
  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      <tr>
        <td style={rowLabel}>
          Formulaic
          <span style={rowFormula}>Tech + Form + Sta + Aura + die</span>
        </td>
        <td style={rowValue}>{formulaic}</td>
      </tr>
      <tr>
        <td style={rowLabel}>
          Ritual
          <span style={rowFormula}>Tech + Form + Sta + Aura + AL + Phil + die</span>
        </td>
        <td style={rowValue}>{ritual}</td>
      </tr>
      <tr>
        <td style={rowLabel}>
          Spontaneous (Fatigue)
          <span style={rowFormula}>(Tech + Form + Sta + Aura + stress die) / 2</span>
        </td>
        <td style={rowValue}>{spontFatigue}</td>
      </tr>
      <tr>
        <td style={rowLabel}>
          Spontaneous (No Fatigue)
          <span style={rowFormula}>(Tech + Form + Sta + Aura) / 5</span>
        </td>
        <td style={rowValue}>{spontNoFatigue}</td>
      </tr>
    </tbody>
  </table>

  <!-- Other totals -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid {COLORS.outlineVar};
  ">
    {#each [
      ['Fast Casting', `${quickness + finesse}`, 'Qik + Finesse'],
      ['Concentration', `${stamina + concentration}`, 'Sta + Concentration'],
      ['Magic Resistance', `${parmaTotal + formScore}`, 'Parma × 5 + Form'],
      ['Multiple Casting', `${intelligence + finesse}`, 'Int + Finesse'],
      ['Base Targeting', `${perception + finesse}`, 'Per + Finesse'],
      ['Determining Effect', `${perception}`, 'Per + Awareness'],
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