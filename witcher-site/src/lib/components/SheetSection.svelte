<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableSectionCard from '$lib/components/EditableSectionCard.svelte';
	import Panel from '$lib/components/Panel.svelte';

	// A panel that grows an edit affordance only when the sheet is editable.
	// Read-only viewers (the share page) get the bare Panel, so the edit snippet
	// is never instantiated and the view markup only has to be written once.
	let {
		title,
		color = 'plain',
		editable = false,
		view,
		edit,
		onOpen,
		onCancel
	}: {
		title: string;
		color?: 'primary' | 'gold' | 'teal' | 'plain';
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
	<Panel header={title} {color}>
		{@render view()}
	</Panel>
{/if}
