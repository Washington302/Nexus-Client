<script lang="ts">
  import { COLORS } from "../lib/constants";
  import { character } from "$lib/data/character";
  import {
    ArtsGrid,
    ChipList,
    FolioPanel,
    Tabs,
    AbilityList,
    InfoCard,
    CharacteristicsTable,
    PersonalityTraits,
    Reputations
  } from "$lib/components";

  let modalOpen = $state(false);
  let selectedArt = $state<any>(null);

  function openArt(art: any) {
    selectedArt = art;
    modalOpen = true;
  }

  let activeTab = $state("Arts");
  const tabs = ["Arts", "Spells", "Abilities", "Notes"];

  const targetArtsList = $derived(Object.values(character.hermeticData.arts));
</script>

<div
  style="
background-color: {COLORS.bg}; 
min-height: 100vh; 
padding: 40px 20px;

"
>
  <div
    style="
    max-width: 800px; 
    margin: 0 auto; 
    background-color: {COLORS.white}; 
    border: 1px solid {COLORS.outlineVar}; 
    border-radius: 8px; 
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
"
  >
    <FolioPanel>
      <ChipList virtues={character.virtues} flaws={character.flaws} />
    </FolioPanel>

    <Tabs {tabs} bind:activeTab />
    <div class="tab-content" style="overflow: auto; max-height: 800px;">
      {#if activeTab === "Arts"}
        <ArtsGrid artsList={targetArtsList} />
      {:else if activeTab === "Spells"}
        {#if activeTab === "Spells"}
          <InfoCard {character} />
        {/if}
      {:else if activeTab === "Abilities"}
        <AbilityList abilities={character.abilities} />
      {:else if activeTab === "Notes"}
        <CharacteristicsTable characteristics={character.characteristics} />
        <PersonalityTraits traits={character.personalityTraits} />
        <Reputations reputations={character.reputations} />
      {/if}
    </div>
  </div>
</div>
