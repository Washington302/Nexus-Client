<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import Panel from '$lib/components/Panel.svelte';

	let {
		title,
		color,
		view,
		edit,
		onOpen,
		onCancel
	}: {
		title: string;
		color: 'primary' | 'gold' | 'teal' | 'plain';
		view?: Snippet;
		edit?: Snippet;
		onOpen?: () => void;
		onCancel?: () => void;
	} = $props();
</script>

<EditableWrapper {title} isEditable={true} onSave={async () => {}} {onOpen} {onCancel}>
	{#snippet children()}
		<Panel header={title} {color}>
			{@render view?.()}
		</Panel>
	{/snippet}
	{#snippet editForm()}
		{@render edit?.()}
	{/snippet}
</EditableWrapper>
