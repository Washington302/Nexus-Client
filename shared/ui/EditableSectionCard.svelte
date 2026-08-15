<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableWrapper from './EditableWrapper.svelte';
	import Panel from './Panel.svelte';

	// `headerPrefix` exists so m&m can keep its `★ ` header ornament without the
	// shared component knowing anything about it. m&m supplies it once, from its
	// local SheetSection wrapper.
	let {
		title,
		color = 'primary',
		headerPrefix = '',
		view,
		edit,
		onOpen,
		onCancel
	}: {
		title: string;
		color?: string;
		headerPrefix?: string;
		view?: Snippet;
		edit?: Snippet;
		onOpen?: () => void;
		onCancel?: () => void;
	} = $props();
</script>

<EditableWrapper {title} isEditable={true} onSave={async () => {}} {onOpen} {onCancel}>
	{#snippet children()}
		<Panel header="{headerPrefix}{title}" {color}>
			{@render view?.()}
		</Panel>
	{/snippet}
	{#snippet editForm()}
		{@render edit?.()}
	{/snippet}
</EditableWrapper>
