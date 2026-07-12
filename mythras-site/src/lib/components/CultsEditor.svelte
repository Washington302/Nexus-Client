<script lang="ts">
	import type { MythrasCharacter } from '$lib/services/api';
	import { listToText, textToList } from '$lib/utils/character';
	import GiftEditor from '$lib/components/GiftEditor.svelte';

	let { draft }: { draft: MythrasCharacter } = $props();

	function addCult() {
		draft.cults.push({
			name: '',
			rank: '',
			benefits: [],
			restrictions: [],
			gifts: [],
			devotionalPoolCurrent: 0,
			devotionalPoolMax: 0
		});
	}
	function removeCult(index: number) {
		draft.cults = draft.cults.filter((_, i) => i !== index);
	}

	const ACTIVATION_TYPE_OPTIONS = ['Passive', 'Magic Point Cost', 'Skill Roll', 'Roll and Cost'];
</script>

<div class="list-scroll-cults">
	{#each draft.cults as cult, i}
		<div class="nested-card">
			<div class="list-row">
				<div class="list-row-fields" style="grid-template-columns: 1fr 1fr;">
					<input class="input-demo" bind:value={cult.name} placeholder="Cult name" />
					<input class="input-demo" bind:value={cult.rank} placeholder="Rank" />
				</div>
				<button class="remove-row-btn" onclick={() => removeCult(i)}>&#10005;</button>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Devotional Pool Current</div>
					<input class="input-demo input-num" type="number" bind:value={cult.devotionalPoolCurrent} />
				</div>
				<div class="field-group">
					<div class="field-hdr">Devotional Pool Max</div>
					<input class="input-demo input-num" type="number" bind:value={cult.devotionalPoolMax} />
				</div>
			</div>
			<div class="field-group">
				<div class="field-hdr">Benefits</div>
				<input
					class="input-demo"
					value={listToText(cult.benefits)}
					oninput={(e) => (cult.benefits = textToList(e.currentTarget.value))}
					placeholder="Benefits (comma separated)"
				/>
			</div>
			<div class="field-group">
				<div class="field-hdr">Restrictions</div>
				<input
					class="input-demo"
					value={listToText(cult.restrictions)}
					oninput={(e) => (cult.restrictions = textToList(e.currentTarget.value))}
					placeholder="Restrictions (comma separated)"
				/>
			</div>
			<GiftEditor {cult} />
		</div>
	{:else}
		<div class="empty-hint">No cult affiliations yet.</div>
	{/each}
</div>
<button class="add-row-btn" onclick={addCult}>+ Add Cult</button>

<datalist id="activation-type-options">
	{#each ACTIVATION_TYPE_OPTIONS as opt}
		<option value={opt}></option>
	{/each}
</datalist>
