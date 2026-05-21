<script lang="ts">
  import { COLORS } from '../constants';

  let { 
    open = $bindable(false),
    title = '',
    children
  } = $props();
</script>

{#if open}
  <!-- Backdrop -->
  <button
    style="
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.4);
      z-index: 100;
      border: none;
      cursor: default;
    "
    onclick={() => open = false}
    onkeydown={(e) => e.key === 'Escape' && (open = false)}
    aria-label="Close modal"
  ></button>

  <!-- Panel -->
  <div
    role="dialog"
    aria-modal="true"
    tabindex="0"
    style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: {COLORS.white};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 8px;
      padding: 32px;
      width: 90%;
      max-width: 560px;
      max-height: 80vh;
      overflow-y: auto;
      box-sizing: border-box;
      z-index: 101;
    "
    onkeydown={(e) => e.key === 'Escape' && (open = false)}
  >
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <span style="font-size: 16px; font-weight: 700;">{title}</span>
      <button
        onclick={() => open = false}
        style="
          background: none;
          border: none;
          cursor: pointer;
          font-size: 20px;
          color: {COLORS.inkMuted};
          line-height: 1;
        "
      >✕</button>
    </div>

    {@render children?.()}
  </div>
{/if}