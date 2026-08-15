<script lang="ts">
	import type { WitcherCharacter, MagicalEffect, MagicType } from '$lib/services/api';
	import {
		label,
		MAGIC_TYPE_OPTIONS,
		MAGIC_TYPE_PLURAL,
		MAGIC_ELEMENT_OPTIONS,
		MASTERY_TIER_OPTIONS,
		createDefaultMagicalEffect,
		committedVigor,
		staminaUpkeep,
		effectiveDerived
	} from '$lib/utils/character';
	import InlineNumber from '@ui/InlineNumber.svelte';
	import Panel from '@ui/Panel.svelte';
	import SheetSection from '@ui/SheetSection.svelte';
	import AccordionRow from '@ui/AccordionRow.svelte';

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

	// Vigor is capacity, not a reserve — never spent and recovered. What consumes it is
	// maintenance: each active effect ties up its vigorUpkeep until it ends. Summed
	// locally as well as server-side so the number moves as effects are toggled.
	const committed = $derived(committedVigor(draft.magicalEffects));
	// Dimeritium lowers the ceiling and Places of Power raise it, both as modifiers
	// targeting VIGOR_THRESHOLD — so the number you channel against isn't always the
	// stored one. The stored value stays the player's to edit.
	const threshold = $derived(
		effectiveDerived(
			draft.derivedStats.maxVigor,
			draft.criticalWounds,
			draft.raceInfo.perks,
			'VIGOR_THRESHOLD'
		)
	);
	const available = $derived(Math.max(0, threshold - committed));
	const upkeep = $derived(staminaUpkeep(draft.magicalEffects));
	const overCommitted = $derived(committed > threshold);
	const committedPct = $derived(threshold > 0 ? Math.min(100, (committed / threshold) * 100) : 0);

	const active = $derived(draft.magicalEffects.filter((e) => e.active));

	// All five branches share one card with internal tabs — five stacked sections wasted
	// a lot of vertical space when most characters only use one or two branches.
	let openBranch = $state<MagicType>('SPELL');
	const branchEffects = $derived(draft.magicalEffects.filter((e) => e.type === openBranch));

	function effectsOfType(type: MagicType) {
		return draft.magicalEffects.filter((e) => e.type === type);
	}
	function endEffect(id: string) {
		const e = draft.magicalEffects.find((x) => x.id === id);
		if (e) e.active = false;
	}
	function addEffect(type: MagicType) {
		const effect = createDefaultMagicalEffect(type);
		draft.magicalEffects.push(effect);
		// A brand-new effect has nothing to summarize in its collapsed header, so open
		// it immediately — otherwise "Add" would look like it did nothing. Reassigned
		// rather than mutated in place: plain $state(new Set()) doesn't proxy Set
		// mutators, only reassignment of the binding is guaranteed reactive.
		expanded = new Set(expanded).add(effect.id);
	}

	/** Casting above remaining headroom is overexertion: 5 HP per point over. Only
	 *  meaningful when there's a number to check — a relational cost like Dispel's
	 *  (staCost stays 0) has nothing to compare against available Vigor. */
	function overexertionCost(effect: MagicalEffect): number {
		if (effect.variableStaCost && effect.staCost === 0) return 0;
		const over = effect.staCost - available;
		return over > 0 ? over * 5 : 0;
	}

	/** "Variable" is the printed value; the cap (if any) rides along as a parenthetical
	 *  rather than being hidden, since a Sign's cap is still a number worth seeing. */
	function staCostLabel(effect: MagicalEffect): string {
		if (!effect.variableStaCost) return String(effect.staCost);
		return effect.staCost > 0 ? `Variable (max ${effect.staCost})` : 'Variable';
	}
	function dcLabel(effect: MagicalEffect): string {
		if (!effect.variableDifficultyCheck) return String(effect.difficultyCheck);
		return effect.difficultyCheck > 0 ? `Variable (~${effect.difficultyCheck})` : 'Variable';
	}

	// Edit rows are collapsed by default: a full effect form is nine field-groups plus
	// a textarea, and Amhir's own Magic tab (7 effects) made "just keep scrolling" the
	// actual complaint. Keyed by id rather than stored on the effect itself — this is
	// purely a UI state, not something that should round-trip to the server.
	let expanded = $state(new Set<string>());
	function toggleExpanded(id: string) {
		if (expanded.has(id)) expanded.delete(id);
		else expanded.add(id);
		expanded = new Set(expanded);
	}
</script>

