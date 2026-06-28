<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Spell } from "$lib/types";
  import { abilityScoreFromXp } from '$lib/utils/arsmagica';

  let {
    spells = {},
    isEditable = false,
    onEdit = (_spell: Spell) => {},
    onDelete = undefined as ((spellName: string) => void) | undefined,
  } = $props<{
    spells: Record<string, Spell>;
    isEditable?: boolean;
    onEdit?: (spell: Spell) => void;
    onDelete?: (spellName: string) => void;
  }>();

  const spellsList = $derived(Object.values(spells) as Spell[]);

  let hoveredSpell = $state<string | null>(null);
  let tooltipHovered = $state(false);
  let flipUp = $state(false);

  function checkFlip(e: MouseEvent | FocusEvent) {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const scrollContainer = card.closest('[style*="overflow-y: auto"]') ||
                            card.closest('[style*="overflow: auto"]');
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      flipUp = containerRect.bottom - rect.bottom < 220;
    } else {
      flipUp = rect.bottom > (window.innerHeight - 250);
    }
  }

  function handleMouseEnter(e: MouseEvent, spell: Spell) {
    checkFlip(e);
    hoveredSpell = spell.name;
  }

  function handleFocus(e: FocusEvent, spell: Spell) {
    checkFlip(e);
    hoveredSpell = spell.name;
  }

  function handleClick(spell: Spell) {
    if (!isEditable) return;
    onEdit(spell);
  }

  function getMagnitude(level: number): number {
    return Math.max(1, Math.ceil(level / 5));
  }

