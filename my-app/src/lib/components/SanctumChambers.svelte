<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { SanctumChamber } from '$lib/types/laboratory';

  let { chambers = [] }: { chambers: SanctumChamber[] } = $props();
</script>

<div style="
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 4px;
  padding: 16px;
  font-family: {S.fontBody};
  color: {COLORS.ink};
  display: flex;
  flex-direction: column;
  gap: 12px;
">
  <h3 style="
    margin: 0;
    font-family: {S.fontHeadline};
    font-size: 1.15rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: {COLORS.ink};
    border-bottom: 2px solid {COLORS.ink};
    padding-bottom: 4px;
  ">
    Sanctum Chambers
  </h3>

  {#if chambers.length === 0}
    <p style="margin: 0; color: {COLORS.inkMuted}; font-style: italic; font-size: 0.9rem;">
      No standalone chambers detailed within the sanctum boundary.
    </p>
  {:else}
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="
        display: grid; 
        grid-template-columns: 160px 80px 80px 1fr; 
        gap: 12px; 
        padding: 4px 8px; 
        font-family: {S.fontHeadline};
        font-weight: bold; 
        font-size: 0.75rem; 
        color: {COLORS.inkMuted}; 
        text-transform: uppercase;
        border-bottom: 1px solid {COLORS.outlineVar};
      ">
        <div>Chamber / Purpose</div>
        <div style="text-align: center;">Size Mod</div>
        <div style="text-align: center;">Secured</div>
        <div>Description</div>
      </div>
      
      {#each chambers as chamber}
        <div style="
          display: grid; 
          grid-template-columns: 160px 80px 80px 1fr; 
          gap: 12px; 
          padding: 10px 8px; 
          background-color: {COLORS.bgLow}; 
          border: 1px solid {COLORS.outlineVar}; 
          border-radius: 2px;
          align-items: center;
          font-size: 0.9rem;
        ">
          <div>
            <div style="font-weight: bold; color: {COLORS.ink};">{chamber.name || 'Unnamed Room'}</div>
          </div>

          <div style="text-align: center; font-family: {S.fontHeadline}; font-weight: bold;">
            {chamber.floorAreaSqFt >= 0 ? `+${chamber.floorAreaSqFt}` : chamber.floorAreaSqFt}
          </div>


          <div style="line-height: 1.4; font-size: 0.85rem; color: {COLORS.inkMuted};">
            {chamber.description || 'No supplementary physical configuration notes layout.'}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>