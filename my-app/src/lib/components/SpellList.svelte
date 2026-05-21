<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Spell } from "$lib/types/character";

  let { spells = [] } = $props<{ spells: Spell[] }>();

  // Tracks the active spell object being inspected
  let hoveredSpell = $state<string | null>(null);
  // Ensures mouse transitions over the physical gap smoothly
  let tooltipHovered = $state(false);
  let flipUp = $state(false);

  function handleMouseEnter(e: MouseEvent, spell: Spell) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    flipUp = rect.bottom > window.innerHeight - 300;
    hoveredSpell = spell.name;
  }

  function handleFocus(e: FocusEvent, spell: Spell) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    flipUp = rect.bottom > window.innerHeight - 300;
    hoveredSpell = spell.name;
  }

  // Combined visibility derivation matching your working sample
  const visible = $derived(hoveredSpell !== null || tooltipHovered);

  const grouped = $derived(
    spells.reduce((acc: Record<string, Spell[]>, spell: Spell) => {
      const key = `${spell.technique} ${spell.form}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(spell);
      return acc;
    }, {}),
  );

  const groups = $derived(Object.keys(grouped));
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  {#each groups as group}
    <div>
      <p
        style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: {COLORS.red};
        margin-bottom: 10px;
      "
      >
        {group}
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        {#each grouped[group] as spell}
          {@const isThisSpellVisible = visible && hoveredSpell === spell}

          <div
            role="button"
            tabindex="0"
            style="position: relative; overflow: visible; z-index: {isThisSpellVisible
              ? '100'
              : '1'};"
            onmouseenter={(e) => handleMouseEnter(e, spell)}
            onmouseleave={() => {
              hoveredSpell = null;
            }}
            onfocus={(e) => handleFocus(e, spell)}
            onblur={() => {
              hoveredSpell = null;
            }}
          >
            <!-- Spell Card Wrapper -->
            <div
              style="
              background-color: {COLORS.bgLow};
              border: 1px solid {hoveredSpell === spell
                ? COLORS.red
                : COLORS.outlineVar};
              border-radius: 6px;
              overflow: hidden;
              transition: border-color 0.15s ease;
            "
            >
              <!-- Card Header -->
              <div
                style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                border-bottom: 1px solid {COLORS.outlineVar};
                background-color: {COLORS.bgHigh};
              "
              >
                <span
                  style="
                  font-family: {S.fontHeadline};
                  font-size: 14px;
                  font-weight: 700;
                  color: {hoveredSpell === spell ? COLORS.red : COLORS.ink};
                  transition: color 0.15s ease;
                ">{spell.name}</span
                >

                <span
                  style="
                  font-family: {S.fontHeadline};
                  font-size: 16px;
                  font-weight: 800;
                  color: {COLORS.red};
                ">Level {spell.magnitude * 5}</span
                >
              </div>

              <!-- Card Body -->
              <div
                style="padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;"
              >
                <!-- Technique + Form pills -->
                <div style="display: flex; gap: 6px;">
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: {COLORS.white};
                    background-color: {COLORS.inkMuted};
                    padding: 2px 8px;
                  ">{spell.technique}</span
                  >
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: {COLORS.white};
                    background-color: {COLORS.outlineVar};
                    padding: 2px 8px;
                  ">{spell.form}</span
                  >
                </div>

                <!-- RDT Metrics -->
                <div style="display: flex; gap: 16px;">
                  {#each [["Range", spell.range], ["Duration", spell.duration], ["Target", spell.target]] as [label, value]}
                    <div>
                      <div
                        style="
                        font-family: {S.fontBody};
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                        color: {COLORS.inkMuted};
                      "
                      >
                        {label}
                      </div>
                      <div
                        style="
                        font-family: {S.fontBody};
                        font-size: 13px;
                        color: {COLORS.ink};
                      "
                      >
                        {value}
                      </div>
                    </div>
                  {/each}
                </div>

                <!-- XP / Mastery Footer -->
                <div
                  style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-top: 1px solid {COLORS.outlineVar};
                  padding-top: 6px;
                "
                >
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    color: {COLORS.inkMuted};
                  ">{spell.masteryXp} xp</span
                  >
                  <span
                    style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: {COLORS.inkMuted};
                  "
                    >Mastery <span
                      style="
                    font-family: {S.fontHeadline};
                    font-size: 14px;
                    font-weight: 700;
                    color: {spell.mastery > 0 ? COLORS.red : COLORS.ink};
                  ">{spell.mastery}</span
                    ></span
                  >
                </div>
              </div>
            </div>

            <!-- Conditional Overlay Components -->
            {#if isThisSpellVisible}
              <!-- THE BRIDGE: Prevents mouse leaving context while transitioning to popup -->
              <div
                role="presentation"
                onmouseenter={() => (tooltipHovered = true)}
                onmouseleave={() => { if (!tooltipHovered) hoveredSpell = null; }}

                style="
                  position: absolute;
                  left: 0;
                  width: 100%;
                  height: 12px;
                  {flipUp ? 'bottom: 100%' : 'top: 100%'};
                  z-index: 199;
                "
              ></div>

              <!-- THE TOOLTIP -->
              <div
                role="tooltip"
                onmouseenter={() => (tooltipHovered = true)}
                onmouseleave={() => { if (!tooltipHovered) hoveredSpell = null; }}

                style="
                  position: absolute;
                  {flipUp
                  ? 'bottom: calc(100% + 6px)'
                  : 'top: calc(100% + 6px)'};
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
                <!-- Detail Grid -->
                <div
                  style="
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 12px;
                  border: 1px solid {COLORS.outlineVar};
                  padding: 10px;
                  background-color: {COLORS.bgLow};
                  margin-bottom: 12px;
                "
                >
                  {#each [["Range", spell.range], ["Duration", spell.duration], ["Target", spell.target]] as [label, value]}
                    <div style="text-align: center;">
                      <div
                        style="
                        font-family: {S.fontBody};
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: {COLORS.inkMuted};
                        margin-bottom: 4px;
                      "
                      >
                        {label}
                      </div>
                      <div
                        style="
                        font-family: {S.fontBody};
                        font-size: 14px;
                        font-weight: 600;
                        color: {COLORS.ink};
                      "
                      >
                        {value}
                      </div>
                    </div>
                  {/each}
                </div>

                <!-- Spell Notes Section -->
                {#if spell.notes}
                  <div
                    style="
                    border-left: 3px solid {COLORS.red};
                    padding: 10px 14px;
                    background-color: {COLORS.bgLow};
                    font-family: {S.fontBody};
                    font-size: 13px;
                    font-style: italic;
                    color: {COLORS.ink};
                    line-height: 1.6;
                    white-space: pre-line;
                  "
                  >
                    {spell.notes}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
