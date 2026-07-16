<script lang="ts">
	let { active = 'stats' }: { active?: 'stats' | 'gear' | 'alchemy' | 'magic' } = $props();

	const tabs: {
		id: 'stats' | 'gear' | 'alchemy' | 'magic';
		label: string;
		icon: string;
		ready: boolean;
	}[] = [
		{ id: 'stats', label: 'Stats', icon: '⚔', ready: true },
		{ id: 'gear', label: 'Gear', icon: '🎒', ready: false },
		{ id: 'alchemy', label: 'Alchemy', icon: '⚗', ready: false },
		{ id: 'magic', label: 'Magic', icon: '✦', ready: false }
	];
</script>

<nav class="sheet-nav">
	{#each tabs as tab}
		{#if tab.ready}
			<a href="/character" class="sheet-nav-item" class:active={active === tab.id}>
				<span class="sheet-nav-icon">{tab.icon}</span>
				<span>{tab.label}</span>
			</a>
		{:else}
			<span class="sheet-nav-item disabled" title="Coming soon">
				<span class="sheet-nav-icon">{tab.icon}</span>
				<span>{tab.label}</span>
			</span>
		{/if}
	{/each}
</nav>
