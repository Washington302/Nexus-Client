<script lang="ts">
	import type {
		WitcherCharacter,
		AlchemicalItem,
		Substance,
		Recipe,
		RecipeComponent
	} from '$lib/services/api';
	import {
		label,
		memorizedCap,
		memorizedCount,
		ALCHEMY_TYPE_OPTIONS,
		MASTERY_TIER_OPTIONS,
		RARITY_OPTIONS,
		SUBSTANCE_ORDER,
		createDefaultRecipe,
		createDefaultComponent,
		createDefaultMaterial,
		createDefaultAlchemicalItem,
		createEffectFromItem,
		createDefaultEffect
	} from '$lib/utils/character';
	import Panel from '$lib/components/Panel.svelte';
	import SheetSection from '$lib/components/SheetSection.svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import SubstanceGroupCard from '$lib/components/SubstanceGroupCard.svelte';
	import SubstanceGroupEditor from '$lib/components/SubstanceGroupEditor.svelte';
	import AccordionRow from '$lib/components/AccordionRow.svelte';

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

	// currentToxicity is recomputed server-side from activeAlchemyEffects on every
	// save, so it is never edited here — the way to lower it is to drop the effect
	// carrying it, exactly as the rulebook does when one expires or White Honey
	// clears them. Summed locally too so the number moves before the save lands.
	const liveToxicity = $derived(
		draft.activeAlchemyEffects.reduce((sum, e) => sum + (e.toxicityPercent || 0), 0)
	);
	const threshold = $derived(draft.derivedStats.toxicityThreshold);
	const overToxic = $derived(threshold > 0 && liveToxicity > threshold);
	const toxicityPct = $derived(threshold > 0 ? Math.min(100, (liveToxicity / threshold) * 100) : 0);

	function ingredientsFor(substance: Substance) {
		return draft.materials.filter((i) => i.yieldsSubstance === substance);
	}

	// One INT-bounded pool spanning diagrams and formulae. Enforced here because the
	// server accepts `memorized` without validating it.
	const memoryCap = $derived(memorizedCap(draft.statistics));
	const memorised = $derived(memorizedCount(draft.recipes));
	const atMemoryCap = $derived(memorised >= memoryCap);

	/** Block only *newly* memorising once full — unchecking must always work. */
	function memoriseBlocked(recipe: Recipe): boolean {
		return atMemoryCap && !recipe.memorized;
	}

	// A component is either fungible (any material yielding the substance) or a
	// specific named material — diagrams don't allow substitution.
	function componentLabel(comp: RecipeComponent): string {
		const what = comp.substance ? label(comp.substance) : comp.materialName || '—';
		return `${comp.quantity}× ${what}`;
	}

	function takeDose(item: AlchemicalItem) {
		draft.activeAlchemyEffects.push(createEffectFromItem(item));
		if (item.quantity > 0) item.quantity -= 1;
	}
	function endEffect(id: string) {
		draft.activeAlchemyEffects = draft.activeAlchemyEffects.filter((e) => e.id !== id);
	}
	function clearAllEffects() {
		draft.activeAlchemyEffects = [];
	}

	// Collapsed by default — see AccordionRow. One shared set for every list on this
	// tab: ids are UUIDs, so they can't collide across doses/effects/formulae.
	let expanded = $state(new Set<string>());
	function toggleExpanded(id: string) {
		if (expanded.has(id)) expanded.delete(id);
		else expanded.add(id);
		expanded = new Set(expanded);
	}
	function expand(id: string) {
		expanded = new Set(expanded).add(id);
	}
</script>

