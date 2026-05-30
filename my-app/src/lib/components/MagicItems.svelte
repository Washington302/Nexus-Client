<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { MagicItem } from '$lib/types/laboratory';

  let { items = [] }: { items: MagicItem[] } = $props();
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
  gap: 16px;
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
    Magic Items
  </h3>

  {#if items.length === 0}
    <p style="margin: 0; color: {COLORS.inkMuted}; font-style: italic; font-size: 0.9rem;">
      No magic items installed in this laboratory.
    </p>
  {:else}
    <div style="display: flex; flex-direction: column; gap: 20px;">
      {#each items as item}
        <div style="
          border: 1px solid {COLORS.outlineVar};
          border-radius: 4px;
          padding: 14px;
          background-color: {COLORS.bgLow};
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 10px;
            border-bottom: 1px dashed {COLORS.outline};
            padding-bottom: 6px;
          ">
            <span style="font-family: {S.fontHeadline}; font-weight: 700; font-size: 1.05rem;">
              {item.name || 'Unnamed Item'} 
              {#if item.talisman}
                <span style="
                  font-size: 0.7rem;
                  background-color: {COLORS.red};
                  color: {COLORS.white};
                  padding: 2px 6px;
                  border-radius: 2px;
                  margin-left: 6px;
                  font-family: {S.fontHeadline};
                ">TALISMAN</span>
              {/if}
            </span>
            <span style="font-size: 0.8rem; text-transform: uppercase; color: {COLORS.inkMuted}; font-weight: bold;">
              {item.type} Item ({item.shape || 'Unknown Shape'} / {item.material || 'Unknown Material'})
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 0.85rem;">
            <div><span style="color: {COLORS.inkMuted};">Vis Capacity:</span> <strong>{item.visCapacity ?? 0} pawns</strong></div>
            <div><span style="color: {COLORS.inkMuted};">Creator Sigil:</span> <strong>{item.creatorSigil || '—'}</strong></div>
            <div><span style="color: {COLORS.inkMuted};">Granted Virtue:</span> <strong>{item.grantedVirtue || 'None'}</strong></div>
          </div>

          {#if item.labBonus && Object.keys(item.labBonus).length > 0}
            <div style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: bold; color: {COLORS.inkMuted}; text-transform: uppercase;">Lab Bonuses:</span>
              {#each Object.entries(item.labBonus) as [stat, bonus]}
                <span style="
                  font-size: 0.8rem;
                  background-color: {COLORS.bgHigh};
                  border: 1px solid {COLORS.outlineVar};
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-weight: bold;
                ">
                  {stat} {bonus >= 0 ? `+${bonus}` : bonus}
                </span>
              {/each}
            </div>
          {/if}

          {#if item.effects && item.effects.length > 0}
            <div style="
              display: flex;
              flex-direction: column;
              gap: 8px;
              background-color: {COLORS.white};
              padding: 10px;
              border-radius: 2px;
              border: 1px solid {COLORS.outlineVar};
              margin-top: 8px;
            ">
              <span style="
                font-family: {S.fontHeadline};
                font-size: 0.75rem;
                font-weight: bold;
                color: {COLORS.inkMuted};
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
              ">Enchanted Effects</span>
              
              {#each item.effects as fx}
                <div style="
                  border-left: 3px solid {COLORS.outline};
                  padding-left: 10px;
                  font-size: 0.85rem;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                ">
                  <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; font-weight: bold;">
                    <div>✨ {fx.spell?.name || 'Unnamed Spell Effect'}</div>
                    <div style="color: {COLORS.inkMuted}; font-size: 0.8rem;">{fx.spell?.technique}/{fx.spell?.form}</div>
                    <div style="color: {COLORS.inkMuted}; font-size: 0.8rem;">Level {fx.spell?.level || fx.spell?.magnitude * 5}</div>
                    <div style="color: {COLORS.inkMuted}; font-size: 0.8rem;">Pen: {fx.penetration ?? 0}</div>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 2fr 2fr; gap: 8px; font-size: 0.8rem; color: {COLORS.inkMuted};">
                    <div><strong>R/D/T:</strong> {fx.spell?.range || '—'}/{fx.spell?.duration || '—'}/{fx.spell?.target || '—'}</div>
                    <div>
                      <strong>Uses:</strong> 
                      {#if fx.chargedItemEffect}
                        Charged ({fx.remainingCharges} charges left)
                      {:else if fx.hasLimitedUses}
                        {fx.usesPerDay}/Day
                      {:else}
                        Unlimited
                      {/if}
                    </div>
                  </div>

                  {#if fx.triggerCondition || fx.spell?.notes}
                    <div style="
                      font-size: 0.8rem;
                      color: {COLORS.inkMuted};
                      background-color: {COLORS.bgLow};
                      padding: 6px;
                      border-radius: 2px;
                      margin-top: 2px;
                    ">
                      {#if fx.triggerCondition}<div><strong>Trigger:</strong> {fx.triggerCondition}</div>{/if}
                      {#if fx.spell?.notes}<div><strong>Notes:</strong> {fx.spell.notes}</div>{/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>