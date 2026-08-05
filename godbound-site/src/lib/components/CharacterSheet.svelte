<script lang="ts">
	import type { GodboundCharacter } from '$lib/services/api';
	import { attributeModifier, attributeCheck, createDefaultWeapon, createDefaultFact } from '$lib/utils/character';
	import { gameRules } from '$lib/stores/gameRules.svelte';

	// The whole sheet, for both the owner's editable view and the public share view.
	// `editable` is the only switch: when false every input becomes static text and
	// the edit pencils and their modals are never rendered.
	let { draft, editable = false }: { draft: GodboundCharacter; editable?: boolean } = $props();

	const attrKeys = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'] as const;
	const saveKeys = ['hardiness', 'evasion', 'spirit'] as const;

	function recalcAttribute(key: (typeof attrKeys)[number]) {
		const attr = draft.attributes[key];
		attr.mod = attributeModifier(attr.score);
		attr.check = attributeCheck(attr.score);
		recalcAllSavingThrows();
	}

	const SAVE_ATTR_PAIRS: Record<(typeof saveKeys)[number], [(typeof attrKeys)[number], (typeof attrKeys)[number]]> = {
		hardiness: ['strength', 'constitution'],
		evasion: ['dexterity', 'intelligence'],
		spirit: ['wisdom', 'charisma'],
	};

	function recalcSavingThrow(key: (typeof saveKeys)[number]) {
		if (!gameRules.autoCalculateSavingThrows) return;
		const [a, b] = SAVE_ATTR_PAIRS[key];
		const base = 15 - Math.max(draft.attributes[a].mod, draft.attributes[b].mod);
		const penalty = draft.armor.savingThrowPenalties[key] ? 4 : 0;
		const st = draft.savingThrows[key];
		st.base = base;
		st.save = base + penalty - (st.mod ?? 0);
	}

	function recalcAllSavingThrows() {
		saveKeys.forEach(recalcSavingThrow);
	}

	// Only the owner's sheet recalculates — a share viewer renders the stored values as-is.
	$effect(() => {
		if (editable && gameRules.autoCalculateSavingThrows) recalcAllSavingThrows();
	});

	function addWeapon() {
		draft.weapons = [...draft.weapons, createDefaultWeapon()];
	}

	function removeWeapon(i: number) {
		draft.weapons = draft.weapons.filter((_, idx) => idx !== i);
	}

	let expandedGifts = $state<Set<string>>(new Set());

	function toggleExpanded(id: string) {
		const next = new Set(expandedGifts);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedGifts = next;
	}

	function toggleGiftActive(wordIndex: number, giftIndex: number) {
		const word = draft.words[wordIndex];
		const gift = word.gifts[giftIndex];
		gift.active = !gift.active;
		word.activeGifts = word.gifts.filter((g) => g.active).length;
	}

	let showWeaponsModal = $state(false);
	let showArmorModal = $state(false);
	let showFactsModal = $state(false);

	function addFact() {
		draft.additionalFacts = [...(draft.additionalFacts ?? []), createDefaultFact()];
	}

	function removeFact(i: number) {
		draft.additionalFacts = (draft.additionalFacts ?? []).filter((_, idx) => idx !== i);
	}

	const armorPenaltyList = $derived(
		[
			draft.armor.savingThrowPenalties.hardiness && 'Hardiness',
			draft.armor.savingThrowPenalties.evasion && 'Evasion',
			draft.armor.savingThrowPenalties.spirit && 'Spirit'
		].filter(Boolean).join(', ')
	);
</script>

