<script lang="ts">
	import type { Snippet } from 'svelte';

	// One collapsible row in a "+ Add X" list. Every list of multi-field records
	// (magical effects, critical wounds, racial perks, weapons, formulae…) used to
	// render every field of every row at once — with a dozen effects that's a page of
	// scrolling before you reach the "+ Add" button. Collapsed by default, this shows
	// only what the caller puts in `header` and reveals `body` on click.
	//
	// Owns the wrapper markup and the remove button; does NOT own the open/closed
	// state — the parent tracks that (usually a `Set<string>` of expanded ids) because
	// only the parent knows whether a freshly-added row should start open.
	let {
		id,
		open,
		onToggle,
		onRemove,
		removeLabel = 'Remove',
		header,
		body
	}: {
		id: string;
		open: boolean;
		onToggle: () => void;
		onRemove?: () => void;
		removeLabel?: string;
		header: Snippet;
		body: Snippet;
	} = $props();
</script>

<div class="list-card accordion-card" class:open>
	<button
		type="button"
		class="attribute-card-header"
		onclick={onToggle}
		aria-expanded={open}
		aria-controls="accordion-body-{id}"
	>
		{@render header()}
	</button>

	{#if open}
		<div class="accordion-card-body" id="accordion-body-{id}">
			{@render body()}
		</div>
	{/if}

	{#if onRemove}
		<button type="button" class="remove-row-btn" aria-label={removeLabel} onclick={onRemove}
			>✕</button
		>
	{/if}
</div>