const grouped = $derived(
    spellsList.reduce((acc, spell) => {
      const key = `${spell.technique} ${spell.form}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(spell);
      return acc;
    }, {} as Record<string, Spell[]>)
  );

  const groups = $derived(Object.keys(grouped));
</script>

{#if spellsList.length === 0}
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center;">
    <p style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.inkMuted}; font-style: italic;">No spells yet.</p>
  </div>
{:else}
  <div style="display: flex; flex-direction: column; gap: 16px;">
    {#each groups as group}
      <div>
        <p style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: {COLORS.red};
          margin-bottom: 10px;
        ">{group}</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          {#each grouped[group] as spell}
            {@const isHovered = hoveredSpell === spell.name}

            <div
              role="button"
              tabindex="0"
              style="position: relative; overflow: visible; z-index: {isHovered ? 100 : 1};"
              onmouseenter={(e) => handleMouseEnter(e, spell)}
              onmouseleave={() => { if (!tooltipHovered) hoveredSpell = null; }}
              onfocus={(e) => handleFocus(e, spell)}
              onblur={() => hoveredSpell = null}
              onclick={() => handleClick(spell)}
              onkeydown={(e) => e.key === 'Enter' && handleClick(spell)}
            >
              <div style="
                background-color: {COLORS.bgLow};
                border: 1px dashed {isHovered ? COLORS.red : COLORS.outlineVar};
                border-radius: 6px;
                overflow: hidden;
                transition: border-color 0.15s ease;
                cursor: {isEditable ? 'pointer' : 'default'};
              ">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 8px 12px;
                  border-bottom: 1px solid {COLORS.outlineVar};
                  background-color: {COLORS.bgHigh};
                ">
                  <span style="
                    font-family: {S.fontHeadline};
                    font-size: 14px;
                    font-weight: 700;
                    color: {isHovered ? COLORS.red : COLORS.ink};
                    transition: color 0.15s ease;
                  ">{spell.name}</span>

                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="
                      font-family: {S.fontHeadline};
                      font-size: 16px;
                      font-weight: 800;
                      color: {COLORS.red};
                    ">Level {spell.level}</span>
                    {#if isEditable && onDelete}
                      <button
                        onclick={(e) => { e.stopPropagation(); onDelete(spell.name); }}
                        style="
                          padding: 0 4px;
                          border: none;
                          background: transparent;
                          color: {COLORS.inkMuted};
                          font-size: 14px;
                          line-height: 1;
                          cursor: pointer;
                          transition: color 0.15s ease;
                        "
                        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = COLORS.red}
                        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = COLORS.inkMuted}
                      >×</button>
                    {/if}
                  </div>
                </div>

                <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;">

                  <div style="display: flex; gap: 6px;">
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.white};
                      background-color: {COLORS.inkMuted};
                      padding: 2px 8px;
                    ">{spell.technique}</span>
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.white};
                      background-color: {COLORS.outlineVar};
                      padding: 2px 8px;
                    ">{spell.form}</span>
                    
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 10px;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.inkMuted};
                      border: 1px solid {COLORS.outlineVar};
                      padding: 1px 6px;
                      border-radius: 4px;
                    ">Mag {getMagnitude(spell.level)}</span>
                  </div>

                  <div style="display: flex; gap: 16px;">
                    {#each [['Range', spell.range], ['Duration', spell.duration], ['Target', spell.target]] as [label, value]}
                      <div>
                        <div style="
                          font-family: {S.fontBody};
                          font-size: 10px;
                          text-transform: uppercase;
                          letter-spacing: 0.06em;
                          color: {COLORS.inkMuted};
                        ">{label}</div>
                        <div style="
                          font-family: {S.fontBody};
                          font-size: 13px;
                          color: {COLORS.ink};
                        ">{value}</div>
                      </div>
                    {/each}
                  </div>

                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid {COLORS.outlineVar};
                    padding-top: 6px;
                  ">
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      color: {COLORS.inkMuted};
                    ">{spell.masteryXp} xp</span>
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.inkMuted};
                    ">Mastery <span style="
                      font-family: {S.fontHeadline};
                      font-size: 14px;
                      font-weight: 700;
                      color: {abilityScoreFromXp(spell.masteryXp) > 0 ? COLORS.red : COLORS.ink};
                    ">{abilityScoreFromXp(spell.masteryXp)}</span></span>
                  </div>

                </div>
              </div>

              {#if isHovered}
                <div
                  role="presentation"
                  onmouseenter={() => tooltipHovered = true}
                  onmouseleave={() => { tooltipHovered = false; hoveredSpell = null; }}
                  style="
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 12px;
                    {flipUp ? 'bottom: 100%' : 'top: 100%'};
                    z-index: 199;
                  "
                ></div>

                <div
                  role="tooltip"
                  onmouseenter={() => tooltipHovered = true}
                  onmouseleave={() => { tooltipHovered = false; hoveredSpell = null; }}
                  style="
                    position: absolute;
                    {flipUp ? 'bottom: calc(100% + 12px)' : 'top: calc(100% + 12px)'};
                    left: 0;
                    width: 100%;
                    background-color: {COLORS.white};
                    border: 1px solid {COLORS.outlineVar};
                    border-radius: 6px;
                    padding: 14px;
                    z-index: 200;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    box-sizing: border-box;
                  "
                >
                  <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 12px;
                    border: 1px solid {COLORS.outlineVar};
                    padding: 10px;
                    background-color: {COLORS.bgLow};
                    margin-bottom: 12px;
                  ">
                    {#each [['Range', spell.range], ['Duration', spell.duration], ['Target', spell.target]] as [label, value]}
                      <div style="text-align: center;">
                        <div style="
                          font-family: {S.fontBody};
                          font-size: 10px;
                          text-transform: uppercase;
                          letter-spacing: 0.08em;
                          color: {COLORS.inkMuted};
                          margin-bottom: 4px;
                        ">{label}</div>
                        <div style="
                          font-family: {S.fontBody};
                          font-size: 14px;
                          font-weight: 600;
                          color: {COLORS.ink};
                        ">{value}</div>
                      </div>
                    {/each}
                  </div>

                  {#if spell.notes}
                    <div style="
                      border-left: 3px solid {COLORS.red};
                      padding: 10px 14px;
                      background-color: {COLORS.bgLow};
                      font-family: {S.fontBody};
                      font-size: 13px;
                      font-style: italic;
                      color: {COLORS.ink};
                      line-height: 1.6;
                      white-space: pre-line;
                    ">{spell.notes}</div>
                  {/if}

                </div>
              {/if}

            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}