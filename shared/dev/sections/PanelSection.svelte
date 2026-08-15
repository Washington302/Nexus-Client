<script lang="ts">
	import Panel from '@ui/Panel.svelte';
	import SheetSection from '@ui/SheetSection.svelte';

	// The app owns its colour vocabulary; the shared components treat `color` as
	// an opaque class token.
	let { colors = ['primary'], headerPrefix = '' }: { colors?: string[]; headerPrefix?: string } =
		$props();
</script>

<h2>Panel</h2>
{#each colors as color (color)}
	<Panel header="Panel — {color}" {color}>
		{#snippet children()}<p>Body for <code>{color}</code>.</p>{/snippet}
	</Panel>
{/each}

<h2>SheetSection — read-only</h2>
{#each colors as color (color)}
	<SheetSection title="Static — {color}" {color} {headerPrefix} editable={false}>
		{#snippet view()}<p>View content for <code>{color}</code>.</p>{/snippet}
	</SheetSection>
{/each}

<h2>SheetSection — editable</h2>
{#each colors as color (color)}
	<SheetSection title="Editable — {color}" {color} {headerPrefix} editable={true}>
		{#snippet view()}<p>View content for <code>{color}</code>.</p>{/snippet}
		{#snippet edit()}<p>Edit content for <code>{color}</code>.</p>{/snippet}
	</SheetSection>
{/each}
