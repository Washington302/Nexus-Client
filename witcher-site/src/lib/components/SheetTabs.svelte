<script lang="ts">
	export type SheetTab = 'stats' | 'skills' | 'background' | 'gear' | 'alchemy' | 'magic';

	// Inline segmented tab strip, part of the page flow — replaces the old fixed
	// bottom bar. Every tab renders inside /character (and the share page) against
	// the same draft, so switching must not remount the page or reset autosave.
	let { active = 'stats', onSelect }: { active?: SheetTab; onSelect?: (tab: SheetTab) => void } =
		$props();

	const tabs: { id: SheetTab; label: string; ready: boolean }[] = [
		{ id: 'stats', label: 'Stats', ready: true },
		{ id: 'skills', label: 'Skills', ready: true },
		{ id: 'background', label: 'Background', ready: true },
		{ id: 'gear', label: 'Gear', ready: true },
		{ id: 'alchemy', label: 'Alchemy', ready: true },
		{ id: 'magic', label: 'Magic', ready: true }
	];
</script>

<div class="sheet-tabs">
	{#each tabs as tab}
		<button
			type="button"
			class="sheet-tab"
			class:active={active === tab.id}
			class:disabled={!tab.ready}
			disabled={!tab.ready}
			title={tab.ready ? undefined : 'Coming soon'}
			onclick={() => tab.ready && onSelect?.(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>
