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
    WoundTracker,
    FatigueTracker,
    ArtsEditor,
    HermeticInfoHeader,
  } from "$lib/components";
  import EditableWrapper from "./EditableWrapper.svelte";
  import CharacteristicsEditor from "./CharacteristicsEditor.svelte";
  import AbilityEditor from "./AbilityEditor.svelte";
  import PersonalityTraitEditor from "./PersonalityTraitEditor.svelte";
  import WoundEditor from "./WoundEditor.svelte";
  import TraitEditor from "./TraitEditor.svelte";
  import InfoCardEditor from "./InfoCardEditor.svelte";
  import type { ArsCharacter } from "$lib/types/character";
  import type { Spell } from "$lib/types";
  import Modal from "./Modal.svelte";
  import SpellModal from "./SpellModal.svelte";

  let {
    character = $bindable(null as ArsCharacter | null),
    isEditable = false,
    onSaveField = async (_field: string, _data: unknown) => {},
  } = $props<{
    character: ArsCharacter | null;
    isEditable?: boolean;
    onSaveField?: (field: string, data: unknown) => Promise<void>;
  }>();

  let activeTab = $state("Abilities");

  const tabs = $derived(
    character?.type === "MAGUS"
      ? ["Abilities", "Hermetic", "Spells", "Combat"]
      : ["Abilities", "Combat"]
  );

  const artsList = $derived(character ? Object.values(character.hermeticData?.arts ?? {}) : []);

  // Spell modal state
  let showSpellModal = $state(false);
  let editingSpell = $state<Spell | null>(null);

  function openCreateSpell() {
    editingSpell = null;
    showSpellModal = true;
  }

  function openEditSpell(spell: Spell) {
    editingSpell = { ...spell, requisites: { ...spell.requisites } };
    showSpellModal = true;
  }

  function handleSaveSpell(spell: Spell) {
    if (!character.hermeticData) (character as any).hermeticData = { arts: {}, house: '', wizardsSigil: '', domusMagna: '', primus: '', parens: '', covenantOfApprenticeship: '', twilightPending: false };
    if (!character.hermeticData!.spells) character.hermeticData!.spells = {};
    if (editingSpell && editingSpell.name !== spell.name) {
      delete character.hermeticData!.spells[editingSpell.name];
    }
    character.hermeticData!.spells[spell.name] = spell;
    showSpellModal = false;
  }
</script>

