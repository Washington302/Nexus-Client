<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { ArsCharacter, MagicalArt, Ability } from "$lib/types";

  import { labTotalFull, labTotalBase, abilityScoreFromXp, artScoreFromXp } from '$lib/utils/arsmagica';

  let { character } = $props<{ character: ArsCharacter }>();

  const intelligence = $derived(character.characteristics.scores.INTELLIGENCE);
  const abilityExp = (name: string): number =>
  character?.abilities?.[name]?.exp ?? 0;

  const magicTheory    = $derived(abilityScoreFromXp(abilityExp('Magic Theory')));
  
  const arts = $derived(character?.hermeticData?.arts || {});

  const techniques = $derived(
    (Object.values(arts) as MagicalArt[]).filter(a => a.type === 'TECHNIQUE')
  );
  
  const forms = $derived(
    (Object.values(arts) as MagicalArt[]).filter(a => a.type === 'FORM')
  );

let selectedTechnique = $state('Creo');
  let selectedForm = $state('Animal');
  let aura = $state(0);
  

  // Dynamic score resolution
  const techScore = $derived(artScoreFromXp(arts[selectedTechnique]?.exp ?? 0));
  const formScore = $derived(artScoreFromXp(arts[selectedForm]?.exp ?? 0));
  const base = $derived(labTotalBase(intelligence, magicTheory, aura));
  const full = $derived(labTotalFull(intelligence, magicTheory, aura, techScore, formScore));

  const lab = $derived(character.hermeticData?.laboratory ?? null);
  
const labStats = $derived(lab ? [
  ['Size',        lab.characteristics.SIZE          ?? 0],
  ['Refinement',  lab.characteristics.scores.REFINEMENT  ?? 0],
  ['Safety',      lab.characteristics.scores.SAFETY      ?? 0],
  ['Quality',     lab.characteristics.scores.GENERAL_QUALITY ?? 0],
  ['Health',      lab.characteristics.scores.HEALTH      ?? 0],
  ['Aesthetics',  lab.characteristics.scores.AESTHETICS  ?? 0],
  ['Warping',     lab.characteristics.scores.WARPING     ?? 0],
  ['Upkeep',      lab.characteristics.scores.UPKEEP      ?? 0],
] : []);
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
  <!-- Header -->
  <div
    style="
    background-color: {COLORS.bgLow};
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 6px 12px;
  "
  >

  </div>

  <!-- Lab stats -->
  <div style="display: grid; grid-template-columns: repeat(4, 1fr);">
    {#each labStats as [label, value]}
      <div style="
        padding: 6px 8px;
        text-align: center;
        border-right: 1px solid {COLORS.outlineVar};
        border-bottom: 1px solid {COLORS.outlineVar};
      ">
        <div style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: {COLORS.inkMuted};
        ">{label}</div>
        <div style="
          font-family: {S.fontHeadline};
          font-size: 16px;
          font-weight: 700;
          color: {COLORS.ink};
        ">{value}</div>
      </div>
    {/each}
  </div>

  <!-- Selectors + Aura -->
  <div
    style="
    display: grid;
    grid-template-columns: 1fr 1fr 80px;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid {COLORS.outlineVar};
  "
  >
    <div>
      <label
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Technique</label
      >
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
          <option value={tech.name}>{tech.name} ({artScoreFromXp(tech.exp)})</option>
        {/each}
      </select>
    </div>

    <div>
      <label
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Form</label
      >
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
          <option value={form.name}>{form.name} ({artScoreFromXp(form.exp)})</option>
        {/each}
      </select>
    </div>

    <div>
      <label
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        display: block;
        margin-bottom: 4px;
      ">Aura</label
      >
      <input
        type="number"
        bind:value={aura}
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
      />
    </div>
  </div>

  <!-- Totals -->
  <div
    style="
    display: grid;
    grid-template-columns: 1fr 1fr;
  "
  >
    <div
      style="
      padding: 12px;
      border-right: 1px solid {COLORS.outlineVar};
      text-align: center;
    "
    >
      <div
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      "
      >
        Base Lab Total
      </div>
      <div
        style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-style: italic;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      "
      >
        Int + Magic Theory + Aura
      </div>
      <div
        style="
        font-family: {S.fontHeadline};
        font-size: 28px;
        font-weight: 800;
        color: {COLORS.red};
      "
      >
        {base}
      </div>
    </div>

    <div style="padding: 12px; text-align: center;">
      <div
        style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      "
      >
        Full Lab Total
      </div>
      <div
        style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-style: italic;
        color: {COLORS.inkMuted};
        margin-bottom: 4px;
      "
      >
        Base + Tech + Form
      </div>
      <div
        style="
        font-family: {S.fontHeadline};
        font-size: 28px;
        font-weight: 800;
        color: {COLORS.red};
      "
      >
        {full}
      </div>
    </div>
  </div>
</div>
