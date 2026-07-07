<script lang="ts">
	import type { MythrasCharacter } from '$lib/services/api';
	import Panel from '$lib/components/Panel.svelte';
	import EditableSectionCard from '$lib/components/EditableSectionCard.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import SkillsEditor from '$lib/components/SkillsEditor.svelte';

	let {
		draft,
		editable = true,
		onOpen,
		onCancel
	}: {
		draft: MythrasCharacter;
		editable?: boolean;
		onOpen?: () => void;
		onCancel?: () => void;
	} = $props();

	let activeTab = $state<'standard' | 'professional' | 'magical'>('standard');
</script>

{#snippet skillsView()}
	<div class="sheet-tabs">
		<button class="sheet-tab" class:active={activeTab === 'standard'} onclick={() => (activeTab = 'standard')}
			>Standard</button
		>
		<button
			class="sheet-tab"
			class:active={activeTab === 'professional'}
			onclick={() => (activeTab = 'professional')}>Professional</button
		>
		<button class="sheet-tab" class:active={activeTab === 'magical'} onclick={() => (activeTab = 'magical')}
			>Magical</button
		>
	</div>

	{#if activeTab === 'standard'}
		<SkillTable skills={draft.standardSkills} />
	{:else if activeTab === 'professional'}
		<SkillTable skills={draft.professionalSkills} />
	{:else}
		<SkillTable skills={draft.magicSkills} />
	{/if}
{/snippet}

{#if editable}
	<EditableSectionCard {onOpen} {onCancel} title="Skills" color="plain">
		{#snippet view()}
			{@render skillsView()}
		{/snippet}
		{#snippet edit()}
			<SkillsEditor {draft} />
		{/snippet}
	</EditableSectionCard>
{:else}
	<Panel header="Skills" color="plain">
		{@render skillsView()}
	</Panel>
{/if}