<div class="sheet-body-grid">
	<section class="sheet-side-column">
		<!-- Threshold readout, deliberately not a spendable bar. Committed is computed
		     from maintained effects; the threshold itself is player-owned — profession
		     sets it and abilities raise it permanently, and the server never recomputes
		     it — so it is click-to-edit rather than read-only. -->
		<Panel header="Vigor Threshold" color="plain">
			<div class="vial-row">
				<div class="vial-label-row">
					<span class="vial-label">
						Committed
						{#if overCommitted}<span class="wound-flag" title="Beyond your threshold"
								>Over Threshold</span
							>{/if}
					</span>
					<span
						class="vial-value"
						style="color: {overCommitted ? 'var(--error)' : 'var(--primary)'};"
					>
						{committed}<span class="vial-max">
							/
							<InlineNumber
								bind:value={draft.derivedStats.maxVigor}
								min={0}
								label="Vigor threshold"
								editClass="vial-input threshold"
								{editable}
							/>
						</span>
					</span>
				</div>
				<div class="vial-bar">
					<div
						class="vial-fill"
						style="width: {committedPct}%; background-color: {overCommitted
							? 'color-mix(in srgb, var(--error) 65%, transparent)'
							: 'color-mix(in srgb, var(--primary-container) 45%, transparent)'};"
					></div>
				</div>
			</div>

			<div class="derived-grid" style="margin-top: var(--stack-sm);">
				<div class="derived-item">
					<div class="derived-label">Available</div>
					<div class="derived-value">{available}</div>
				</div>
				<div class="derived-item" class:over-budget={upkeep > 0}>
					<div class="derived-label">STA / round</div>
					<div class="derived-value">{upkeep > 0 ? `−${upkeep}` : '0'}</div>
				</div>
			</div>
			<span class="field-hint">
				Vigor is how much Chaos you can channel at once — it is never spent and recovered.
				Maintained effects tie it up until they end. Casting above <strong>Available</strong> is
				overexertion, costing 5 HP per point over.
				{#if editable}
					Set the threshold from your profession, raising it as abilities grant more.
				{/if}
			</span>

			{#if active.length === 0}
				<p class="empty-hint">Nothing maintained.</p>
			{:else}
				<div class="effect-list">
					{#each active as effect (effect.id)}
						<div class="effect-row">
							<div class="effect-main">
								<span class="effect-name">{effect.name || 'Unnamed'}</span>
								<span class="effect-meta">
									{effect.type ? label(effect.type) : '—'}
									{#if effect.vigorUpkeep}&middot; {effect.vigorUpkeep} vigor{/if}
									{#if effect.staUpkeep}&middot; {effect.staUpkeep} STA/round{/if}
									{#if effect.duration}&middot; {effect.duration}{/if}
								</span>
							</div>
							{#if editable}
								<button
									type="button"
									class="ability-edit-btn"
									onclick={() => endEffect(effect.id)}
									title="Ends the effect and frees its Vigor">End</button
								>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</Panel>
	</section>

	<div class="sheet-side-column">
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title={MAGIC_TYPE_PLURAL[openBranch]}
			color="primary"
		>
			{#snippet view()}
				<div class="inner-tabs">
					{#each MAGIC_TYPE_OPTIONS as branch}
						{@const n = effectsOfType(branch).length}
						<button
							type="button"
							class="inner-tab"
							class:active={openBranch === branch}
							onclick={() => (openBranch = branch)}
						>
							{MAGIC_TYPE_PLURAL[branch]}
							{#if n > 0}<span class="inner-tab-count">{n}</span>{/if}
						</button>
					{/each}
				</div>
				{#if branchEffects.length === 0}
					<p class="empty-hint">None recorded.</p>
				{:else}
					{#each branchEffects as effect (effect.id)}
						<div class="formula-row">
							<div class="formula-head">
								<span class="effect-name">{effect.name || 'Unnamed'}</span>
								<span class="formula-tags">
									{#if effect.tier}<span class="pill">{label(effect.tier)}</span>{/if}
									{#if effect.element}<span class="pill">{label(effect.element)}</span>{/if}
									{#if effect.active}<span class="pill" title="Currently maintained">Active</span
										>{/if}
								</span>
							</div>
							<span class="effect-meta">
								STA {staCostLabel(effect)}
								{#if effect.difficultyCheck || effect.variableDifficultyCheck}
									&middot; DC {dcLabel(effect)}
								{/if}
								{#if effect.range}&middot; {effect.range}{/if}
								{#if effect.duration}&middot; {effect.duration}{/if}
								{#if effect.defense}&middot; vs {effect.defense}{/if}
							</span>
							{#if overexertionCost(effect) > 0}
								<span class="effect-meta over-cost">
									{#if effect.variableStaCost}Overexertion at the full cost:
									{:else}Overexertion:
									{/if}{overexertionCost(effect)} HP at current headroom
								</span>
							{/if}
							{#if openBranch === 'RITUAL' && (effect.components || effect.preparationTime)}
								<span class="effect-meta">
									{#if effect.components}{effect.components}{/if}
									{#if effect.preparationTime}&middot; {effect.preparationTime}{/if}
								</span>
							{/if}
							{#if openBranch === 'HEX' && (effect.requirementToLift || effect.danger)}
								<span class="effect-meta">
									{#if effect.requirementToLift}Lift: {effect.requirementToLift}{/if}
									{#if effect.danger}&middot; {effect.danger}{/if}
								</span>
							{/if}
							{#if effect.effect}<p class="ability-desc">{effect.effect}</p>{/if}
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				<!-- Collapsed by default: a full effect form is nine field-groups plus a
				     description, and with a Magic tab this full (7 effects on one real
				     character) "just keep scrolling" was the actual complaint. Each row
				     opens independently, same interaction as the Skills tab's stat groups. -->
				{#each branchEffects as effect (effect.id)}
					<AccordionRow
						id={effect.id}
						open={expanded.has(effect.id)}
						onToggle={() => toggleExpanded(effect.id)}
						onRemove={() =>
							(draft.magicalEffects = draft.magicalEffects.filter((x) => x.id !== effect.id))}
						removeLabel="Remove {label(openBranch)}"
					>
						{#snippet header()}
							<span class="effect-name">{effect.name || 'Unnamed'}</span>
							<span class="attribute-card-meta">
								<span class="effect-meta">
									STA {staCostLabel(effect)}
									{#if effect.difficultyCheck || effect.variableDifficultyCheck}
										&middot; DC {dcLabel(effect)}
									{/if}
								</span>
								<span class="attribute-chevron" aria-hidden="true"></span>
							</span>
						{/snippet}
						{#snippet body()}
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Name</div>
									<input
										class="input-demo"
										type="text"
										bind:value={effect.name}
										placeholder="Name"
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Tier</div>
									<select class="input-demo" bind:value={effect.tier}>
										<option value={null}>&mdash;</option>
										{#each MASTERY_TIER_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">STA Cost</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={effect.staCost}
									/>
									<label class="checkbox-row">
										<input type="checkbox" bind:checked={effect.variableStaCost} />
										<span>Variable — a stated maximum, or 0 if relational (see Effect text).</span>
									</label>
								</div>
								<div class="field-group">
									<div class="field-hdr">Element</div>
									<select class="input-demo" bind:value={effect.element}>
										<option value={null}>&mdash;</option>
										{#each MAGIC_ELEMENT_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
									<span class="field-hint">Selects the fumble effect.</span>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Range</div>
									<input class="input-demo" type="text" bind:value={effect.range} />
								</div>
								<div class="field-group">
									<div class="field-hdr">Duration</div>
									<input class="input-demo" type="text" bind:value={effect.duration} />
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Defense</div>
									<input class="input-demo" type="text" bind:value={effect.defense} />
								</div>
								<div class="field-group">
									<div class="field-hdr">DC</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={effect.difficultyCheck}
									/>
									<label class="checkbox-row">
										<input type="checkbox" bind:checked={effect.variableDifficultyCheck} />
										<span>Variable — depends on conditions at cast time.</span>
									</label>
								</div>
							</div>

							{#if openBranch === 'RITUAL'}
								<div class="grid-2">
									<div class="field-group">
										<div class="field-hdr">Components</div>
										<input class="input-demo" type="text" bind:value={effect.components} />
									</div>
									<div class="field-group">
										<div class="field-hdr">Preparation Time</div>
										<input class="input-demo" type="text" bind:value={effect.preparationTime} />
									</div>
								</div>
							{/if}
							{#if openBranch === 'HEX'}
								<div class="grid-2">
									<div class="field-group">
										<div class="field-hdr">Requirement To Lift</div>
										<input class="input-demo" type="text" bind:value={effect.requirementToLift} />
									</div>
									<div class="field-group">
										<div class="field-hdr">Danger</div>
										<input class="input-demo" type="text" bind:value={effect.danger} />
									</div>
								</div>
							{/if}

							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Vigor Upkeep</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={effect.vigorUpkeep}
									/>
									<span class="field-hint">Held while maintained.</span>
								</div>
								<div class="field-group">
									<div class="field-hdr">STA Upkeep</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={effect.staUpkeep}
									/>
									<span class="field-hint">Per round.</span>
								</div>
							</div>

							<div class="field-group">
								<div class="field-hdr">Effect</div>
								<textarea class="input-demo" rows="3" bind:value={effect.effect}></textarea>
							</div>

							<label class="finish-creation">
								<input type="checkbox" bind:checked={effect.active} />
								<span>Maintained — commits its Vigor until ended.</span>
							</label>
						{/snippet}
					</AccordionRow>
				{/each}
				<button type="button" class="add-row-btn" onclick={() => addEffect(openBranch)}
					>+ Add {label(openBranch)}</button
				>
			{/snippet}
		</SheetSection>
	</div>
</div>
