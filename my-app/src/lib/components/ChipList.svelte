<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import VirtueFlawChip from "./VirtueFlawChip.svelte";
  import type { Trait } from "$lib/types";

  let { virtues = {}, flaws = {}, virtuesLabel = 'Virtues',
  flawsLabel = 'Flaws' } = $props<{
    virtues: Record<string, Trait>;
    flaws: Record<string, Trait>;
    virtuesLabel?: string;
    flawsLabel?: string;
  }>();

  const virtuesList = $derived(Object.values(virtues) as Trait[]);
  const flawsList = $derived(Object.values(flaws) as Trait[]);

  

  const sectionLabel = (flaw: boolean) => `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${flaw ? COLORS.red : COLORS.inkMuted};
    margin: 0 0 8px 0;
  `;
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">

  <div>
    <p style={sectionLabel(false)}>{virtuesLabel}</p>
    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
      {#each virtuesList as item}
        <VirtueFlawChip {item} />
      {/each}
    </div>
  </div>

  <div style="height: 1px; background-color: {COLORS.outlineVar};" ></div>

  <div>
    <p style={sectionLabel(true)}>{flawsLabel}</p>
    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
      {#each flawsList as item}
        <VirtueFlawChip {item} />
      {/each}
    </div>
  </div>

</div>