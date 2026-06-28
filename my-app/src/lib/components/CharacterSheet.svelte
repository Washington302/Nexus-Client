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
    FamiliarSection,
    YearLog,
  } from "$lib/components";
  import EditableWrapper from "./EditableWrapper.svelte";
  import CharacteristicsEditor from "./CharacteristicsEditor.svelte";
  import AbilityEditor from "./AbilityEditor.svelte";
  import PersonalityTraitEditor from "./PersonalityTraitEditor.svelte";
  import TraitEditor from "./TraitEditor.svelte";
  import InfoCardEditor from "./InfoCardEditor.svelte";
  import type { ArsCharacter } from "$lib/types/character";
  import type { Spell, Weapon, Armor } from "$lib/types";
  import Modal from "./Modal.svelte";
  import SpellModal from "./SpellModal.svelte";
  import { api } from "$lib/services/api";

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
        ? ["Abilities", "Hermetic", "Spells", "Familiar", "Combat"]
      : ["Abilities", "Combat"]
  );

  const artsList = $derived(character ? Object.values(character.hermeticData?.arts ?? {}) : []);

  const str = $derived(character?.characteristics?.scores?.STRENGTH ?? 0);
  const sta = $derived(character?.characteristics?.scores?.STAMINA ?? 0);
  const wornArmorLoad = $derived((character?.armor ?? []).filter((a: Armor) => a.worn).reduce((s: number, a: Armor) => s + a.load, 0));
  const shieldLoad = $derived((character?.weapons ?? []).filter((w: Weapon) => w.shield && w.equipped).reduce((s: number, w: Weapon) => s + w.load, 0));
  const totalLoad = $derived(wornArmorLoad + shieldLoad);
  const encumbrance = $derived(Math.max(0, totalLoad - str));
  const armorProtection = $derived((character?.armor ?? []).filter((a: Armor) => a.worn).reduce((s: number, a: Armor) => s + a.protection, 0));
  const bronzeCord = $derived(character?.hermeticData?.familiar?.bronzeCord ?? 0);
  const soak = $derived(sta + armorProtection + bronzeCord);
  const vimScore = $derived(character?.hermeticData?.arts?.Vim?.score ?? 0);

  const fatiguePenalty = $derived.by(() => {
    const map: Record<string, number | null> = { Fresh: null, Winded: 0, Weary: -1, Tired: -3, Dazed: -5, Unconscious: null };
    return map[character?.currentFatigueLevel ?? 'Fresh'] ?? 0;
  });
  const woundPenalty = $derived((character?.track ?? []).reduce((s: number, w: import('$lib/types').Wound) => s + w.penalty * w.currentWounds, 0));
  const totalPenalty = $derived(fatiguePenalty + woundPenalty);

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

  async function handleDeleteSpell(spellName: string) {
    if (!character?.hermeticData?.spells) return;
    delete character.hermeticData.spells[spellName];
    await onSaveField('hermeticData', character.hermeticData);
  }

  // Weapon handlers — each action calls API immediately
  async function handleWeaponAdd(w: Weapon) {
    if (!character) return;
    await api.character.weapons.add(character.id, w);
    character.weapons = await api.character.weapons.list(character.id);
  }
  async function handleWeaponRemove(name: string) {
    if (!character) return;
    await api.character.weapons.remove(character.id, name);
    character.weapons = await api.character.weapons.list(character.id);
  }
  async function handleWeaponEquip(name: string) {
    if (!character) return;
    await api.character.weapons.equip(character.id, name);
    character.weapons = await api.character.weapons.list(character.id);
  }
  async function handleWeaponUnequip(name: string) {
    if (!character) return;
    await api.character.weapons.unequip(character.id, name);
    character.weapons = await api.character.weapons.list(character.id);
  }

  // Armor handlers
  async function handleArmorAdd(piece: Armor) {
    if (!character) return;
    await api.character.armor.add(character.id, piece);
    character.armor = await api.character.armor.list(character.id);
  }
  async function handleArmorRemove(name: string) {
    if (!character) return;
    await api.character.armor.remove(character.id, name);
    character.armor = await api.character.armor.list(character.id);
  }
  async function handleArmorWear(name: string) {
    if (!character) return;
    await api.character.armor.wear(character.id, name);
    character.armor = await api.character.armor.list(character.id);
  }
  async function handleArmorRemoveWorn(name: string) {
    if (!character) return;
    await api.character.armor.removeWorn(character.id, name);
    character.armor = await api.character.armor.list(character.id);
  }

  // Header inline editing
  let editingHeaderField = $state<string | null>(null);
  let editHeaderValue = $state<string>('');

  function startHeaderEdit(field: string, current: unknown) {
    editingHeaderField = field;
    editHeaderValue = String(current ?? '');
  }

  async function saveHeaderEdit() {
    const field = editingHeaderField;
    if (!field || !character) return;
    editingHeaderField = null;
    if (field === 'name') {
      character.name = editHeaderValue;
    } else if (field === 'house') {
      if (!character.hermeticData) (character as any).hermeticData = { arts: {}, house: '', wizardsSigil: '', domusMagna: '', primus: '', parens: '', covenantOfApprenticeship: '', twilightPending: false };
      character.hermeticData!.house = editHeaderValue;
    } else if (field === 'covenant') {
      character.covenant = editHeaderValue;
    } else if (field === 'age') {
      character.age = Number(editHeaderValue);
    } else if (field === 'size') {
      character.size = Number(editHeaderValue);
    } else if (field === 'confidence') {
      character.confidence = Number(editHeaderValue);
    } else if (field === 'warpingPoints') {
      character.warpingPoints = Number(editHeaderValue);
    } else if (field === 'decrepitudePoints') {
      character.decrepitudePoints = Number(editHeaderValue);
    }
    await onSaveField(field, editHeaderValue);
  }

  function cancelHeaderEdit() {
    editingHeaderField = null;
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
        {#if isEditable && editingHeaderField === 'name'}
          <input
            type="text"
            bind:value={editHeaderValue}
            onblur={saveHeaderEdit}
            onkeydown={(e) => { if (e.key === 'Enter') saveHeaderEdit(); if (e.key === 'Escape') cancelHeaderEdit(); }}
            style="font-family:{S.fontHeadline}; font-size:28px; font-weight:800; color:{COLORS.ink}; border:none; border-bottom:2px solid {COLORS.red}; background:transparent; outline:none; width:300px; max-width:100%; padding:0;"
            autofocus
          />
        {:else}
          <h1
            onclick={() => isEditable && startHeaderEdit('name', character.name)}
            style="
            font-family: {S.fontHeadline};
            font-size: 28px;
            font-weight: 800;
            color: {COLORS.ink};
            letter-spacing: -0.01em;
            cursor: {isEditable ? 'pointer' : 'default'};
            {isEditable ? 'border-bottom: 1px dashed transparent; transition: border-color 0.15s ease;' : ''}
          "
            onmouseenter={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = COLORS.outlineVar; }}
            onmouseleave={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; }}
          >
            {character.name}
          </h1>
        {/if}
        <span
          style="
          font-family: {S.fontBody};
          font-size: 12px;
          color: {COLORS.inkMuted};
          text-transform: uppercase;
          letter-spacing: 0.1em;
        ">House
          {#if isEditable && editingHeaderField === 'house'}
            <input
              type="text"
              bind:value={editHeaderValue}
              onblur={saveHeaderEdit}
              onkeydown={(e) => { if (e.key === 'Enter') saveHeaderEdit(); if (e.key === 'Escape') cancelHeaderEdit(); }}
              style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.ink}; border:none; border-bottom:1px solid {COLORS.red}; background:transparent; outline:none; width:120px; padding:0; text-transform:uppercase; letter-spacing:0.1em;"
              autofocus
            />
          {:else}
            <span
              onclick={() => isEditable && startHeaderEdit('house', character.hermeticData?.house ?? '')}
              style="cursor:{isEditable ? 'pointer' : 'default'}; {isEditable ? 'border-bottom:1px dashed transparent;' : ''}"
              onmouseenter={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = COLORS.outlineVar; }}
              onmouseleave={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; }}
            >{character.hermeticData?.house ?? '—'}</span>
          {/if}
           ·
          {#if isEditable && editingHeaderField === 'covenant'}
            <input
              type="text"
              bind:value={editHeaderValue}
              onblur={saveHeaderEdit}
              onkeydown={(e) => { if (e.key === 'Enter') saveHeaderEdit(); if (e.key === 'Escape') cancelHeaderEdit(); }}
              style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.ink}; border:none; border-bottom:1px solid {COLORS.red}; background:transparent; outline:none; width:150px; padding:0; text-transform:uppercase; letter-spacing:0.1em;"
              autofocus
            />
          {:else}
            <span
              onclick={() => isEditable && startHeaderEdit('covenant', character.covenant)}
              style="cursor:{isEditable ? 'pointer' : 'default'}; {isEditable ? 'border-bottom:1px dashed transparent;' : ''}"
              onmouseenter={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = COLORS.outlineVar; }}
              onmouseleave={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; }}
            >{character.covenant}</span>
          {/if}
        </span>
      </div>

      <div style="display: flex; gap: 24px; align-items: baseline;">
        <div style="display: flex; gap: 16px;">
          {#each [["Age", "age", character.age], ["Size", "size", character.size], ["Confidence", "confidence", character.confidence], ["Warping", "warpingPoints", character.warpingPoints], ["Decrepitude", "decrepitudePoints", character.decrepitudePoints]] as [label, field, value]}
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
              {#if isEditable && editingHeaderField === field}
                <input
                  type="number"
                  bind:value={editHeaderValue}
                  onblur={saveHeaderEdit}
                  onkeydown={(e) => { if (e.key === 'Enter') saveHeaderEdit(); if (e.key === 'Escape') cancelHeaderEdit(); }}
                  style="font-family:{S.fontHeadline}; font-size:18px; font-weight:800; color:{COLORS.ink}; border:none; border-bottom:2px solid {COLORS.red}; background:transparent; outline:none; width:50px; text-align:center; padding:0;"
                  autofocus
                />
              {:else}
                <div
                  onclick={() => isEditable && startHeaderEdit(field, value)}
                  style="
                  font-family: {S.fontHeadline};
                  font-size: 18px;
                  font-weight: 800;
                  color: {COLORS.ink};
                  cursor: {isEditable ? 'pointer' : 'default'};
                  {isEditable ? 'border-bottom: 1px dashed transparent; transition: border-color 0.15s ease;' : ''}
                "
                  onmouseenter={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = COLORS.outlineVar; }}
                  onmouseleave={(e) => { if (isEditable) (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; }}
                >
                  {value}
                </div>
              {/if}
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
          bind:decrepitudePoints={character.decrepitudePoints}
          bind:warpingPoints={character.warpingPoints}
          bind:warpingEffects={character.warpingEffects}
          bind:agingPoints={character.agingPoints}
          bind:characteristics={character.characteristics}
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
        <YearLog yearLog={character.yearLog} onSave={onSaveField} />
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
                  <WeaponTable
                    weapons={character.weapons}
                    characteristics={character.characteristics}
                    abilities={character.abilities}
                    {encumbrance}
                    {isEditable}
                    onAdd={handleWeaponAdd}
                    onRemove={handleWeaponRemove}
                    onEquip={handleWeaponEquip}
                    onUnequip={handleWeaponUnequip}
                  />
                  <ArmorDisplay
                    armor={character.armor}
                    weapons={character.weapons}
                    characteristics={character.characteristics}
                    {isEditable}
                    onAdd={handleArmorAdd}
                    onRemove={handleArmorRemove}
                    onWear={handleArmorWear}
                    onRemoveWorn={handleArmorRemoveWorn}
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
            {:else if activeTab === "Familiar"}
              <div>
                <FamiliarSection
                  familiar={character.hermeticData?.familiar ?? null}
                  {isEditable}
                  onSave={(data: unknown) => {
                    const f = data as import('$lib/types/character').Familiar;
                    if (character.hermeticData) {
                      character.hermeticData.familiar = f;
                    }
                    return onSaveField('familiar', f);
                  }}
                  vimScore={vimScore}
                />
              </div>
            {:else if activeTab === "Spells"}
              <div style="overflow: visible;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                  {#if isEditable}
                    <button onclick={openCreateSpell} style="padding:6px 14px; border:1px dashed {COLORS.outlineVar}; border-radius:6px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;" onmouseenter={(e) => (e.target as HTMLElement).style.borderColor = COLORS.red} onmouseleave={(e) => (e.target as HTMLElement).style.borderColor = COLORS.outlineVar}>+ Create Spell</button>
                  {/if}
                </div>
                <SpellList spells={character.hermeticData?.spells ?? {}} {isEditable} onEdit={openEditSpell} onDelete={handleDeleteSpell} />
              </div>
            {:else if activeTab === "Combat"}
              <div style="margin-bottom:12px; padding:8px 12px; border:1px solid {COLORS.outlineVar}; border-radius:6px; background:{COLORS.bgHigh}; display:flex; gap:24px; align-items:center;">
                <span style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Total Penalty</span>
                <span style="font-family:{S.fontHeadline}; font-size:24px; font-weight:800; color:{totalPenalty < 0 ? COLORS.red : COLORS.ink};">{totalPenalty >= 0 ? '+' : ''}{totalPenalty}</span>
                <span style="font-family:{S.fontBody}; font-size:10px; color:{COLORS.inkMuted};">Fatigue: {fatiguePenalty} · Wounds: {woundPenalty}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <FatigueTracker bind:currentFatigueLevel={character.currentFatigueLevel} />
                  <WoundTracker bind:track={character.track} size={character.size} />
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <WeaponTable
                    weapons={character.weapons}
                    characteristics={character.characteristics}
                    abilities={character.abilities}
                    {encumbrance}
                    {isEditable}
                    onAdd={handleWeaponAdd}
                    onRemove={handleWeaponRemove}
                    onEquip={handleWeaponEquip}
                    onUnequip={handleWeaponUnequip}
                  />
                  <ArmorDisplay
                    armor={character.armor}
                    weapons={character.weapons}
                    characteristics={character.characteristics}
                    {isEditable}
                    onAdd={handleArmorAdd}
                    onRemove={handleArmorRemove}
                    onWear={handleArmorWear}
                    onRemoveWorn={handleArmorRemoveWorn}
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
