<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import { hasMagic } from '$lib/utils/character';
	import { goto } from '$app/navigation';
	import IdentityHeader from '@ui/IdentityHeader.svelte';
	import VitalsBar from '$lib/components/VitalsBar.svelte';
	import Tabs from '@ui/Tabs.svelte';
	import StatsSheet from '$lib/components/StatsSheet.svelte';
	import SkillsSheet from '$lib/components/SkillsSheet.svelte';
	import BackgroundSheet from '$lib/components/BackgroundSheet.svelte';
	import AlchemySheet from '$lib/components/AlchemySheet.svelte';
	import GearSheet from '$lib/components/GearSheet.svelte';
	import MagicSheet from '$lib/components/MagicSheet.svelte';

	// The whole sheet, for both the owner's view and the public share view.
	// Identity, vitals and the inline tab strip are shared chrome; each tab renders
	// its own body against the same draft. The tabs show for share viewers too —
	// Skills lives on its own tab, so hiding them would hide half the sheet — but
	// `editable` still gates every edit affordance.
	let { draft, editable = true }: { draft: WitcherCharacter; editable?: boolean } = $props();

	// Which tabs this sheet has is witcher's business, so the list lives here
	// rather than inside the shared Tabs component.
	type SheetTab = 'stats' | 'skills' | 'background' | 'gear' | 'alchemy' | 'magic';
	const ALL_SHEET_TABS: { id: SheetTab; label: string }[] = [
		{ id: 'stats', label: 'Stats' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'background', label: 'Background' },
		{ id: 'gear', label: 'Gear' },
		{ id: 'alchemy', label: 'Alchemy' },
		{ id: 'magic', label: 'Magic' }
	];

	// Most professions have no magical aptitude at all (see hasMagic) — the tab is
	// hidden outright for them rather than shown disabled, since there is nothing
	// half-finished to preview, just nothing to show.
	const magic = $derived(hasMagic(draft.professionInfo.profession));
	const SHEET_TABS = $derived(ALL_SHEET_TABS.filter((t) => t.id !== 'magic' || magic));

	let activeTab = $state<SheetTab>('stats');

	// A profession change (Race & Profession is editable mid-session) can pull the
	// Magic tab out from under whoever is looking at it.
	$effect(() => {
		if (activeTab === 'magic' && !magic) activeTab = 'stats';
	});

	// Edit modals bind their inputs directly to `draft`, so changes apply as you type.
	// Snapshot on open / restore on cancel is what makes the Cancel button actually
	// cancel. Owned here so both tabs share one mechanism.
	let editSnapshot: string | null = null;
	function beginEdit() {
		editSnapshot = JSON.stringify(draft);
	}
	function cancelEdit() {
		if (editSnapshot) Object.assign(draft, JSON.parse(editSnapshot));
		editSnapshot = null;
	}
</script>

<IdentityHeader
	name={draft.name}
	portraitUrl={draft.portraitUrl}
	{editable}
	onSettings={() => goto('/profile')}
/>

<div
	class="page"
	style="display:flex; flex-direction:column; gap: var(--stack-md); max-width: 1200px;"
>
	<VitalsBar
		derivedStats={draft.derivedStats}
		criticalWounds={draft.criticalWounds}
		perks={draft.raceInfo.perks}
		{editable}
	/>

	<Tabs tabs={SHEET_TABS} active={activeTab} onSelect={(tab) => (activeTab = tab as SheetTab)} />

	{#if activeTab === 'skills'}
		<SkillsSheet {draft} {editable} onOpenEdit={beginEdit} onCancelEdit={cancelEdit} />
	{:else if activeTab === 'background'}
		<BackgroundSheet {draft} {editable} onOpenEdit={beginEdit} onCancelEdit={cancelEdit} />
	{:else if activeTab === 'alchemy'}
		<AlchemySheet {draft} {editable} onOpenEdit={beginEdit} onCancelEdit={cancelEdit} />
	{:else if activeTab === 'gear'}
		<GearSheet {draft} {editable} onOpenEdit={beginEdit} onCancelEdit={cancelEdit} />
	{:else if activeTab === 'magic'}
		<MagicSheet {draft} {editable} onOpenEdit={beginEdit} onCancelEdit={cancelEdit} />
	{:else}
		<StatsSheet {draft} {editable} onOpenEdit={beginEdit} onCancelEdit={cancelEdit} />
	{/if}
</div>
