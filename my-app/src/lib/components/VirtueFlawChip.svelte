<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Trait } from "$lib/types";

  let { item, name } = $props<{ item: Trait; name: string }>();

  let hovered = $state(false);
  let tooltipHovered = $state(false);
  let flipUp = $state(false);
  let chipRef = $state<HTMLDivElement | null>(null);

  function handleMouseEnter() {
    if (chipRef) {
      const rect = chipRef.getBoundingClientRect();
      flipUp = rect.top > 300;
    }
    hovered = true;
  }

  const visible = $derived(hovered || tooltipHovered);
</script>

<div

  class="chip-wrapper"
  bind:this={chipRef}
  style="z-index: {visible ? 100 : 1};"
  onmouseenter={handleMouseEnter}
  onmouseleave={() => hovered = false}
  role="button"
  tabindex="0"
  onfocus={handleMouseEnter}
  onblur={() => hovered = false}
>
  <span
    class="chip-label"
    class:chip-label--flaw={item.flaw}
    style="background-color: {visible ? COLORS.bgLow : 'transparent'};"
  >
    {name}
    <span
      class="chip-magnitude"
      class:chip-magnitude--flaw={item.flaw}
    >{item.magnitude}</span>
  </span>

  {#if visible}
    <!-- Bridge -->
    <div
      class="chip-bridge"
      role="presentation"
      class:chip-bridge--up={flipUp}
      onmouseenter={() => tooltipHovered = true}
      onmouseleave={() => tooltipHovered = false}
    ></div>

    <!-- Tooltip -->
    <div
      class="chip-tooltip"
      class:chip-tooltip--up={flipUp}
      role="tooltip"
      onmouseenter={() => tooltipHovered = true}
      onmouseleave={() => tooltipHovered = false}
    >
      <p class="chip-tooltip__meta">{item.type} · {item.magnitude}</p>
      <p class="chip-tooltip__description" style="white-space: pre-line;">{item.description}</p>
    </div>
  {/if}
</div>

<style>
  .chip-wrapper {
    position: relative;
    display: inline-block;
  }

  .chip-label {
    display: inline-block;
    border: 1px solid var(--outline-var, #c8c7be);
    padding: 4px 12px;
    font-size: 12px;
    color: var(--ink, #1d1c13);
    cursor: default;
    transition: background-color 0.15s ease;
  }

  .chip-label--flaw {
    border-color: var(--red, #a9372a);
    color: var(--red, #a9372a);
  }

  .chip-magnitude {
    font-size: 10px;
    color: var(--ink-muted, #474741);
    margin-left: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chip-magnitude--flaw {
    color: var(--red, #a9372a);
  }

  .chip-bridge {
    position: absolute;
    left: 0;
    width: 100%;
    height: 10px;
    top: 100%;
    z-index: 99;
  }

  .chip-bridge--up {
    top: auto;
    bottom: 100%;
  }

  .chip-tooltip {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var(--white, #ffffff);
    border: 1px solid var(--outline-var, #c8c7be);
    padding: 10px 14px;
    min-width: 220px;
    max-width: 300px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    pointer-events: auto;
  }

  .chip-tooltip--up {
    top: auto;
    bottom: 100%;
  }

  .chip-tooltip__meta {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-muted, #474741);
    margin-bottom: 6px;
  }

  .chip-tooltip__description {
    font-size: 13px;
    color: var(--ink, #1d1c13);
    line-height: 1.6;
  }
</style>