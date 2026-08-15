<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import {
		label,
		WEAPON_TYPE_OPTIONS,
		AVAILABILITY_OPTIONS,
		CONCEALMENT_OPTIONS,
		ARMOR_LOCATION_OPTIONS,
		SUBSTANCE_ORDER,
		createDefaultWeapon,
		createDefaultArmor,
		createDefaultEquipment,
		createDefaultMaterial,
		createDefaultRecipe,
		createDefaultComponent,
		craftingMaterials,
		diagrams
	} from '$lib/utils/character';
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

	// Weight and penalty are always computed server-side; `encumbranceEnabled` only
	// says whether this table plays with the rule, so the readout stays visible either
	// way and just calls itself off. Same contract as woundThreshold.
	const d = $derived(draft.derivedStats);
	const overweight = $derived(d.totalWeight > d.encumbrance);
	const weightPct = $derived(
		d.encumbrance > 0 ? Math.min(100, (d.totalWeight / d.encumbrance) * 100) : 0
	);

	const materials = $derived(craftingMaterials(draft.materials));
	const diagramList = $derived(diagrams(draft.recipes));

	function addCraftingMaterial() {
		// null substance is what makes it a crafting material rather than alchemical.
		const mat = createDefaultMaterial(null);
		draft.materials.push(mat);
		expand(mat.id);
	}
	function addDiagram() {
		const dia = createDefaultRecipe('DIAGRAM');
		draft.recipes.push(dia);
		expand(dia.id);
	}
	function toggleWeaponType(weapon: { weaponTypes: string[] }, type: string) {
		weapon.weaponTypes = weapon.weaponTypes.includes(type)
			? weapon.weaponTypes.filter((t) => t !== type)
			: [...weapon.weaponTypes, type];
	}

	// Collapsed by default — see AccordionRow. One shared set for every list on this
	// tab: ids are UUIDs, so they can't collide across armor/weapons/materials/diagrams.
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
		<Panel header="Load" color="plain">
			<div class="vial-row">
				<div class="vial-label-row">
					<span class="vial-label">
						Carried
						{#if overweight}<span class="wound-flag" title="Over encumbrance limit">Overloaded</span
							>{/if}
					</span>
					<span class="vial-value" style="color: {overweight ? 'var(--error)' : 'var(--primary)'};">
						{d.totalWeight}<span class="vial-max">/ {d.encumbrance} kg</span>
					</span>
				</div>
				<div class="vial-bar">
					<div
						class="vial-fill"
						style="width: {weightPct}%; background-color: {overweight
							? 'color-mix(in srgb, var(--error) 65%, transparent)'
							: 'color-mix(in srgb, var(--primary-container) 45%, transparent)'};"
					></div>
				</div>
			</div>

			<div class="derived-grid" style="margin-top: var(--stack-sm);">
				<div class="derived-item" class:over-budget={d.encumbrancePenalty > 0}>
					<div class="derived-label">Load Penalty</div>
					<div class="derived-value">
						{d.encumbrancePenalty > 0 ? `−${d.encumbrancePenalty}` : '0'}
					</div>
				</div>
				<div class="derived-item" class:over-budget={d.armorEncumbranceValue > 0}>
					<div class="derived-label">Armor EV</div>
					<div class="derived-value">
						{d.armorEncumbranceValue > 0 ? `−${d.armorEncumbranceValue}` : '0'}
					</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Deadlift</div>
					<div class="derived-value">{d.deadliftCapacity}</div>
				</div>
			</div>
			<span class="field-hint">
				Load penalty hits REF, DEX and SPD. Armor EV is separate — stiffness, worn only, and applies
				to REF and DEX.
			</span>

			{#if editable}
				<label class="finish-creation">
					<input type="checkbox" bind:checked={draft.optionalRules.encumbranceEnabled} />
					<span>
						Track encumbrance at this table. Weight is always calculated; this only says whether the
						penalty applies.
					</span>
				</label>
			{:else if !draft.optionalRules.encumbranceEnabled}
				<span class="field-hint"
					>Encumbrance is an optional rule and is off for this character.</span
				>
			{/if}
		</Panel>

		<SheetSection {editable} onOpen={onOpenEdit} onCancel={onCancelEdit} title="Coin" color="gold">
			{#snippet view()}
				<div class="derived-item" style="text-align:left;">
					<div class="derived-label">Crowns</div>
					<div class="derived-value">{draft.wealth.crowns}</div>
				</div>
				{#if draft.wealth.notes}
					<div class="field-value notes-block" style="margin-top:8px;">{draft.wealth.notes}</div>
				{/if}
			{/snippet}
			{#snippet edit()}
				<div class="field-group">
					<div class="field-hdr">Crowns</div>
					<input
						class="input-demo input-num"
						type="number"
						min="0"
						bind:value={draft.wealth.crowns}
					/>
				</div>
				<div class="field-group">
					<div class="field-hdr">Notes</div>
					<textarea class="input-demo" rows="3" bind:value={draft.wealth.notes}></textarea>
				</div>
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Armor"
			color="plain"
		>
			{#snippet view()}
				{#if draft.armor.length === 0}
					<p class="empty-hint">No armor recorded.</p>
				{:else}
					{#each draft.armor as piece (piece.id)}
						<div class="formula-row">
							<div class="formula-head">
								<span class="effect-name">{piece.name || 'Unnamed'}</span>
								<span class="formula-tags">
									{#if piece.location}<span class="pill">{label(piece.location)}</span>{/if}
									{#if piece.equipped}<span class="pill" title="Worn — EV applies">Worn</span>{/if}
								</span>
							</div>
							<span class="effect-meta">
								SP {piece.currentStoppingPower}/{piece.maxStoppingPower} &middot; EV {piece.encumbranceValue}
								&middot; {piece.weight}kg
								{#if piece.enhancementSlots}&middot; {piece.enhancementSlots} AE{/if}
							</span>
							{#if piece.effect}<span class="effect-meta">{piece.effect}</span>{/if}
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each draft.armor as piece, i (piece.id)}
					<AccordionRow
						id={piece.id}
						open={expanded.has(piece.id)}
						onToggle={() => toggleExpanded(piece.id)}
						onRemove={() => (draft.armor = draft.armor.filter((_, x) => x !== i))}
						removeLabel="Remove armor"
					>
						{#snippet header()}
							<span class="effect-name">{piece.name || 'Unnamed'}</span>
							<span class="attribute-card-meta">
								<span class="effect-meta">
									SP {piece.currentStoppingPower}/{piece.maxStoppingPower} &middot; EV {piece.encumbranceValue}
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
										bind:value={piece.name}
										placeholder="Armor name"
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Location</div>
									<select class="input-demo" bind:value={piece.location}>
										<option value={null}>&mdash;</option>
										{#each ARMOR_LOCATION_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">SP (current)</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={piece.currentStoppingPower}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">SP (max)</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={piece.maxStoppingPower}
									/>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">EV</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={piece.encumbranceValue}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Weight</div>
									<input
										class="input-demo input-num"
										type="number"
										step="0.1"
										bind:value={piece.weight}
									/>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Enhancement Slots</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={piece.enhancementSlots}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Cost</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={piece.cost}
									/>
								</div>
							</div>
							<div class="field-group">
								<div class="field-hdr">Effect</div>
								<textarea class="input-demo" rows="2" bind:value={piece.effect}></textarea>
							</div>
							<label class="finish-creation">
								<input type="checkbox" bind:checked={piece.equipped} />
								<span>Worn — its EV counts against REF and DEX.</span>
							</label>
						{/snippet}
					</AccordionRow>
				{/each}
				<button
					type="button"
					class="add-row-btn"
					onclick={() => {
						const a = createDefaultArmor();
						draft.armor.push(a);
						expand(a.id);
					}}>+ Add Armor</button
				>
			{/snippet}
		</SheetSection>
	</section>

	<div class="sheet-side-column">
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Weapons"
			color="primary"
		>
			{#snippet view()}
				{#if draft.weapons.length === 0}
					<p class="empty-hint">No weapons recorded.</p>
				{:else}
					{#each draft.weapons as weapon (weapon.id)}
						<div class="formula-row">
							<div class="formula-head">
								<span class="effect-name">
									{weapon.name ||
										'Unnamed'}{#if weapon.quantity > 1}&nbsp;&times;{weapon.quantity}{/if}
								</span>
								<span class="formula-tags">
									{#each weapon.weaponTypes as t}<span class="pill">{label(t)}</span>{/each}
								</span>
							</div>
							<span class="effect-meta">
								{weapon.damage || '—'} &middot; WA {weapon.weaponAccuracy >= 0
									? `+${weapon.weaponAccuracy}`
									: weapon.weaponAccuracy} &middot; Rel {weapon.currentReliability}/{weapon.maxReliability}
								&middot; {weapon.hands}H &middot; {weapon.weight}kg
							</span>
							<span class="effect-meta">
								{#if weapon.range}Range {weapon.range} &middot;
								{/if}
								{#if weapon.concealment}{label(weapon.concealment)} &middot;
								{/if}
								{weapon.enhancementSlots} AE
							</span>
							{#if weapon.effect}<span class="effect-meta">{weapon.effect}</span>{/if}
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each draft.weapons as weapon, i (weapon.id)}
					<AccordionRow
						id={weapon.id}
						open={expanded.has(weapon.id)}
						onToggle={() => toggleExpanded(weapon.id)}
						onRemove={() => (draft.weapons = draft.weapons.filter((_, x) => x !== i))}
						removeLabel="Remove weapon"
					>
						{#snippet header()}
							<span class="effect-name">
								{weapon.name ||
									'Unnamed'}{#if weapon.quantity > 1}&nbsp;&times;{weapon.quantity}{/if}
							</span>
							<span class="attribute-card-meta">
								<span class="effect-meta">{weapon.damage || '—'}</span>
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
										bind:value={weapon.name}
										placeholder="Weapon name"
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Damage</div>
									<input class="input-demo" type="text" bind:value={weapon.damage} />
								</div>
							</div>

							<div class="field-hdr">Damage Types</div>
							<div class="type-toggles">
								{#each WEAPON_TYPE_OPTIONS as t}
									<label class="type-toggle">
										<input
											type="checkbox"
											checked={weapon.weaponTypes.includes(t)}
											onchange={() => toggleWeaponType(weapon, t)}
										/>
										<span>{label(t)}</span>
									</label>
								{/each}
							</div>

							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Weapon Accuracy</div>
									<input
										class="input-demo input-num"
										type="number"
										bind:value={weapon.weaponAccuracy}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Hands</div>
									<input
										class="input-demo input-num"
										type="number"
										min="1"
										bind:value={weapon.hands}
									/>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Reliability (current)</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={weapon.currentReliability}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Reliability (max)</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={weapon.maxReliability}
									/>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Range</div>
									<input class="input-demo" type="text" bind:value={weapon.range} />
									<span class="field-hint">Blank for melee.</span>
								</div>
								<div class="field-group">
									<div class="field-hdr">Concealment</div>
									<select class="input-demo" bind:value={weapon.concealment}>
										<option value={null}>&mdash;</option>
										{#each CONCEALMENT_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Enhancement Slots</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={weapon.enhancementSlots}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Availability</div>
									<select class="input-demo" bind:value={weapon.availability}>
										<option value={null}>&mdash;</option>
										{#each AVAILABILITY_OPTIONS as opt}
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
										bind:value={weapon.quantity}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Weight</div>
									<input
										class="input-demo input-num"
										type="number"
										step="0.1"
										bind:value={weapon.weight}
									/>
								</div>
							</div>
							<div class="field-group">
								<div class="field-hdr">Effect</div>
								<textarea class="input-demo" rows="2" bind:value={weapon.effect}></textarea>
							</div>
						{/snippet}
					</AccordionRow>
				{/each}
				<button
					type="button"
					class="add-row-btn"
					onclick={() => {
						const w = createDefaultWeapon();
						draft.weapons.push(w);
						expand(w.id);
					}}>+ Add Weapon</button
				>
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Equipment"
			color="plain"
		>
			{#snippet view()}
				{#if draft.equipment.length === 0}
					<p class="empty-hint">Nothing carried.</p>
				{:else}
					{#each draft.equipment as item (item.id)}
						<div class="effect-row">
							<div class="effect-main">
								<span class="effect-name">{item.name || 'Unnamed'} &times;{item.quantity}</span>
								<span class="effect-meta">
									{item.weight}kg each{#if item.notes}&nbsp;&middot; {item.notes}{/if}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each draft.equipment as item, i (item.id)}
					<div class="bg-row">
						<input class="input-demo" type="text" bind:value={item.name} placeholder="Item" />
						<input class="input-demo input-num" type="number" min="0" bind:value={item.quantity} />
						<input class="input-demo input-num" type="number" step="0.1" bind:value={item.weight} />
						<button
							type="button"
							class="remove-row-btn"
							aria-label="Remove item"
							onclick={() => (draft.equipment = draft.equipment.filter((_, x) => x !== i))}
							>✕</button
						>
					</div>
				{/each}
				<span class="field-hint">Name, quantity, weight each.</span>
				<button
					type="button"
					class="add-row-btn"
					onclick={() => draft.equipment.push(createDefaultEquipment())}>+ Add Item</button
				>
			{/snippet}
		</SheetSection>

		<!-- Crafting materials are Material rows with no substance; the alchemical ones
		     roll up under Alchemy's substance groups instead. Diagrams are the crafting
		     half of the unified recipe list. -->
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Crafting Materials"
			color="plain"
		>
			{#snippet view()}
				{#if materials.length === 0}
					<p class="empty-hint">No crafting materials recorded.</p>
				{:else}
					{#each materials as mat (mat.id)}
						<div class="effect-row">
							<div class="effect-main">
								<span class="effect-name">{mat.name || 'Unnamed'} &times;{mat.quantityHeld}</span>
								<span class="effect-meta">
									{mat.weight}kg{#if mat.rarity}&nbsp;&middot; {label(
											mat.rarity
										)}{/if}{#if mat.location}&nbsp;&middot;
										{mat.location}{/if}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each materials as mat (mat.id)}
					<AccordionRow
						id={mat.id}
						open={expanded.has(mat.id)}
						onToggle={() => toggleExpanded(mat.id)}
						onRemove={() => (draft.materials = draft.materials.filter((m) => m.id !== mat.id))}
						removeLabel="Remove material"
					>
						{#snippet header()}
							<span class="effect-name">{mat.name || 'Unnamed'} &times;{mat.quantityHeld}</span>
							<span class="attribute-card-meta">
								{#if mat.rarity}<span class="effect-meta">{label(mat.rarity)}</span>{/if}
								<span class="attribute-chevron" aria-hidden="true"></span>
							</span>
						{/snippet}
						{#snippet body()}
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Material</div>
									<input
										class="input-demo"
										type="text"
										bind:value={mat.name}
										placeholder="Material name"
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Held</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={mat.quantityHeld}
									/>
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Weight</div>
									<input
										class="input-demo input-num"
										type="number"
										step="0.1"
										bind:value={mat.weight}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Rarity</div>
									<select class="input-demo" bind:value={mat.rarity}>
										<option value={null}>&mdash;</option>
										{#each AVAILABILITY_OPTIONS as opt}
											<option value={opt}>{label(opt)}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="field-group">
								<div class="field-hdr">Found</div>
								<input class="input-demo" type="text" bind:value={mat.location} />
							</div>
							<div class="field-group">
								<div class="field-hdr">Yields Substance</div>
								<select class="input-demo" bind:value={mat.yieldsSubstance}>
									<option value={null}>&mdash; None (crafting material) &mdash;</option>
									{#each SUBSTANCE_ORDER as sub}
										<option value={sub}>{label(sub)}</option>
									{/each}
								</select>
								<span class="field-hint">Setting one moves it to the Alchemy tab.</span>
							</div>
						{/snippet}
					</AccordionRow>
				{/each}
				<button type="button" class="add-row-btn" onclick={addCraftingMaterial}
					>+ Add Material</button
				>
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Diagrams"
			color="gold"
		>
			{#snippet view()}
				{#if diagramList.length === 0}
					<p class="empty-hint">No diagrams recorded.</p>
				{:else}
					{#each diagramList as dia (dia.id)}
						<div class="formula-row">
							<div class="formula-head">
								<span class="effect-name">{dia.name || 'Unnamed diagram'}</span>
								<span class="formula-tags">
									{#if dia.tier}<span class="pill">{label(dia.tier)}</span>{/if}
									{#if dia.requiresForge}<span class="pill">Forge</span>{/if}
									{#if dia.writtenCopy}<span class="pill" title="Written: +2">Written</span>{/if}
									{#if dia.memorized}<span class="pill">Memorized</span>{/if}
								</span>
							</div>
							<span class="effect-meta">
								DC {dia.craftingDc} &middot; {dia.craftingTime || '—'}
								{#if dia.craftedType}&middot; {dia.craftedType}{/if}
								{#if dia.cost}&middot; {dia.cost} crowns{/if}
							</span>
							{#if dia.components.length > 0}
								<span class="effect-meta">
									{dia.components
										.map(
											(c) =>
												`${c.quantity}× ${c.materialName || (c.substance ? label(c.substance) : '—')}`
										)
										.join(', ')}
								</span>
							{/if}
						</div>
					{/each}
				{/if}
			{/snippet}
			{#snippet edit()}
				{#each diagramList as dia (dia.id)}
					<AccordionRow
						id={dia.id}
						open={expanded.has(dia.id)}
						onToggle={() => toggleExpanded(dia.id)}
						onRemove={() => (draft.recipes = draft.recipes.filter((r) => r.id !== dia.id))}
						removeLabel="Remove diagram"
					>
						{#snippet header()}
							<span class="effect-name">{dia.name || 'Unnamed diagram'}</span>
							<span class="attribute-card-meta">
								<span class="effect-meta">DC {dia.craftingDc}</span>
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
										bind:value={dia.name}
										placeholder="Diagram name"
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Produces</div>
									<input class="input-demo" type="text" bind:value={dia.craftedType} />
								</div>
							</div>
							<div class="grid-2">
								<div class="field-group">
									<div class="field-hdr">Crafting DC</div>
									<input
										class="input-demo input-num"
										type="number"
										min="0"
										bind:value={dia.craftingDc}
									/>
								</div>
								<div class="field-group">
									<div class="field-hdr">Time</div>
									<input class="input-demo" type="text" bind:value={dia.craftingTime} />
								</div>
							</div>

							<div class="field-hdr">Components</div>
							<span class="field-hint">
								Named materials only — diagrams don't allow substitution.
							</span>
							{#each dia.components as comp, ci (comp.id)}
								<div class="bg-row">
									<input
										class="input-demo"
										type="text"
										bind:value={comp.materialName}
										placeholder="Material"
									/>
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
										onclick={() => (dia.components = dia.components.filter((_, x) => x !== ci))}
										>✕</button
									>
								</div>
							{/each}
							<button
								type="button"
								class="add-row-btn"
								onclick={() => {
									const c = createDefaultComponent();
									c.substance = null;
									dia.components.push(c);
								}}>+ Add Component</button
							>

							<label class="finish-creation">
								<input type="checkbox" bind:checked={dia.requiresForge} />
								<span>Requires a forge.</span>
							</label>
							<label class="finish-creation">
								<input type="checkbox" bind:checked={dia.writtenCopy} />
								<span>Written copy — +2 when crafting from it.</span>
							</label>
						{/snippet}
					</AccordionRow>
				{/each}
				<button type="button" class="add-row-btn" onclick={addDiagram}>+ Add Diagram</button>
			{/snippet}
		</SheetSection>
	</div>
</div>
