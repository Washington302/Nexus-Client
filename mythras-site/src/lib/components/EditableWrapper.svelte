<script lang="ts">
	import EditModal from './EditModal.svelte';

	let {
		isEditable = false,
		title = '',
		onSave = async () => {},
		children,
		editForm
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
	<div class="edit-wrap">
		<div class="click-area">
			{@render children?.()}
		</div>
		<button class="edit-btn" onclick={() => (editOpen = true)} aria-label="Edit {title}">&#9998;</button
		>
	</div>
{:else}
	{@render children?.()}
{/if}

<EditModal bind:open={editOpen} {title} {onSave}>
	{@render editForm?.()}
</EditModal>
