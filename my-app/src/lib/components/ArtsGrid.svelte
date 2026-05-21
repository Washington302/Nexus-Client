<script lang="ts">
  import { COLORS, S } from '../constants';
  import ScoreCard from './ScoreCard.svelte';

let { artsList = [] } = $props();

  const techniques = $derived(artsList.filter((a: any) => a.type === 'TECHNIQUE'));
  const forms = $derived(artsList.filter((a: any) => a.type === 'FORM'));

  const sectionLabel = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${COLORS.red};
    margin: 0 0 4px 0;
    padding-bottom: 6px;
  `;
</script>

<div style="
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  background-color: {COLORS.bgLow};
  padding: 24px;
  border-radius: 8px;
  min-width: 250px;
  max-width: 00px;
">
  <div style="width: 100%;">

    <!-- Techniques -->
    <p style={sectionLabel}>Techniques</p>
    <div style="margin-bottom: 24px;">
{#each techniques as art, i}
  <ScoreCard 
    name={art.name} 
    exp={art.exp} 
    score={art.score}
    isLast={i === techniques.length - 1}
  />
{/each}
    </div>

    <!-- Forms -->
    <p style={sectionLabel}>Forms</p>
    <div>
      {#each forms as art, i}
        <ScoreCard 
    name={art.name} 
    exp={art.exp} 
    score={art.score}
    isLast={i === forms.length - 1}
  />
      {/each}
    </div>

  </div>

</div>