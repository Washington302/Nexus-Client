<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import IdentityHeader from '$lib/components/IdentityHeader.svelte';
	import VitalsBar from '$lib/components/VitalsBar.svelte';
	import SheetTabs, { type SheetTab } from '$lib/components/SheetTabs.svelte';
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

	let activeTab = $state<SheetTab>('stats');

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

<IdentityHeader name={draft.name} portraitUrl={draft.portraitUrl} {editable} />

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

	<SheetTabs active={activeTab} onSelect={(tab) => (activeTab = tab)} />

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
