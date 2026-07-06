<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import Panel from '$lib/components/Panel.svelte';

	let {
		title,
		color,
		view,
		edit
	}: {
		title: string;
		color: 'primary' | 'gold' | 'teal' | 'plain';
		view?: Snippet;
		edit?: Snippet;
	} = $props();
</script>

<EditableWrapper {title} isEditable={true} onSave={async () => {}}>
	{#snippet children()}
		<Panel header={title} {color}>
			{@render view?.()}
		</Panel>
	{/snippet}
	{#snippet editForm()}
		{@render edit?.()}
	{/snippet}
</EditableWrapper>
