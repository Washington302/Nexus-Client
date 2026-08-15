<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditModal from './EditModal.svelte';

	let {
		isEditable = false,
		title = '',
		onSave = async () => {},
		onOpen,
		onCancel,
		children,
		editForm
	}: {
		isEditable?: boolean;
		title?: string;
		onSave?: () => Promise<void>;
		onOpen?: () => void;
		onCancel?: () => void;
		children?: Snippet;
		editForm?: Snippet;
	} = $props();

	let editOpen = $state(false);

	function openEditor() {
		onOpen?.();
		editOpen = true;
	}
</script>

{#if isEditable}
	<div class="edit-wrap">
		<div class="click-area">
			{@render children?.()}
		</div>
		<button class="edit-btn" onclick={openEditor} aria-label="Edit {title}">&#9998;</button>
	</div>
{:else}
	{@render children?.()}
{/if}

<EditModal bind:open={editOpen} {title} {onSave} {onCancel}>
	{@render editForm?.()}
</EditModal>
