<script lang="ts">
  import { COLORS } from '$lib/constants';

  let { children, title = '' } = $props();
</script>

<div style="
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  padding: 16px;
  box-sizing: border-box;
">
  {#if title}
    <p style="
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: {COLORS.inkMuted};
      margin-bottom: 12px;
    ">{title}</p>
  {/if}

  {@render children?.()}
</div>