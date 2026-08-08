<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import {
		STYLE_CATEGORIES,
		EARLY_LIFE_CATEGORIES,
		RELATION_OPTIONS,
		LIFE_EVENT_CATEGORY,
		lifepathValue,
		setLifepathValue,
		createLifepathEvent,
		removeLifepathEvent
	} from '$lib/utils/character';
	import SheetSection from '$lib/components/SheetSection.svelte';

	// Everything flavor-side. Each panel is a SheetSection like the rest of the sheet:
	// read-only view, pencil opens a modal, Cancel restores via the parent's snapshot.
	// Fixed boxes write through to a single LifepathEvent per category; relations and
	// decade rolls are repeatable entries.
	let {
		draft,
		editable = true,
		onOpenEdit,
		onCancelEdit
	}: {
		draft: WitcherCharacter;
		editable?: boolean;
		onOpenEdit?: () => void;
		onCancelEdit?: () => void;
	} = $props();

	const relations = $derived(
		draft.lifepathEvents.filter((e) => (RELATION_OPTIONS as readonly string[]).includes(e.category))
	);
	const lifeEvents = $derived(
		draft.lifepathEvents.filter((e) => e.category === LIFE_EVENT_CATEGORY)
	);

	function addRelation() {
		draft.lifepathEvents.push(createLifepathEvent(RELATION_OPTIONS[0]));
	}
	function addLifeEvent() {
		draft.lifepathEvents.push(createLifepathEvent(LIFE_EVENT_CATEGORY));
	}
</script>

{#snippet flavorView(categories: readonly string[])}
	{@const filled = categories.filter((c) => lifepathValue(draft.lifepathEvents, c))}
	{#if filled.length === 0}
		<p class="empty-hint">Nothing recorded yet.</p>
	{:else}
		<div class="grid-2">
			{#each filled as category}
				<div class="field-group">
					<div class="field-hdr">{category}</div>
					<div class="field-value notes-block">{lifepathValue(draft.lifepathEvents, category)}</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet flavorEdit(categories: readonly string[])}
	<div class="grid-2">
		{#each categories as category}
			<div class="field-group">
				<div class="field-hdr">{category}</div>
				<textarea
					class="input-demo"
					rows="2"
					value={lifepathValue(draft.lifepathEvents, category)}
					oninput={(e) => setLifepathValue(draft, category, e.currentTarget.value)}></textarea>
			</div>
		{/each}
	</div>
{/snippet}

<div class="sheet-body-grid">
	<section class="sheet-side-column">
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Campaign Information"
			color="primary"
		>
			{#snippet view()}
				{#if draft.backgroundNotes}
					<div class="field-value notes-block">{draft.backgroundNotes}</div>
				{:else}
					<p class="empty-hint">No campaign notes yet.</p>
				{/if}
			{/snippet}
			{#snippet edit()}
				<div class="field-group">
					<div class="field-hdr">Campaign Notes</div>
					<textarea class="input-demo" rows="6" bind:value={draft.backgroundNotes}></textarea>
				</div>
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Early Life"
			color="gold"
		>
			{#snippet view()}
				{@render flavorView(EARLY_LIFE_CATEGORIES)}
			{/snippet}
			{#snippet edit()}
				{@render flavorEdit(EARLY_LIFE_CATEGORIES)}
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Style, Appearance &amp; Outlook"
			color="plain"
		>
			{#snippet view()}
				{@render flavorView(STYLE_CATEGORIES)}
			{/snippet}
			{#snippet edit()}
				{@render flavorEdit(STYLE_CATEGORIES)}
			{/snippet}
		</SheetSection>
	</section>

	<div class="sheet-side-column">
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Siblings, Rivals &amp; Friends"
			color="plain"
		>
			{#snippet view()}
				{#if relations.length === 0}
					<p class="empty-hint">No one recorded.</p>
				{:else}
					{#each relations as relation (relation.id)}
						<div class="field-group">
							<div class="field-hdr">{relation.category}</div>
							<div class="field-value notes-block">{relation.description}</div>
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each relations as relation (relation.id)}
					<div class="bg-row">
						<select class="input-demo bg-row-kind" bind:value={relation.category}>
							{#each RELATION_OPTIONS as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
						<textarea class="input-demo" rows="2" bind:value={relation.description}></textarea>
						<button
							type="button"
							class="remove-row-btn"
							aria-label="Remove {relation.category}"
							onclick={() => removeLifepathEvent(draft, relation.id)}>✕</button
						>
					</div>
				{/each}
				<button type="button" class="add-row-btn" onclick={addRelation}>+ Add Person</button>
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Life Events"
			color="plain"
		>
			{#snippet view()}
				{#if lifeEvents.length === 0}
					<p class="empty-hint">No events recorded.</p>
				{:else}
					{#each lifeEvents as event (event.id)}
						<div class="field-value notes-block bg-event-view">{event.description}</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				<span class="field-hint" style="display:block;margin-bottom:8px;"
					>One roll per decade lived — fortunes, misfortunes, allies and debts.</span
				>
				{#each lifeEvents as event (event.id)}
					<div class="bg-row">
						<textarea
							class="input-demo bg-row-wide"
							rows="3"
							bind:value={event.description}
							placeholder="What happened, and what it cost or gained you"></textarea>
						<button
							type="button"
							class="remove-row-btn"
							aria-label="Remove life event"
							onclick={() => removeLifepathEvent(draft, event.id)}>✕</button
						>
					</div>
				{/each}
				<button type="button" class="add-row-btn" onclick={addLifeEvent}>+ Add Life Event</button>
			{/snippet}
		</SheetSection>
	</div>
</div>
