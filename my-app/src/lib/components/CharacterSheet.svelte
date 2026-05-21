<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import {
    ArtsGrid,
    AbilityList,
    ChipList,
    CharacteristicsTable,
    PersonalityTraits,
    Reputations,
    InfoCard,
    Tabs,
    DecrepitudeWarping,
    WeaponTable,
    ArmorDisplay,
    CastingTotals,
    LabTotal,
    RawVis,
    LongevityRitual,
    SpellList,
  } from "$lib/components";
  import type { Character } from "$lib/types/character";

  let { character } = $props<{ character: Character }>();

  let activeTab = $state("Abilities");
  const tabs = ["Abilities", "Arts & Lab", "Spells"];

  const artsList = $derived(Object.values(character.hermeticData.arts));
</script>

<div
  style="
  background-color: {COLORS.bg};
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
"
>
  <!-- SHEET HEADER -->
  <div
    style="
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 24px;
    border-bottom: 2px solid {COLORS.ink};
    padding-bottom: 12px;
  "
  >
    <div>
      <h1
        style="
        font-family: {S.fontHeadline};
        font-size: 28px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
      "
      >
        {character.name}
      </h1>
      <span
        style="
        font-family: {S.fontBody};
        font-size: 12px;
        color: {COLORS.inkMuted};
        text-transform: uppercase;
        letter-spacing: 0.1em;
      ">House {character.hermeticData.house} · {character.covenant}</span
      >
    </div>

    <div style="display: flex; gap: 24px; align-items: baseline;">
      <!-- TODO: HeaderStats component — age, size, confidence, decrepitude, warping -->
      <div style="display: flex; gap: 16px;">
        {#each [["Age", character.age], ["Size", character.size], ["Confidence", character.confidence], ["Warping", character.warpingPoints], ["Decrepitude", character.decrepitudePoints]] as [label, value]}
          <div style="text-align: center;">
            <div
              style="
              font-family: {S.fontBody};
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {COLORS.inkMuted};
            "
            >
              {label}
            </div>
            <div
              style="
              font-family: {S.fontHeadline};
              font-size: 18px;
              font-weight: 800;
              color: {COLORS.ink};
            "
            >
              {value}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- MAIN GRID -->
  <div
    style="
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    align-items: start;
  "
  >
    <!-- LEFT COLUMN -->
    <aside style="display: flex; flex-direction: column; gap: 16px;">
      <DecrepitudeWarping
        decrepitudePoints={character.decrepitudePoints}
        warpingPoints={character.warpingPoints}
        agingPoints={character.agingPoints}
      />
      <InfoCard {character} />
      <CharacteristicsTable characteristics={character.characteristics} />
    </aside>

    <!-- RIGHT COLUMN -->
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- ALWAYS VISIBLE: Character meta -->
      <div
        style="
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        align-items: start;
      "
      >
        <!-- Virtues & Flaws -->
        <ChipList virtues={character.virtues} flaws={character.flaws} />

        <!-- Personality & Reputations -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <PersonalityTraits traits={character.personalityTraits} />
          <Reputations reputations={character.reputations} />
        </div>
      </div>

      <div class="ink-divider" />

      <!-- TABBED SECTION -->
      <Tabs {tabs} bind:activeTab />

      <div
        style="overflow: auto; max-height: calc(100vh - 200px); scrollbar-width: none;"
      >
        {#if activeTab === "Abilities"}
          <div
            style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: start;
  "
          >
            <AbilityList abilities={character.abilities} />
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <WeaponTable weapons={character.weapons} />
              <ArmorDisplay
                armor={character.armor}
                encumbrance={character.encumbrance}
                totalLoad={character.totalLoad}
                totalArmorProtection={character.totalArmorProtection}
              />
            </div>
          </div>
        {:else if activeTab === "Arts & Lab"}
          <div
            style="display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: start;"
          >
            <div
              style="position: sticky; top: 0; align-self: start; height: fit-content;"
            >
              <ArtsGrid {artsList} />
            </div>

            <div
              style="display: flex; flex-direction: column; gap: 16px; min-width: 0;"
            >
              <CastingTotals {character} />
              <LabTotal {character} />
              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
              >
                <LongevityRitual warpingPoints={character.warpingPoints} />
                <RawVis entries={[]} />
              </div>
            </div>
          </div>
        {:else if activeTab === "Spells"}
          <div style="overflow: visible;">
            <SpellList spells={character.hermeticData.spells} />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
