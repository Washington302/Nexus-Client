<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import EditModal from './EditModal.svelte';

  let {
    isEditable = false,
    title = '',
    onSave = async () => {},
    children,
    editForm,
  } = $props<{
    isEditable: boolean;
    title: string;
    onSave: () => Promise<void>;
    children?: any;
    editForm?: any;
  }>();

  let editOpen = $state(false);
</script>

{#if isEditable}
  <div style="position: relative;">
    <div
      onclick={() => editOpen = true}
      onkeydown={(e) => e.key === 'Enter' && (editOpen = true)}
      role="button"
      tabindex={0}
      style="
        cursor: pointer;
        outline: none;
      "
    >
      {@render children?.()}
    </div>

    <button
      onclick={() => editOpen = true}
      style="
        position: absolute;
        top: 4px;
        right: 4px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid {COLORS.outlineVar};
        background-color: {COLORS.white};
        color: {COLORS.inkMuted};
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.15s ease;
        z-index: 10;
        padding: 0;
        line-height: 1;
      "
      onmouseenter={(e) => (e.target as HTMLElement).style.opacity = '1'}
      onfocus={(e) => (e.target as HTMLElement).style.opacity = '1'}
      onmouseleave={(e) => (e.target as HTMLElement).style.opacity = '0'}
      onblur={(e) => (e.target as HTMLElement).style.opacity = '0'}
      aria-label="Edit {title}"
    >✎</button>
  </div>
{:else}
  {@render children?.()}
{/if}

<EditModal bind:open={editOpen} {title} {onSave}>
  {@render editForm?.()}
</EditModal>