{#if character}
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
        ">House {character.hermeticData?.house ?? '—'} · {character.covenant}</span
        >
      </div>

      <div style="display: flex; gap: 24px; align-items: baseline;">
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
        <EditableWrapper
          isEditable={isEditable}
          title="Edit Characteristics"
          onSave={() => onSaveField('characteristics', character.characteristics)}
        >
          {#snippet children()}
            <CharacteristicsTable characteristics={character.characteristics} />
          {/snippet}
          {#snippet editForm()}
            <CharacteristicsEditor bind:characteristics={character.characteristics} />
          {/snippet}
        </EditableWrapper>

        <DecrepitudeWarping
          decrepitudePoints={character.decrepitudePoints}
          warpingPoints={character.warpingPoints}
          agingPoints={character.agingPoints}
          onSave={onSaveField}
        />
        <EditableWrapper
          isEditable={isEditable}
          title="Edit Character Info"
          onSave={() => onSaveField('info', {
            birthName: character.birthName,
            yearBorn: character.yearBorn,
            gender: character.gender,
            raceNationality: character.raceNationality,
            placeOfOrigin: character.placeOfOrigin,
            religion: character.religion,
            titleProfession: character.titleProfession,
            height: character.height,
            weight: character.weight,
            hair: character.hair,
            eyes: character.eyes,
            handedness: character.handedness,
            saga: character.saga,
            setting: character.setting,
            currentYear: character.currentYear,
            covenant: character.covenant,
          })}
        >
          {#snippet children()}
            <InfoCard {character} />
          {/snippet}
          {#snippet editForm()}
            <InfoCardEditor bind:character />
          {/snippet}
        </EditableWrapper>
      </aside>

      <!-- RIGHT COLUMN -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div
          style="
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        align-items: start;
      "
        >
          <EditableWrapper
            isEditable={isEditable}
            title="Edit Virtues & Flaws"
            onSave={() => onSaveField('virtues_flaws', { virtues: character.virtues, flaws: character.flaws })}
          >
            {#snippet children()}
              <ChipList virtues={character.virtues} flaws={character.flaws} />
            {/snippet}
            {#snippet editForm()}
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                  <div style="font-family: {S.fontHeadline}; font-size: 13px; font-weight: 700; color: {COLORS.ink}; margin-bottom: 8px;">Virtues</div>
                  <TraitEditor bind:traits={character.virtues} />
                </div>
                <div>
                  <div style="font-family: {S.fontHeadline}; font-size: 13px; font-weight: 700; color: {COLORS.red}; margin-bottom: 8px;">Flaws</div>
                  <TraitEditor bind:traits={character.flaws} />
                </div>
              </div>
            {/snippet}
          </EditableWrapper>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <EditableWrapper
              isEditable={isEditable}
              title="Edit Personality Traits"
              onSave={() => onSaveField('personalityTraits', character.personalityTraits)}
            >
              {#snippet children()}
                <PersonalityTraits traits={character.personalityTraits} />
              {/snippet}
              {#snippet editForm()}
                <PersonalityTraitEditor bind:traits={character.personalityTraits} />
              {/snippet}
            </EditableWrapper>

            <EditableWrapper
              isEditable={isEditable}
              title="Edit Reputations"
              onSave={() => onSaveField('reputations', character.reputations)}
            >
              {#snippet children()}
                <Reputations reputations={character.reputations} />
              {/snippet}
              {#snippet editForm()}
                <Reputations reputations={character.reputations} />
              {/snippet}
            </EditableWrapper>
          </div>
        </div>

        <div class="ink-divider" />

        <div
          style="
          display: flex;
          flex-direction: column;
          height: 800px;
          border: 1px solid {COLORS.outlineVar};
          border-radius: 8px;
          overflow: hidden;
          background-color: transparent;
        "
        >
          <div style="padding: 12px 12px 0 12px;">
            <Tabs {tabs} bind:activeTab />
          </div>

          <div
            style="
            flex: 1;
            overflow-y: auto;
            padding: 0 12px 12px 12px;
            scrollbar-width: none;
          "
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
                <EditableWrapper
                  isEditable={isEditable}
                  title="Edit Abilities"
                  onSave={() => onSaveField('abilities', character.abilities)}
                >
                  {#snippet children()}
                    <AbilityList abilities={character.abilities} />
                  {/snippet}
                  {#snippet editForm()}
                    <AbilityEditor bind:abilities={character.abilities} />
                  {/snippet}
                </EditableWrapper>

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
            {:else if activeTab === "Hermetic"}
              <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                <EditableWrapper
                  isEditable={isEditable}
                  title="Edit Hermetic Info"
                  onSave={() => onSaveField('hermeticInfo', {
                    covenant: character.covenant,
                    house: character.hermeticData?.house ?? '',
                    wizardsSigil: character.hermeticData?.wizardsSigil ?? '',
                    domusMagna: character.hermeticData?.domusMagna ?? '',
                    primus: character.hermeticData?.primus ?? '',
                    parens: character.hermeticData?.parens ?? '',
                    covenantOfApprenticeship: character.hermeticData?.covenantOfApprenticeship ?? '',
                  })}
                >
                  {#snippet children()}
                    <HermeticInfoHeader {character} />
                  {/snippet}
                  {#snippet editForm()}
                    <HermeticInfoHeader {character} editing={true} />
                  {/snippet}
                </EditableWrapper>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: start;">
                  <div style="position: sticky; top: 0; align-self: start; height: fit-content;">
                    {#if character.hermeticData}
                      <EditableWrapper
                        isEditable={isEditable}
                        title="Edit Arts"
                        onSave={() => onSaveField('arts', character.hermeticData!.arts)}
                      >
                        {#snippet children()}
                          <ArtsGrid {artsList} />
                        {/snippet}
                        {#snippet editForm()}
                          <ArtsEditor bind:arts={character.hermeticData!.arts} />
                        {/snippet}
                      </EditableWrapper>
                    {:else}
                      <ArtsGrid {artsList} />
                    {/if}
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0;">
                    <CastingTotals {character} />
                    <LabTotal {character} />
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                      <LongevityRitual warpingPoints={character.warpingPoints} />
                    </div>
                  </div>
                </div>
              </div>
            {:else if activeTab === "Spells"}
              <div style="overflow: visible;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                  {#if isEditable}
                    <button onclick={openCreateSpell} style="padding:6px 14px; border:1px dashed {COLORS.outlineVar}; border-radius:6px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;" onmouseenter={(e) => (e.target as HTMLElement).style.borderColor = COLORS.red} onmouseleave={(e) => (e.target as HTMLElement).style.borderColor = COLORS.outlineVar}>+ Create Spell</button>
                  {/if}
                </div>
                <SpellList spells={character.hermeticData?.spells ?? {}} {isEditable} onEdit={openEditSpell} />
              </div>
            {:else if activeTab === "Combat"}
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <EditableWrapper
                    isEditable={isEditable}
                    title="Edit Fatigue"
                    onSave={() => onSaveField('fatigue', { currentFatigueLevel: character.currentFatigueLevel })}
                  >
                    {#snippet children()}
                      <FatigueTracker currentFatigueLevel={character.currentFatigueLevel} />
                    {/snippet}
                    {#snippet editForm()}
                      <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted};">
                        Fatigue level editing coming soon.
                      </p>
                    {/snippet}
                  </EditableWrapper>

                  <EditableWrapper
                    isEditable={isEditable}
                    title="Edit Wound Track"
                    onSave={() => onSaveField('wounds', character.track)}
                  >
                    {#snippet children()}
                      <WoundTracker track={character.track} size={character.size} />
                    {/snippet}
                    {#snippet editForm()}
                      <WoundEditor bind:track={character.track} />
                    {/snippet}
                  </EditableWrapper>
                </div>
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
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal bind:open={showSpellModal} title={editingSpell ? `Edit: ${editingSpell.name}` : 'Create Spell'}>
    {#snippet children()}
      <SpellModal spell={editingSpell} onSave={handleSaveSpell} onClose={() => showSpellModal = false} />
    {/snippet}
  </Modal>
{/if}
