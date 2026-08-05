<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableSectionCard from '$lib/components/EditableSectionCard.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';

	// A panel that grows an edit affordance only when the sheet is editable.
	// Read-only viewers (the share page) get the bare ComicPanel, so the edit
	// snippet is never even instantiated.
	let {
		title,
		color,
		editable = false,
		view,
		edit,
		onOpen,
		onCancel,
	}: {
		title: string;
		color: 'red' | 'yellow' | 'blue' | 'dark';
		editable?: boolean;
		view: Snippet;
		edit?: Snippet;
		onOpen?: () => void;
		onCancel?: () => void;
	} = $props();
</script>

{#if editable && edit}
	<EditableSectionCard {title} {color} {view} {edit} {onOpen} {onCancel} />
{:else}
	<ComicPanel header={`★ ${title}`} {color}>
		{@render view()}
	</ComicPanel>
{/if}
