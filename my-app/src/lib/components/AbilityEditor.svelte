<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Ability } from '$lib/types';
  import { abilityScoreFromXp } from '$lib/utils/arsmagica';

  let {
    abilities = $bindable({} as Record<string, Ability>),
  } = $props<{
    abilities: Record<string, Ability>;
  }>();

  const categoryOrder = ['ARCANE', 'ACADEMIC', 'MARTIAL', 'GENERAL', 'SUPERNATURAL'];
  const categoryLabels: Record<string, string> = {
    ARCANE: 'Arcane',
    ACADEMIC: 'Academic',
    MARTIAL: 'Martial',
    GENERAL: 'General',
    SUPERNATURAL: 'Supernatural',
  };

  function compute(exp: number): number {
    return abilityScoreFromXp(exp);
  }

  let adding = $state(false);
  let newName = $state('');
  let newSpecialty = $state('');
  let newCategory = $state('GENERAL');
  let newExp = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  {#each categoryOrder as cat}
    {@const list = Object.values(abilities) as import('$lib/types').Ability[]}
    {@const catAbilities = list.filter((a) => a.category === cat)}
    {#if catAbilities.length > 0}
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div
          style="
            font-family: {S.fontHeadline};
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            border-bottom: 1px solid {COLORS.outlineVar};
            padding-bottom: 4px;
          "
        >{categoryLabels[cat]}</div>
        {#each catAbilities as ability, i}
          <div style="display: flex; align-items: center; gap: 8px;">
            <span
              style="
                width: 140px;
                font-family: {S.fontBody};
                font-size: 13px;
                color: {COLORS.ink};
                flex-shrink: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >{ability.name}</span>
            {#if ability.specialty}
              <span
                style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  font-style: italic;
                  color: {COLORS.inkMuted};
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >{ability.specialty}</span>
            {:else}
              <span style="flex: 1;"></span>
            {/if}
            <input
              type="number"
              min="0"
              max="10000"
              value={ability.exp}
              oninput={(e) => { const v = Number((e.target as HTMLInputElement).value); abilities[ability.name].exp = v; abilities[ability.name].score = abilityScoreFromXp(v); }}
              style="
                width: 70px;
                padding: 4px 6px;
                border: 1px solid {COLORS.outlineVar};
                border-radius: 4px;
                font-family: {S.fontBody};
                font-size: 12px;
                color: {COLORS.ink};
                background-color: {COLORS.white};
                text-align: center;
              "
              title="Experience points"
            />
            <span
              style="
                width: 30px;
                font-family: {S.fontHeadline};
                font-size: 14px;
                font-weight: 700;
                color: {COLORS.ink};
                text-align: center;
              "
            >{ability.score}</span>
            <button
              onclick={() => { const { [ability.name]: _, ...rest } = abilities; abilities = rest; }}
              style="
                width: 28px; height: 28px;
                border: 1px solid {COLORS.outlineVar};
                border-radius: 50%;
                background: {COLORS.bgHigh};
                color: {COLORS.red};
                cursor: pointer;
                font-size: 14px;
                font-weight: 700;
                display: flex; align-items: center; justify-content: center;
                padding: 0; flex-shrink: 0;
                line-height: 1;
              "
              aria-label="Remove {ability.name}"
              title="Remove"
            >✕</button>
          </div>
        {/each}
      </div>
    {/if}
  {/each}

  {#if adding}
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 8px; border: 1px dashed {COLORS.outlineVar}; border-radius: 6px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <input type="text" bind:value={newName} placeholder="Name" style="flex:1; padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;" />
        <input type="text" bind:value={newSpecialty} placeholder="Specialty" style="width:100px; padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;" />
        <select bind:value={newCategory} style="padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:11px;">
          {#each categoryOrder as c}
            <option value={c}>{categoryLabels[c]}</option>
          {/each}
        </select>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick={() => { if (newName) { abilities[newName] = { name: newName, specialty: newSpecialty, category: newCategory, exp: newExp, score: compute(newExp) }; abilities = { ...abilities }; newName = ''; newSpecialty = ''; newExp = 0; adding = false; } }} disabled={!newName} style="padding:4px 10px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.white}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;">Add</button>
        <button onclick={() => adding = false} style="padding:4px 10px; border:none; background:transparent; font-family:{S.fontBody}; font-size:11px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
      </div>
    </div>
  {:else}
    <button onclick={() => adding = true} style="padding:6px 12px; border:1px dashed {COLORS.outlineVar}; border-radius:6px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; cursor:pointer; text-align:center;">+ Add Ability</button>
  {/if}
</div>
