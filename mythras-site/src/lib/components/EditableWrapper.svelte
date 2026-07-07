<script lang="ts">
	import EditModal from './EditModal.svelte';

	let {
		isEditable = false,
		title = '',
		onSave = async () => {},
		onOpen,
		onCancel,
		children,
		editForm
	} = $props<{
		isEditable: boolean;
		title: string;
		onSave: () => Promise<void>;
		onOpen?: () => void;
		onCancel?: () => void;
		children?: any;
		editForm?: any;
	}>();

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
		<button class="edit-btn" onclick={openEditor} aria-label="Edit {title}">&#9998;</button
		>
	</div>
{:else}
	{@render children?.()}
{/if}

<EditModal bind:open={editOpen} {title} {onSave} {onCancel}>
	{@render editForm?.()}
</EditModal>