<div class="folio-eyebrow">Godbound</div>
<div class="sheet-header">
	<div class="field-group" style="margin:0;">
		<label class="field-label" for="ch-name">Name</label>
		{#if editable}
			<input id="ch-name" type="text" bind:value={draft.name} class="folio-input" />
		{:else}
			<div class="folio-static">{draft.name || '—'}</div>
		{/if}
	</div>
	<div class="field-group" style="margin:0;">
		<label class="field-label" for="ch-desc">Description</label>
		{#if editable}
			<input id="ch-desc" type="text" bind:value={draft.description} class="folio-input" />
		{:else}
			<div class="folio-static">{draft.description || '—'}</div>
		{/if}
	</div>
	<div class="field-group" style="margin:0;">
		<label class="field-label" for="ch-goal">Goal</label>
		{#if editable}
			<input id="ch-goal" type="text" bind:value={draft.goal} class="folio-input" />
		{:else}
			<div class="folio-static">{draft.goal || '—'}</div>
		{/if}
	</div>
	<div class="field-group folio-field-num" style="margin:0;">
		<label class="field-label" for="ch-level">Level</label>
		{#if editable}
			<input id="ch-level" type="number" bind:value={draft.level} min="1" class="folio-input" />
		{:else}
			<div class="folio-static">{draft.level}</div>
		{/if}
	</div>
	<div class="field-group folio-field-num" style="margin:0;">
		<label class="field-label" for="ch-xp">Experience</label>
		{#if editable}
			<input id="ch-xp" type="number" bind:value={draft.experience} min="0" class="folio-input" />
		{:else}
			<div class="folio-static">{draft.experience}</div>
		{/if}
	</div>
</div>
<div class="ritual-divider"></div>

<div class="sheet-grid">
	<div class="sheet-col">
		<div class="gb-panel flat">
			<div class="gb-panel-header">Attributes</div>
			<div class="stat-table">
				<div class="stat-table-head"><span>Type</span><span>Score</span><span>Mod</span><span>Check</span></div>
				{#each attrKeys as key}
					<div class="stat-table-row">
						<span class="stat-table-label">{key}</span>
						{#if editable}
							<input type="number" class="stat-input" bind:value={draft.attributes[key].score} oninput={() => recalcAttribute(key)} />
							<input type="number" class="stat-input" bind:value={draft.attributes[key].mod} />
							<input type="number" class="stat-input" bind:value={draft.attributes[key].check} />
						{:else}
							<span>{draft.attributes[key].score}</span>
							<span>{draft.attributes[key].mod >= 0 ? '+' : ''}{draft.attributes[key].mod}</span>
							<span>{draft.attributes[key].check}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="gb-panel flat">
			<div class="gb-panel-header">Saving Throws</div>
			<div class="stat-table">
				<div class="stat-table-head"><span>Type</span><span>Base</span><span>Mod</span><span>Save</span></div>
				{#each saveKeys as key}
					<div class="stat-table-row">
						<span class="stat-table-label">{key}</span>
						{#if !editable}
							<span>{draft.savingThrows[key].base}</span>
							<span>{draft.savingThrows[key].mod}</span>
							<span>{draft.savingThrows[key].save}</span>
						{:else if gameRules.autoCalculateSavingThrows}
							<span>{draft.savingThrows[key].base}</span>
							<input type="number" class="stat-input" bind:value={draft.savingThrows[key].mod} oninput={() => recalcSavingThrow(key)} />
							<span>{draft.savingThrows[key].save}</span>
						{:else}
							<input type="number" class="stat-input" bind:value={draft.savingThrows[key].base} />
							<input type="number" class="stat-input" bind:value={draft.savingThrows[key].mod} />
							<input type="number" class="stat-input" bind:value={draft.savingThrows[key].save} />
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="gb-panel flat">
			<div class="hp-grid">
				{#if editable}
					<div class="hp-box">
						<div class="hp-box-label">Current HP</div>
						<input type="number" class="hp-box-input" bind:value={draft.hp.current} />
					</div>
					<div class="hp-box">
						<div class="hp-box-label">Max HP</div>
						<input type="number" class="hp-box-input" bind:value={draft.hp.max} />
					</div>
				{:else}
					<div class="hp-box">
						<div class="hp-box-label">HP</div>
						<div class="hp-box-input">{draft.hp.current} / {draft.hp.max}</div>
					</div>
					<div class="hp-box">
						<div class="hp-box-label">Level</div>
						<div class="hp-box-input">{draft.level}</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="sheet-col">
		<div class="gb-panel flat">
			<div class="gb-panel-header-row">
				<div class="gb-panel-header">Facts</div>
				{#if editable}
					<button class="panel-edit-btn" onclick={() => (showFactsModal = true)} aria-label="Edit Facts">✎</button>
				{/if}
			</div>
			<div class="readonly-table facts-card-body">
				<div class="facts-separator" style="margin-top:0; padding-top:0; border-top:none;">Origin</div>
				<div class="readonly-table-row" style="grid-template-columns: 1fr; border-top:none; padding-top:0;">
					<span>{draft.facts.origin || '—'}</span>
				</div>
				<div class="facts-separator">Past Career</div>
				<div class="readonly-table-row" style="grid-template-columns: 1fr; border-top:none; padding-top:0;">
					<span>{draft.facts.pastCareer || '—'}</span>
				</div>
				<div class="facts-separator">Relationship</div>
				<div class="readonly-table-row" style="grid-template-columns: 1fr; border-top:none; padding-top:0;">
					<span>{draft.facts.relationship || '—'}</span>
				</div>
				{#if draft.additionalFacts && draft.additionalFacts.length > 0}
					<div class="facts-separator">Additional Facts</div>
					{#each draft.additionalFacts as fact}
						<div class="readonly-table-row" style="grid-template-columns: 1fr;">
							<span>{fact.description || '—'}</span>
						</div>
					{/each}
				{/if}
				<div class="readonly-table-row" style="grid-template-columns: 1fr;">
					<span><span class="field-label" style="display:inline; margin:0;">Player:</span> {draft.player || '—'}</span>
				</div>
			</div>
		</div>

		<div class="gb-panel flat">
			<div class="gb-panel-header-row">
				<div class="gb-panel-header">Weapons</div>
				{#if editable}
					<button class="panel-edit-btn" onclick={() => (showWeaponsModal = true)} aria-label="Edit Weapons">✎</button>
				{/if}
			</div>
			{#if draft.weapons.length > 0}
				<div class="readonly-table">
					<div class="readonly-table-head" style="grid-template-columns: 2fr 1fr 1fr 1fr;">
						<span>Description</span><span>Attr</span><span>Atk</span><span>Dmg</span>
					</div>
					{#each draft.weapons as weapon}
						<div class="readonly-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr;">
							<span>{weapon.description || '—'}</span><span>{weapon.attr || '—'}</span><span>{weapon.atk || '—'}</span><span>{weapon.dmg || '—'}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="readonly-empty">No weapons yet.</p>
			{/if}
		</div>

		<div class="gb-panel flat">
			<div class="gb-panel-header-row">
				<div class="gb-panel-header">Armor</div>
				{#if editable}
					<button class="panel-edit-btn" onclick={() => (showArmorModal = true)} aria-label="Edit Armor">✎</button>
				{/if}
			</div>
			<div class="readonly-table">
				<div class="readonly-table-row" style="grid-template-columns: 2fr 1fr; border-top:none; padding-top:0;">
					<span>{draft.armor.type || '—'}</span><span>AC {draft.armor.armorClass}{draft.armor.shield ? ' (+1 Shield)' : ''}</span>
				</div>
				{#if armorPenaltyList}
					<div class="readonly-table-row" style="grid-template-columns: 1fr;">
						<span>Penalties: {armorPenaltyList}</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="gb-panel flat">
			<div class="gb-panel-header">Fray Die</div>
			<div class="fraydie-row">
				<div class="fraydie-die-box">
					{#if editable}
						<select bind:value={draft.frayDie} class="fraydie-select">
							{#each ['1d4', '1d6', '1d8', '1d10', '1d12'] as die}
								<option value={die}>{die}</option>
							{/each}
						</select>
					{:else}
						<div class="fraydie-select">{draft.frayDie}</div>
					{/if}
				</div>
				<div class="fraydie-table">
					{#each draft.frayDieTable as entry}
						<div class="fraydie-table-row">
							<span class="fraydie-roll">{entry.roll}</span>
							{#if editable}
								<input type="number" class="stat-input" bind:value={entry.dmg} />
							{:else}
								<span>{entry.dmg}</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="sheet-col">
		<div class="gb-panel flat">
			<div class="gb-panel-header">Resources</div>
			<div class="stat-table">
				<div class="stat-table-head"><span>Type</span><span>Total</span><span>Free</span><span></span></div>
				{#each ['effort', 'influence', 'dominion', 'wealth'] as const as key}
					<div class="stat-table-row">
						<span class="stat-table-label">{key}</span>
						{#if editable}
							<input type="number" class="stat-input" bind:value={draft.resources[key].total} />
							<input type="number" class="stat-input" bind:value={draft.resources[key].free} />
						{:else}
							<span>{draft.resources[key].total}</span>
							<span>{draft.resources[key].free}</span>
						{/if}
						<span></span>
					</div>
				{/each}
			</div>
			<div class="field-group" style="margin-top:10px; margin-bottom:0;">
				<label class="field-label" for="earned">Earned Per Month</label>
				{#if editable}
					<input id="earned" type="text" bind:value={draft.earnedPerMonth} class="gb-input" />
				{:else}
					<div class="folio-static">{draft.earnedPerMonth || '—'}</div>
				{/if}
			</div>
		</div>

		<div class="gb-panel flat">
			<div class="gb-panel-header" style="display:flex; align-items:center; justify-content:space-between;">
				<span>Words of Creation</span>
				<span style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted-foreground); font-weight:400;">Committed Effort</span>
			</div>
			<div class="word-list words-card-body">
				{#each draft.words as word, wi}
					<div class="word-list-item">
						<div class="word-list-row">
							<span class="word-list-name">{word.name}</span>
							<input
								type="checkbox"
								checked={word.gifts.some((g) => g.active && g.effort !== 'None')}
								disabled
							/>
						</div>
						{#each word.gifts as gift, gi}
							<div
								class="gift-list-row"
								role="button"
								tabindex="0"
								onclick={() => toggleExpanded(gift.id)}
								onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpanded(gift.id)}
							>
								<span>{gift.name}</span>
								<input
									type="checkbox"
									checked={gift.active}
									disabled={!editable}
									onclick={(e) => e.stopPropagation()}
									onchange={() => toggleGiftActive(wi, gi)}
								/>
							</div>
							{#if expandedGifts.has(gift.id)}
								<div class="gift-detail">
									<div class="gift-detail-meta">
										<span>{gift.tier}</span>
										<span>&bull;</span>
										<span>{gift.type}</span>
										<span>&bull;</span>
										<span>Effort: {gift.effort}</span>
									</div>
									{#if gift.description}
										<p class="gift-detail-desc">{gift.description}</p>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
			{#if draft.words.length === 0}
				<p style="font-size:13px; color:var(--muted-foreground);">
					{#if editable}
						No Words bound yet &mdash; add one on the <a href="/gifts" style="color:var(--gold-bright);">Gifts</a> page.
					{:else}
						No Words bound yet.
					{/if}
				</p>
			{/if}
		</div>
	</div>
</div>

{#if editable && showFactsModal}
	<div class="modal-overlay" onclick={() => (showFactsModal = false)} onkeydown={(e) => e.key === 'Escape' && (showFactsModal = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showFactsModal = false)}>
			<h2 class="modal-title">Edit Facts</h2>
			<div class="field-group">
				<label class="field-label" for="fact-origin">Origin</label>
				<textarea id="fact-origin" bind:value={draft.facts.origin} class="gb-textarea"></textarea>
			</div>
			<div class="field-group">
				<label class="field-label" for="fact-career">Past Career</label>
				<textarea id="fact-career" bind:value={draft.facts.pastCareer} class="gb-textarea"></textarea>
			</div>
			<div class="field-group" style="margin-bottom:0;">
				<label class="field-label" for="fact-rel">Relationship</label>
				<textarea id="fact-rel" bind:value={draft.facts.relationship} class="gb-textarea"></textarea>
			</div>
			{#each draft.additionalFacts ?? [] as fact, i}
				<div class="item-row" style="align-items:flex-start;">
					<textarea bind:value={fact.description} placeholder="New fact..." class="gb-textarea" style="flex:1;"></textarea>
					<button onclick={() => removeFact(i)} class="delete-btn">✕</button>
				</div>
			{/each}
			<button onclick={addFact} class="gb-btn secondary" style="margin-top:10px;">+ Add Fact</button>
			<div class="modal-actions">
				<button onclick={() => (showFactsModal = false)} class="gb-btn">Done</button>
			</div>
		</div>
	</div>
{/if}

{#if editable && showWeaponsModal}
	<div class="modal-overlay" onclick={() => (showWeaponsModal = false)} onkeydown={(e) => e.key === 'Escape' && (showWeaponsModal = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showWeaponsModal = false)}>
			<h2 class="modal-title">Edit Weapons</h2>
			{#each draft.weapons as weapon, i}
				<div class="item-row">
					<input type="text" bind:value={weapon.description} placeholder="Description" class="gb-input" style="flex:2;" />
					<input type="text" bind:value={weapon.attr} placeholder="Attr" class="gb-input" style="flex:1;" />
					<input type="text" bind:value={weapon.atk} placeholder="Atk" class="gb-input" style="flex:1;" />
					<input type="text" bind:value={weapon.dmg} placeholder="Dmg" class="gb-input" style="flex:1;" />
					<button onclick={() => removeWeapon(i)} class="delete-btn">✕</button>
				</div>
			{/each}
			<button onclick={addWeapon} class="gb-btn secondary" style="margin-top:10px;">+ Add Weapon</button>
			<div class="modal-actions">
				<button onclick={() => (showWeaponsModal = false)} class="gb-btn">Done</button>
			</div>
		</div>
	</div>
{/if}

{#if editable && showArmorModal}
	<div class="modal-overlay" onclick={() => (showArmorModal = false)} onkeydown={(e) => e.key === 'Escape' && (showArmorModal = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showArmorModal = false)}>
			<h2 class="modal-title">Edit Armor</h2>
			<div class="invite-row">
				<div class="field-group" style="margin:0; flex:2;">
					<label class="field-label" for="armor-type">Type</label>
					<input id="armor-type" type="text" bind:value={draft.armor.type} class="gb-input" />
				</div>
				<div class="field-group" style="margin:0; flex:1;">
					<label class="field-label" for="armor-ac">AC</label>
					<input id="armor-ac" type="number" bind:value={draft.armor.armorClass} class="gb-input" />
				</div>
			</div>
			<div class="checkbox-row">
				<label><input type="checkbox" bind:checked={draft.armor.shield} /> Shield +1</label>
			</div>
			<div class="checkbox-row">
				<span class="field-label" style="margin:0;">Saving Throw Penalties:</span>
				<label><input type="checkbox" bind:checked={draft.armor.savingThrowPenalties.hardiness} onchange={recalcAllSavingThrows} /> Hardiness</label>
				<label><input type="checkbox" bind:checked={draft.armor.savingThrowPenalties.evasion} onchange={recalcAllSavingThrows} /> Evasion</label>
				<label><input type="checkbox" bind:checked={draft.armor.savingThrowPenalties.spirit} onchange={recalcAllSavingThrows} /> Spirit</label>
			</div>
			<div class="modal-actions">
				<button onclick={() => (showArmorModal = false)} class="gb-btn">Done</button>
			</div>
		</div>
	</div>
{/if}
