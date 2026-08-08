<script lang="ts">
	import type { WitcherCharacter, CriticalWound, WoundModifier } from '$lib/services/api';
	import {
		label,
		activeModifiers,
		createDefaultCriticalWound,
		createDefaultWoundModifier,
		WOUND_SEVERITY_OPTIONS,
		WOUND_STATE_OPTIONS,
		WOUND_LOCATION_OPTIONS,
		WOUND_MULTIPLIER_OPTIONS,
		STAT_TABLE_ORDER
	} from '$lib/utils/character';
	import SheetSection from '$lib/components/SheetSection.svelte';

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

	// Which state's column is being edited. The tables print a different set of
	// penalties per state, and the backend stores all three, so treating a wound is a
	// state change rather than re-entering every modifier.
	let editingState = $state<'untreated' | 'stabilized' | 'treated'>('untreated');

	// The character's own seeded skills, rather than a separate constant — it is the
	// same fixed 44 the backend owns, so there is nothing to keep in sync.
	const skillOptions = $derived(
		[...draft.skills].sort((a, b) => label(a.skillName).localeCompare(label(b.skillName)))
	);

	const MODIFIER_LIST_KEY = {
		UNTREATED: 'untreatedModifiers',
		STABILIZED: 'stabilizedModifiers',
		TREATED: 'treatedModifiers'
	} as const;

	function modifiersFor(wound: CriticalWound, which: typeof editingState): WoundModifier[] {
		if (which === 'treated') return wound.treatedModifiers;
		if (which === 'stabilized') return wound.stabilizedModifiers;
		return wound.untreatedModifiers;
	}

	function addWound() {
		draft.criticalWounds.push(createDefaultCriticalWound());
	}
	function removeWound(id: string) {
		draft.criticalWounds = draft.criticalWounds.filter((w) => w.id !== id);
	}
	function addModifier(wound: CriticalWound) {
		modifiersFor(wound, editingState).push(createDefaultWoundModifier());
	}
	function removeModifier(wound: CriticalWound, id: string) {
		const key = MODIFIER_LIST_KEY[editingState.toUpperCase() as keyof typeof MODIFIER_LIST_KEY] as
			'untreatedModifiers' | 'stabilizedModifiers' | 'treatedModifiers';
		wound[key] = wound[key].filter((m) => m.id !== id);
	}

	/** One modifier as a readable line, e.g. "REF −2" or "Dodge/Escape quartered". */
	function modifierText(mod: WoundModifier): string {
		const target = mod.stat
			? label(mod.stat)
			: mod.skill
				? label(mod.skill)
				: mod.otherTarget || 'Unspecified';
		const bits: string[] = [];
		if (mod.multiplier === 0.5) bits.push('halved');
		else if (mod.multiplier === 0.25) bits.push('quartered');
		if (mod.flatPenalty) bits.push(`−${Math.abs(mod.flatPenalty)}`);
		return bits.length ? `${target} ${bits.join(', ')}` : target;
	}
</script>

<SheetSection
	{editable}
	onOpen={onOpenEdit}
	onCancel={onCancelEdit}
	title="Critical Wounds"
	color="plain"
