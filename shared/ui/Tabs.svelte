<script lang="ts">
	// Inline segmented tab strip, part of the page flow. Every tab renders against
	// the same draft, so switching must not remount the page or reset autosave.
	//
	// The tab list is a prop rather than a constant: which tabs exist is the
	// consuming sheet's business. `ready: false` renders a disabled "coming soon"
	// tab, which is how a sheet ships a section before it is finished.
	type Tab = { id: string; label: string; ready?: boolean };

	let {
		tabs,
		active,
		onSelect
	}: {
		tabs: Tab[];
		active?: string;
		onSelect?: (id: string) => void;
	} = $props();
</script>

<div class="sheet-tabs">
	{#each tabs as tab (tab.id)}
		{@const ready = tab.ready !== false}
		<button
			type="button"
			class="sheet-tab"
			class:active={active === tab.id}
			class:disabled={!ready}
			disabled={!ready}
			title={ready ? undefined : 'Coming soon'}
			onclick={() => ready && onSelect?.(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>
