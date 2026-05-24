<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Character, MagicalArt, Ability } from "$lib/types";

  let { character } = $props<{ character: Character }>();

  const intelligence = $derived(character.characteristics.intelligence);
  const ability = (name: string): number =>
    (character.abilities as Ability[]).find((a) => a.name === name)?.score ?? 0;

  const magicTheory = $derived(ability("Magic Theory"));

  const techniques = $derived(
    (Object.values(character.hermeticData.arts) as MagicalArt[]).filter(
      (a) => a.type === "TECHNIQUE",
    ),
  );
  const forms = $derived(
    (Object.values(character.hermeticData.arts) as MagicalArt[]).filter(
      (a) => a.type === "FORM",
    ),
  );

  let selectedTechnique = $state(techniques[0]?.name ?? "Creo");
  let selectedForm = $state(forms[0]?.name ?? "Animal");
  let aura = $state(0);

  const techScore = $derived(
    character.hermeticData.arts[selectedTechnique]?.score ?? 0,
  );
  const formScore = $derived(
    character.hermeticData.arts[selectedForm]?.score ?? 0,
  );
  const labTotalBase = $derived(intelligence + magicTheory + aura);
  const labTotalFull = $derived(labTotalBase + techScore + formScore);

  const lab = character.hermeticData.laboratory;
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
    <span
      style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Laboratory — {lab.name}</span
    >
  </div>

  <!-- Lab stats -->
  <div
    style="
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid {COLORS.outlineVar};
    background-color: {COLORS.bgHigh};
  "
  >
    {#each [["Size", lab.size], ["Refinement", lab.refinement], ["Safety", lab.safety], ["Quality", lab.generalQuality], ["Health", lab.health], ["Aesthetics", lab.aesthetics], ["Warping", lab.warping], ["Upkeep", lab.upkeep]] as [label, value]}
      <div
        style="
        padding: 6px 8px;
        text-align: center;
        border-right: 1px solid {COLORS.outlineVar};
        border-bottom: 1px solid {COLORS.outlineVar};
      "
      >
        <div
          style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: {COLORS.inkMuted};
        "
        >
          {label}
        </div>
        <div
          style="
          font-family: {S.fontHeadline};
          font-size: 16px;
          font-weight: 700;
          color: {COLORS.ink};
        "
        >
          {value}
        </div>
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
          <option value={tech.name}>{tech.name} ({tech.score})</option>
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
          <option value={form.name}>{form.name} ({form.score})</option>
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
        {labTotalBase}
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
        {labTotalFull}
      </div>
    </div>
  </div>
</div>
