<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import AbilityRow from "./AbilityRow.svelte";
  import type { Ability, AbilityCategory } from "$lib/types/character";

  let { abilities = {} }: { abilities: Record<string, Ability> } = $props();

  const byCategory = $derived(
    Object.values(abilities).reduce(
      (acc, ability) => {
        const cat = ability.category;
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(ability);
        return acc;
      },
      {} as Record<AbilityCategory, Ability[]>,
    ),
  );

  const categories: AbilityCategory[] = [
    "ARCANE",
    "ACADEMIC",
    "SUPERNATURAL",
    "MARTIAL",
    "GENERAL",
  ];

  function getAbilitiesForCategory(cat: AbilityCategory): Ability[] {
    return byCategory[cat] ?? [];
  }

  const sectionLabel = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${COLORS.red};
    margin: 0 0 4px 0;
  `;
</script>

<div
  style="
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  padding: 24px;
  border-radius: 8px;
  gap: 24px;
"
>
  {#each categories as category, ci}
    {@const list = getAbilitiesForCategory(category)}

    {#if list.length > 0}
      <div>
        <p style={sectionLabel}>{category} ABILITIES</p>

        {#each list as ability, i}
          <AbilityRow
            name={ability.name}
            exp={ability.exp}
            score={ability.score}
            specialty={ability.specialty}
            category={ability.category}
            isLast={i === list.length - 1}
          />
        {/each}
      </div>

      {#if ci < categories.length - 1}
        <div
          style="height: 1px; background-color: {COLORS.outlineVar}; margin: 1rem 0;"
        ></div>
      {/if}
    {/if}
  {/each}
</div>