<div class="sheet-body-grid">
	<section class="sheet-side-column">
		<!-- Toxicity is server-computed, so this panel is a readout with one action:
		     ending effects. No pencil — there is nothing here to type into. -->
		<Panel header="Toxicity" color="plain">
			<div class="vial-row">
				<div class="vial-label-row">
					<span class="vial-label">
						Current
						{#if overToxic}<span class="wound-flag" title="Over threshold">Over Threshold</span
							>{/if}
					</span>
					<span class="vial-value" style="color: {overToxic ? 'var(--error)' : 'var(--aether)'};">
						{liveToxicity}<span class="vial-max">/ {threshold}</span>
					</span>
				</div>
				<div class="vial-bar">
					<div
						class="vial-fill"
						class:toxic={overToxic}
						style="width: {toxicityPct}%; background-color: {overToxic
							? 'color-mix(in srgb, var(--error) 65%, transparent)'
							: 'color-mix(in srgb, var(--aether) 55%, transparent)'};"
					></div>
				</div>
			</div>
			<span class="field-hint">
				Summed from active effects by the server. Lower it by ending an effect below.
			</span>

			{#if draft.activeAlchemyEffects.length === 0}
				<p class="empty-hint">Nothing active.</p>
			{:else}
				<div class="effect-list">
					{#each draft.activeAlchemyEffects as effect (effect.id)}
						<div class="effect-row">
							<div class="effect-main">
								<span class="effect-name">{effect.name || 'Unnamed effect'}</span>
								<span class="effect-meta">
									{effect.toxicityPercent}% toxicity
									{#if effect.durationRemaining}&middot; {effect.durationRemaining}{/if}
								</span>
							</div>
							{#if editable}
								<button
									type="button"
									class="ability-edit-btn"
									onclick={() => endEffect(effect.id)}
									title="Effect expired or cleared">End</button
								>
							{/if}
						</div>
					{/each}
				</div>
				{#if editable}
					<button type="button" class="add-row-btn" onclick={clearAllEffects}>
						Clear all effects
					</button>
				{/if}
			{/if}
		</Panel>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Carried Doses"
			color="plain"
		>
			{#snippet view()}
				{#if draft.alchemicalItems.length === 0}
					<p class="empty-hint">Nothing carried.</p>
				{:else}
					{#each draft.alchemicalItems as item (item.id)}
						<div class="effect-row">
							<div class="effect-main">
								<span class="effect-name">{item.name || 'Unnamed'} &times;{item.quantity}</span>
								<span class="effect-meta">
									{item.type ? label(item.type) : '—'} &middot; {item.toxicityPercent}% toxicity
									{#if item.duration}&middot; {item.duration}{/if}
								</span>
							</div>
							{#if editable}
								<button
									type="button"
									class="ability-edit-btn"
									disabled={item.quantity <= 0}
									onclick={() => takeDose(item)}
									title="Apply this dose — adds its toxicity">Take</button
								>
							{/if}
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each draft.alchemicalItems as item, i (item.id)}
					<AccordionRow
						id={item.id}
						open={expanded.has(item.id)}
						onToggle={() => toggleExpanded(item.id)}
						onRemove={() =>
							(draft.alchemicalItems = draft.alchemicalItems.filter((_, x) => x !== i))}
						removeLabel="Remove dose"
					>
						{#snippet header()}
							<span class="effect-name">{item.name || 'Unnamed'} &times;{item.quantity}</span>
							<span class="attribute-card-meta">
								<span class="effect-meta">
									{item.type ? label(item.type) : '—'} &middot; {item.toxicityPercent}%
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
										bind:value={item.name}
										placeholder="Dose name"
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Type</div>
									<select class="input-demo" bind:value={item.type}>
										{#each ALCHEMY_TYPE_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Quantity</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={item.quantity}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Toxicity %</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={item.toxicityPercent}
									/>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Duration</div>
									<input class="input-demo" type="text" bind:value={item.duration} />
								</div>
								<div class="field-group">
									<div class="field-hdr">Weight</div>
									<input
										class="input-demo input-num"
										type="number"
										step="0.1"
										bind:value={item.weight}
									/>
								</div>
							</div>
							<div class="field-group">
								<div class="field-hdr">Effect</div>
								<textarea class="input-demo" rows="2" bind:value={item.effectText}></textarea>
							</div>
						{/snippet}
					</AccordionRow>
				{/each}
				<button
					type="button"
					class="add-row-btn"
					onclick={() => {
						const item = createDefaultAlchemicalItem();
						draft.alchemicalItems.push(item);
						expand(item.id);
					}}>+ Add Dose</button
				>
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Active Effects"
			color="plain"
		>
			{#snippet view()}
				<span class="field-hint">
					Added by taking a dose, or by hand for anything the sheet didn't hand out.
				</span>
			{/snippet}
			{#snippet edit()}
				{#each draft.activeAlchemyEffects as effect, i (effect.id)}
					<AccordionRow
						id={effect.id}
						open={expanded.has(effect.id)}
						onToggle={() => toggleExpanded(effect.id)}
						onRemove={() =>
							(draft.activeAlchemyEffects = draft.activeAlchemyEffects.filter((_, x) => x !== i))}
						removeLabel="Remove effect"
					>
						{#snippet header()}
							<span class="effect-name">{effect.name || 'Unnamed effect'}</span>
							<span class="attribute-card-meta">
								<span class="effect-meta">{effect.toxicityPercent}%</span>
								<span class="attribute-chevron" aria-hidden="true"></span>
							</span>
						{/snippet}
						{#snippet body()}
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Name</div>
									<input class="input-demo" type="text" bind:value={effect.name} />
								</div>
								<div class="field-group">
									<div class="field-hdr">Toxicity %</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={effect.toxicityPercent}
									/>
								</div>
							</div>
							<div class="field-group">
								<div class="field-hdr">Duration Remaining</div>
								<input class="input-demo" type="text" bind:value={effect.durationRemaining} />
							</div>
						{/snippet}
					</AccordionRow>
				{/each}
				<button
					type="button"
					class="add-row-btn"
					onclick={() => {
						const effect = createDefaultEffect();
						draft.activeAlchemyEffects.push(effect);
						expand(effect.id);
					}}>+ Add Effect</button
				>
			{/snippet}
		</SheetSection>
	</section>

	<div class="sheet-side-column">
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Known Formulae"
			color="primary"
		>
			{#snippet view()}
				<div class="memory-line" class:over={memorised > memoryCap}>
					<span class="derived-label">Memorized</span>
					<span class="memory-count">{memorised}<span class="budget-cap">/{memoryCap}</span></span>
					<span class="field-hint" style="margin:0;">Capped by INT, across all recipes.</span>
				</div>
				{#if draft.recipes.length === 0}
					<p class="empty-hint">No formulae recorded.</p>
				{:else}
					{#each draft.recipes as formula (formula.id)}
						<div class="formula-row">
							<div class="formula-head">
								<span class="effect-name">{formula.name || 'Unnamed formula'}</span>
								<span class="formula-tags">
									{#if formula.tier}<span class="pill">{label(formula.tier)}</span>{/if}
									{#if formula.alchemyType}<span class="pill">{label(formula.alchemyType)}</span
										>{/if}
									{#if formula.writtenCopy}<span class="pill" title="Written down: +2 Alchemy"
											>Written</span
										>{/if}
									{#if formula.memorized}<span class="pill" title="Held in memory">Memorized</span
										>{/if}
								</span>
							</div>
							<span class="effect-meta">
								DC {formula.craftingDc} &middot; {formula.craftingTime || '—'} &middot;
								{formula.toxicityPercent}% toxicity
								{#if formula.cost}&middot; {formula.cost} crowns{/if}
							</span>
							{#if formula.components.length > 0}
								<span class="effect-meta">
									{formula.components.map(componentLabel).join(', ')}
								</span>
							{/if}
							{#if formula.effectText}
								<p class="ability-desc">{formula.effectText}</p>
							{/if}
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each draft.recipes as formula, i (formula.id)}
					<AccordionRow
						id={formula.id}
						open={expanded.has(formula.id)}
						onToggle={() => toggleExpanded(formula.id)}
						onRemove={() => (draft.recipes = draft.recipes.filter((_, x) => x !== i))}
						removeLabel="Remove formula"
					>
						{#snippet header()}
							<span class="effect-name">{formula.name || 'Unnamed formula'}</span>
							<span class="attribute-card-meta">
								{#if formula.memorized}<span class="pill" title="Held in memory">Memorized</span
									>{/if}
								<span class="attribute-chevron" aria-hidden="true"></span>
							</span>
						{/snippet}
						{#snippet body()}
							<div class="field-group">
								<div class="field-hdr">Name</div>
								<input
									class="input-demo"
									type="text"
									bind:value={formula.name}
									placeholder="Formula name"
								/>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Type</div>
									<select class="input-demo" bind:value={formula.type}>
										{#each ALCHEMY_TYPE_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
								<div class="field-group">
									<div class="field-hdr">Tier</div>
									<select class="input-demo" bind:value={formula.tier}>
										{#each MASTERY_TIER_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Crafting DC</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={formula.craftingDc}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Crafting Time</div>
									<input class="input-demo" type="text" bind:value={formula.craftingTime} />
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Toxicity %</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={formula.toxicityPercent}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Cost</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={formula.cost}
									/>
								</div>
							</div>

							<div class="field-hdr">Components</div>
							{#each formula.components as comp, ci (comp.id)}
								<div class="bg-row">
									<select class="input-demo bg-row-kind" bind:value={comp.substance}>
										{#each SUBSTANCE_ORDER as sub}
											<option value={sub}>{label(sub)}</option>
										{/each}
									</select>
									<input
										class="input-demo input-num"
										type="number"
										min="1"
										bind:value={comp.quantity}
									/>
									<button
										type="button"
										class="remove-row-btn"
										aria-label="Remove component"
										onclick={() =>
											(formula.components = formula.components.filter((_, x) => x !== ci))}
										>✕</button
									>
								</div>
							{/each}
							<button
								type="button"
								class="add-row-btn"
								onclick={() => formula.components.push(createDefaultComponent())}
								>+ Add Component</button
							>

							<label class="finish-creation">
								<input type="checkbox" bind:checked={formula.writtenCopy} />
								<span>Written copy — grants +2 Alchemy when crafting from it.</span>
							</label>

							<!-- Client-side cap: the server does not validate `memorized`, so this is
							     the only thing stopping an over-cap character. Already-memorized
							     recipes stay togglable so you can always free a slot. -->
							<label class="finish-creation" class:disabled={memoriseBlocked(formula)}>
								<input
									type="checkbox"
									bind:checked={formula.memorized}
									disabled={memoriseBlocked(formula)}
								/>
								<span>
									Memorized — held in memory rather than read from the page.
									{#if memoriseBlocked(formula)}
										<strong>At capacity ({memorised}/{memoryCap})</strong>; un-memorize another
										first.
									{/if}
								</span>
							</label>

							<div class="field-group">
								<div class="field-hdr">Effect</div>
								<textarea class="input-demo" rows="3" bind:value={formula.effectText}></textarea>
							</div>
						{/snippet}
					</AccordionRow>
				{/each}
				<button
					type="button"
					class="add-row-btn"
					onclick={() => {
						const formula = createDefaultRecipe();
						draft.recipes.push(formula);
						expand(formula.id);
					}}>+ Add Formula</button
				>
			{/snippet}
		</SheetSection>

		<!-- Substances own their ingredients: each group shows the extracted amount on
		     hand and expands to the ingredients that yield it. Every alchemical
		     ingredient yields exactly one substance, so there is no catch-all group —
		     materials that yield nothing are crafting materials and live under Gear. -->
		<Panel header="Substances &amp; Ingredients" color="gold">
			<span class="field-hint" style="display:block;margin-bottom:8px;">
				The number is extracted substance ready to use; expand a group for the ingredients that
				yield it.
			</span>
			<div class="substance-column">
				{#each draft.substanceStore as row (row.substance)}
					{@const groupIngredients = ingredientsFor(row.substance)}
					{#if editable}
						<EditableWrapper
							title="{label(row.substance)} Ingredients"
							isEditable={true}
							onSave={async () => {}}
							onOpen={onOpenEdit}
							onCancel={onCancelEdit}
						>
							{#snippet children()}
								<SubstanceGroupCard
									substance={row.substance}
									quantity={row.quantity}
									ingredients={groupIngredients}
								/>
							{/snippet}
							{#snippet editForm()}
								<SubstanceGroupEditor
									{draft}
									substance={row.substance}
									ingredients={groupIngredients}
								/>
							{/snippet}
						</EditableWrapper>
					{:else}
						<SubstanceGroupCard
							substance={row.substance}
							quantity={row.quantity}
							ingredients={groupIngredients}
						/>
					{/if}
				{/each}
			</div>
		</Panel>
	</div>
</div>
