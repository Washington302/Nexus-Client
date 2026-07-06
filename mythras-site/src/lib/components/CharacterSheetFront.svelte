<script lang="ts">
	import type { MythrasCharacter } from '$lib/services/api';
	import Panel from '$lib/components/Panel.svelte';
	import EditableSectionCard from '$lib/components/EditableSectionCard.svelte';
	import StatBubble from '$lib/components/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import IdentityPanel from '$lib/components/IdentityPanel.svelte';
	import CharacteristicsEditor from '$lib/components/CharacteristicsEditor.svelte';

	let { draft }: { draft: MythrasCharacter } = $props();

	function addLanguage() {
		draft.languages.push({ name: '', percentage: 0, nativeLanguage: false });
	}
	function removeLanguage(index: number) {
		draft.languages = draft.languages.filter((_, i) => i !== index);
	}
	function addPassion() {
		draft.passions.push({ name: '', base: 0, cultural: 0, career: 0, bonus: 0, total: 0 });
	}
	function removePassion(index: number) {
		draft.passions = draft.passions.filter((_, i) => i !== index);
	}
</script>

<div class="panel-grid-3">
	<EditableSectionCard title="Identity" color="primary">
		{#snippet view()}
			<div class="field-group">
				<div class="field-hdr">Name</div>
				<div style="font-family:var(--font-display);font-size:18px;font-weight:700;">{draft.name || '—'}</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Culture</div>
					<div>{draft.raceCulture || '—'}</div>
				</div>
				<div class="field-group">
					<div class="field-hdr">Career</div>
					<div>{draft.career || '—'}</div>
				</div>
			</div>
			<div class="field-group">
				<div class="field-hdr">Homeland</div>
				<div>{draft.homeland || '—'}</div>
			</div>
		{/snippet}
		{#snippet edit()}
			<IdentityPanel {draft} />
		{/snippet}
	</EditableSectionCard>

	<EditableSectionCard title="Characteristics" color="primary">
		{#snippet view()}
			<div class="grid-2" style="gap:8px;">
				<StatBubble value={draft.characteristics.str} label="STR" />
				<StatBubble value={draft.characteristics.con} label="CON" />
				<StatBubble value={draft.characteristics.siz} label="SIZ" />
				<StatBubble value={draft.characteristics.dex} label="DEX" />
				<StatBubble value={draft.characteristics.intelligence} label="INT" />
				<StatBubble value={draft.characteristics.pow} label="POW" />
			</div>
			<div style="margin-top:8px;">
				<StatBubble value={draft.characteristics.cha} label="CHA" />
			</div>
		{/snippet}
		{#snippet edit()}
			<CharacteristicsEditor characteristics={draft.characteristics} />
		{/snippet}
	</EditableSectionCard>

	<Panel header="Attributes" color="gold">
		<div class="grid-2" style="gap:8px;">
			<StatBubble value={draft.attributes.actionPoints} label="Action Points" />
			<StatBubble value={draft.attributes.luckPoints} label="Luck Points" />
			<StatBubble value={draft.attributes.magicPoints} label="Magic Points" />
			<StatBubble value={draft.attributes.damageModifier} label="Damage Mod" />
			<StatBubble value={draft.attributes.healingRate} label="Healing Rate" />
			<StatBubble value={draft.attributes.initiativeBonus} label="Initiative" />
			<StatBubble
				value={draft.attributes.experienceModifier >= 0 ? '+' + draft.attributes.experienceModifier : draft.attributes.experienceModifier}
				label="Exp. Mod"
			/>
			<StatBubble value={draft.attributes.movementRate + 'm'} label="Movement" />
		</div>
	</Panel>
</div>

<Panel header="Standard Skills" color="plain">
	<SkillTable skills={draft.standardSkills} characteristics={draft.characteristics} />
</Panel>

<Panel header="Professional Skills" color="plain">
	<SkillTable skills={draft.professionalSkills} characteristics={draft.characteristics} />
</Panel>

<Panel header="Magical Skills" color="plain">
	<SkillTable skills={draft.magicSkills} characteristics={draft.characteristics} />
</Panel>

<div class="panel-grid">
	<Panel header="Languages" color="plain">
		{#each draft.languages as lang, i}
			<div class="list-row">
				<div class="list-row-fields" style="grid-template-columns: 1fr 60px auto;">
					<input class="input-demo" bind:value={lang.name} placeholder="Language" />
					<input class="input-demo input-num" type="number" bind:value={lang.percentage} />
					<label style="display:flex;align-items:center;gap:4px;font-size:12px;">
						<input type="checkbox" bind:checked={lang.nativeLanguage} /> Native
					</label>
				</div>
				<button class="remove-row-btn" onclick={() => removeLanguage(i)}>&#10005;</button>
			</div>
		{:else}
			<div class="empty-hint">No languages yet.</div>
		{/each}
		<button class="add-row-btn" onclick={addLanguage}>+ Add Language</button>
	</Panel>

	<Panel header="Passions" color="plain">
		{#each draft.passions as passion, i}
			<div class="list-row">
				<div class="list-row-fields" style="grid-template-columns: 1fr 60px;">
					<input class="input-demo" bind:value={passion.name} placeholder="Passion" />
					<input class="input-demo input-num" type="number" bind:value={passion.total} />
				</div>
				<button class="remove-row-btn" onclick={() => removePassion(i)}>&#10005;</button>
			</div>
		{:else}
			<div class="empty-hint">No passions yet.</div>
		{/each}
		<button class="add-row-btn" onclick={addPassion}>+ Add Passion</button>
	</Panel>
</div>
