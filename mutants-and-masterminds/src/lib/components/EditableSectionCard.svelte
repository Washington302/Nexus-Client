<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';

	let {
		title,
		color,
		headerIcon = '★',
		view,
		edit,
	}: {
		title: string;
		color: string;
		headerIcon?: string;
		view?: Snippet;
		edit?: Snippet;
	} = $props();
</script>

<EditableWrapper title={title} isEditable={true} onSave={async () => {}}>
	{#snippet children()}
		<ComicPanel header={`★ ${title}`} color={color}>
			{@render view()}
		</ComicPanel>
	{/snippet}
	{#snippet editForm()}
		{@render edit()}
	{/snippet}
</EditableWrapper>
