<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import AbilityRow from './AbilityRow.svelte';
  import type { Ability } from '$lib/types/character';

  let { abilities = [] } = $props<{ abilities: Ability[] }>();

const byCategory = $derived(
  abilities.reduce((acc: Record<string, Ability[]>, ability: Ability) => {
    if (!acc[ability.category]) acc[ability.category] = [];
    acc[ability.category].push(ability);
    return acc;
  }, {})
);

  const categories = $derived(Object.keys(byCategory));
  

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

<div style="
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  padding: 24px;
  border-radius: 8px;
  gap: 24px;
">
  {#each categories as category, ci}
    <div>
      <p style={sectionLabel}>{category}</p>
      {#each byCategory[category] as ability, i}
        <AbilityRow
          name={ability.name}
          exp={ability.exp}
          score={ability.score}
          specialty={ability.specialty}
          category={ability.category}
          isLast={i === byCategory[category].length - 1}
        />
      {/each}
    </div>

    {#if ci < categories.length - 1}
      <div style="height: 1px; background-color: {COLORS.outlineVar};" ></div>
    {/if}
  {/each}
</div>