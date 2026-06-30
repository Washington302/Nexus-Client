<script lang="ts">
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
	<div class="edit-wrap">
		<div class="click-area">
			{@render children?.()}
		</div>
		<button
			class="edit-btn"
			onclick={() => editOpen = true}
			aria-label="Edit {title}"
		>&#9998;</button>
	</div>
{:else}
	{@render children?.()}
{/if}

<EditModal bind:open={editOpen} {title} {onSave}>
	{@render editForm?.()}
</EditModal>

<style>
	.edit-wrap {
		position: relative;
	}

	.edit-btn {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid var(--border);
		background: var(--newsprint);
		color: var(--accent);
		font-size: 15px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.15s ease;
		z-index: 10;
		padding: 0;
		line-height: 1;
	}
	.edit-wrap:hover .edit-btn,
	.edit-btn:focus {
		opacity: 1;
	}
</style>
