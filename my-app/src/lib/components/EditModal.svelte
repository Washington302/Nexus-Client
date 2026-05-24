<script lang="ts">
  import { COLORS, S } from '$lib/constants';

  let {
    open = $bindable(false),
    title = '',
    onSave,
    children
  } = $props<{
    open: boolean;
    title: string;
    onSave: () => Promise<void>;
    children?: any;
  }>();

  let saving = $state(false);
  let error = $state<string | null>(null);

  async function handleSave() {
    saving = true;
    error = null;
    try {
      await onSave();
      open = false;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      saving = false;
    }
  }

  function handleClose() {
    if (saving) return;
    open = false;
    error = null;
  }
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
      width: 100%;
    "
    onclick={handleClose}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    aria-label="Close modal"
  />

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
      width: 90%;
      max-width: 560px;
      max-height: 80vh;
      overflow-y: auto;
      scrollbar-width: none;
      z-index: 101;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    "
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
  >

    <!-- Header -->
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid {COLORS.outlineVar};
      background-color: {COLORS.bgLow};
      flex-shrink: 0;
    ">
      <span style="
        font-family: {S.fontHeadline};
        font-size: 16px;
        font-weight: 700;
        color: {COLORS.ink};
      ">{title}</span>
      <button
        onclick={handleClose}
        disabled={saving}
        style="
          background: none;
          border: none;
          cursor: {saving ? 'not-allowed' : 'pointer'};
          font-size: 18px;
          color: {COLORS.inkMuted};
          line-height: 1;
          padding: 0;
        "
      >✕</button>
    </div>

    <!-- Content -->
    <div style="
      padding: 20px;
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
    ">
      {@render children?.()}
    </div>

    <!-- Error -->
    {#if error}
      <div style="
        padding: 10px 20px;
        background-color: #ffdad6;
        border-top: 1px solid {COLORS.red};
        font-family: {S.fontBody};
        font-size: 13px;
        color: {COLORS.red};
      ">{error}</div>
    {/if}

    <!-- Footer -->
    <div style="
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid {COLORS.outlineVar};
      background-color: {COLORS.bgLow};
      flex-shrink: 0;
    ">
      <button
        onclick={handleClose}
        disabled={saving}
        style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          background-color: {COLORS.white};
          border: 1px solid {COLORS.outlineVar};
          padding: 8px 20px;
          cursor: {saving ? 'not-allowed' : 'pointer'};
        "
      >Cancel</button>

      <button
        onclick={handleSave}
        disabled={saving}
        style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.white};
          background-color: {saving ? COLORS.inkMuted : COLORS.red};
          border: none;
          padding: 8px 20px;
          cursor: {saving ? 'not-allowed' : 'pointer'};
          transition: background-color 0.15s ease;
        "
      >{saving ? 'Saving...' : 'Save'}</button>
    </div>

  </div>
{/if}