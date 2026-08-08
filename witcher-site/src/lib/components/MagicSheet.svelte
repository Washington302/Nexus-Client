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
		staminaUpkeep
	} from '$lib/utils/character';
	import InlineNumber from '$lib/components/InlineNumber.svelte';
	import Panel from '$lib/components/Panel.svelte';
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

	// Vigor is capacity, not a reserve — never spent and recovered. What consumes it is
	// maintenance: each active effect ties up its vigorUpkeep until it ends. Summed
	// locally as well as server-side so the number moves as effects are toggled.
	const committed = $derived(committedVigor(draft.magicalEffects));
	const threshold = $derived(draft.derivedStats.maxVigor);
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
		draft.magicalEffects.push(createDefaultMagicalEffect(type));
	}

	/** Casting above remaining headroom is overexertion: 5 HP per point over. */
	function overexertionCost(effect: MagicalEffect): number {
		const over = effect.staCost - available;
		return over > 0 ? over * 5 : 0;
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
								STA {effect.staCost}
								{#if effect.difficultyCheck}&middot; DC {effect.difficultyCheck}{/if}
								{#if effect.range}&middot; {effect.range}{/if}
								{#if effect.duration}&middot; {effect.duration}{/if}
								{#if effect.defense}&middot; vs {effect.defense}{/if}
							</span>
							{#if effect.staCost > available}
								<span class="effect-meta over-cost">
									Overexertion: {overexertionCost(effect)} HP at current headroom
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
				{#each branchEffects as effect (effect.id)}
					<div class="list-card">
						<div class="grid-2">
							<div class="field-group">
								<div class="field-hdr">Name</div>
								<input class="input-demo" type="text" bind:value={effect.name} placeholder="Name" />
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

						<button
							type="button"
							class="remove-row-btn"
							aria-label="Remove {label(openBranch)}"
							onclick={() =>
								(draft.magicalEffects = draft.magicalEffects.filter((x) => x.id !== effect.id))}
							>✕</button
						>
					</div>
				{/each}
				<button type="button" class="add-row-btn" onclick={() => addEffect(openBranch)}
					>+ Add {label(openBranch)}</button
				>
			{/snippet}
		</SheetSection>
	</div>
</div>