>
	{#snippet view()}
		{#if draft.criticalWounds.length === 0}
			<p class="empty-hint">No critical wounds.</p>
		{:else}
			{#each draft.criticalWounds as wound (wound.id)}
				{@const mods = activeModifiers(wound)}
				<div class="wound-row">
					<div class="wound-head">
						<span class="effect-name">{wound.name || 'Unnamed wound'}</span>
						<span class="formula-tags">
							{#if wound.severity}<span class="pill">{label(wound.severity)}</span>{/if}
							{#if wound.location}<span class="pill">{label(wound.location)}</span>{/if}
							<span class="pill" class:wound-untreated={wound.state === 'UNTREATED'}
								>{label(wound.state)}</span
							>
							{#if wound.bleeding}<span class="pill wound-bleeding">Bleeding</span>{/if}
							{#if wound.numbingHerbsApplied}<span
									class="pill"
									title="Lowers this wound's penalties by 2, and near-death penalties by 2"
									>Numbed</span
								>{/if}
						</span>
					</div>
					{#if mods.length > 0}
						<span class="effect-meta">
							{mods.map(modifierText).join(' · ')}
						</span>
					{:else}
						<span class="effect-meta">No mechanical penalty in this state.</span>
					{/if}
					{#if wound.effectText}<p class="ability-desc">{wound.effectText}</p>{/if}
				</div>
			{/each}
		{/if}
	{/snippet}

	{#snippet edit()}
		{#each draft.criticalWounds as wound (wound.id)}
			<div class="list-card">
				<div class="grid-2">
					<div class="field-group">
						<div class="field-hdr">Name</div>
						<input class="input-demo" type="text" bind:value={wound.name} placeholder="Wound" />
					</div>
					<div class="field-group">
						<div class="field-hdr">Severity</div>
						<select class="input-demo" bind:value={wound.severity}>
							<option value={null}>&mdash;</option>
							{#each WOUND_SEVERITY_OPTIONS as opt}
								<option value={opt}>{label(opt)}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="grid-2">
					<div class="field-group">
						<div class="field-hdr">Location</div>
						<select class="input-demo" bind:value={wound.location}>
							<option value={null}>&mdash;</option>
							{#each WOUND_LOCATION_OPTIONS as opt}
								<option value={opt}>{label(opt)}</option>
							{/each}
						</select>
					</div>
					<div class="field-group">
						<div class="field-hdr">State</div>
						<select class="input-demo" bind:value={wound.state}>
							{#each WOUND_STATE_OPTIONS as opt}
								<option value={opt}>{label(opt)}</option>
							{/each}
						</select>
						<span class="field-hint">Selects which penalty set applies.</span>
					</div>
				</div>

				<div class="field-group">
					<div class="field-hdr">Effect</div>
					<textarea class="input-demo" rows="2" bind:value={wound.effectText}></textarea>
				</div>

				<!-- Penalties are entered per state, matching how the tables print them. -->
				<div class="inner-tabs">
					{#each ['untreated', 'stabilized', 'treated'] as const as which}
						<button
							type="button"
							class="inner-tab"
							class:active={editingState === which}
							onclick={() => (editingState = which)}
						>
							{label(which)}
							{#if modifiersFor(wound, which).length > 0}
								<span class="inner-tab-count">{modifiersFor(wound, which).length}</span>
							{/if}
						</button>
					{/each}
				</div>

				{#each modifiersFor(wound, editingState) as mod (mod.id)}
					<div class="list-card nested">
						<div class="grid-2">
							<div class="field-group">
								<div class="field-hdr">Statistic</div>
								<select class="input-demo" bind:value={mod.stat}>
									<option value={null}>&mdash;</option>
									{#each STAT_TABLE_ORDER as opt}
										<option value={opt}>{label(opt)}</option>
									{/each}
								</select>
							</div>
							<div class="field-group">
								<div class="field-hdr">Skill</div>
								<select class="input-demo" bind:value={mod.skill}>
									<option value={null}>&mdash;</option>
									{#each skillOptions as opt (opt.id)}
										<option value={opt.skillName}>{label(opt.skillName)}</option>
									{/each}
								</select>
							</div>
						</div>
						<div class="grid-2">
							<div class="field-group">
								<div class="field-hdr">Flat Penalty</div>
								<input
									class="input-demo input-num"
									type="number"
									max="0"
									bind:value={mod.flatPenalty}
								/>
								<span class="field-hint">Negative, e.g. −2.</span>
							</div>
							<div class="field-group">
								<div class="field-hdr">Multiplier</div>
								<select class="input-demo" bind:value={mod.multiplier}>
									{#each WOUND_MULTIPLIER_OPTIONS as opt}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</select>
							</div>
						</div>
						<div class="field-group">
							<div class="field-hdr">Other Target</div>
							<input
								class="input-demo"
								type="text"
								bind:value={mod.otherTarget}
								placeholder="Stamina, damage from head wounds…"
							/>
							<span class="field-hint">
								Recorded for reference — only Statistic and Skill are calculated.
							</span>
						</div>
						<button
							type="button"
							class="remove-row-btn"
							aria-label="Remove modifier"
							onclick={() => removeModifier(wound, mod.id)}>✕</button
						>
					</div>
				{/each}
				<button type="button" class="add-row-btn" onclick={() => addModifier(wound)}
					>+ Add {label(editingState)} Penalty</button
				>

				<label class="finish-creation">
					<input type="checkbox" bind:checked={wound.bleeding} />
					<span>Bleeding</span>
				</label>
				<label class="finish-creation">
					<input type="checkbox" bind:checked={wound.numbingHerbsApplied} />
					<span>
						Numbing Herbs — lowers this wound's penalties by 2, and near-death penalties by 2, for
						2d10 rounds.
					</span>
				</label>

				<button
					type="button"
					class="remove-row-btn"
					aria-label="Remove wound"
					onclick={() => removeWound(wound.id)}>✕</button
				>
			</div>
		{/each}
		<button type="button" class="add-row-btn" onclick={addWound}>+ Add Critical Wound</button>
	{/snippet}
</SheetSection>
