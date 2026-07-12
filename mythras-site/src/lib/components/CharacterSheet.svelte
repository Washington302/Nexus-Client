<script lang="ts">
	import type { MythrasCharacter } from '$lib/services/api';
	import Panel from '$lib/components/Panel.svelte';
	import EditableSectionCard from '$lib/components/EditableSectionCard.svelte';
	import ConditionBar from '$lib/components/ConditionBar.svelte';
	import SkillsPanel from '$lib/components/SkillsPanel.svelte';
	import IdentityPanel from '$lib/components/IdentityPanel.svelte';
	import CharacteristicsEditor from '$lib/components/CharacteristicsEditor.svelte';
	import AttributesEditor from '$lib/components/AttributesEditor.svelte';
	import CultsEditor from '$lib/components/CultsEditor.svelte';
	import { computeEncMax, computeEncPenalty, listToText, textToList } from '$lib/utils/character';
	import { focusOnMount } from '$lib/utils/actions';

	let { draft, editable = true }: { draft: MythrasCharacter; editable?: boolean } = $props();

	// Click-to-edit: which resource pool's "current" value is currently showing as an input.
	let editingCurrentPool = $state<'actionPoints' | 'luckPoints' | 'magicPoints' | null>(null);

	// Edit modals bind their inputs directly to `draft`, so changes apply as you type.
	// Snapshot on open / restore on cancel is what makes the Cancel button actually cancel.
	let editSnapshot: string | null = null;
	function beginEdit() {
		editSnapshot = JSON.stringify(draft);
	}
	function cancelEdit() {
		if (editSnapshot) Object.assign(draft, JSON.parse(editSnapshot));
		editSnapshot = null;
	}

	function totalEquipmentEnc(): number {
		return draft.equipment.reduce((sum, e) => sum + (e.encumbrance ?? 0) * (e.quantity ?? 1), 0);
	}
	function totalArmorEnc(): number {
		return draft.hitLocations.reduce((sum, l) => sum + (l.armorWorn ? l.armorPoints : 0), 0);
	}
	function totalEnc(): number {
		return Math.round(totalArmorEnc() / 2 + totalEquipmentEnc());
	}

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
	function addEquipment() {
		draft.equipment.push({ name: '', quantity: 1, encumbrance: 0 });
	}
	function removeEquipment(index: number) {
		draft.equipment = draft.equipment.filter((_, i) => i !== index);
	}
	function addCombatStyle() {
		draft.combatStyles.push({ name: '', base: 0, cultural: 0, career: 0, bonus: 0, total: 0, weapons: '' });
	}
	function removeCombatStyle(index: number) {
		draft.combatStyles = draft.combatStyles.filter((_, i) => i !== index);
	}
	function addMeleeWeapon() {
		draft.meleeWeapons.push({
			name: '',
			damage: '',
			size: '',
			reach: '',
			traits: [],
			combatEffects: [],
			armorPoints: 0,
			hitPoints: 0,
			encumbrance: 0
		});
	}
	function removeMeleeWeapon(index: number) {
		draft.meleeWeapons = draft.meleeWeapons.filter((_, i) => i !== index);
	}
	function addRangedWeapon() {
		draft.rangedWeapons.push({
			name: '',
			damage: '',
			force: '',
			damageModifierApplies: false,
			shortRange: 0,
			mediumRange: 0,
			longRange: 0,
			load: 0,
			combatEffects: [],
			armorPoints: 0,
			hitPoints: 0,
			encumbrance: 0
		});
	}
	function removeRangedWeapon(index: number) {
		draft.rangedWeapons = draft.rangedWeapons.filter((_, i) => i !== index);
	}
</script>

{#snippet identityView()}
	{#if draft.portraitUrl}
		<div class="field-group">
			<img
				src={draft.portraitUrl}
				alt="Portrait"
				style="width:80px;height:80px;object-fit:cover;border-radius:var(--radius-sm);"
			/>
		</div>
	{/if}
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
	<div class="grid-2">
		<div class="field-group">
			<div class="field-hdr">Player Name</div>
			<div>{draft.player || '—'}</div>
		</div>
		<div class="field-group">
			<div class="field-hdr">Homeland</div>
			<div>{draft.homeland || '—'}</div>
		</div>
	</div>
	<div class="grid-2">
		<div class="field-group">
			<div class="field-hdr">Gender</div>
			<div>{draft.gender || '—'}</div>
		</div>
		<div class="field-group">
			<div class="field-hdr">Age</div>
			<div>{draft.age || '—'}</div>
		</div>
	</div>
	<div class="grid-2">
		<div class="field-group">
			<div class="field-hdr">Height</div>
			<div>{draft.height || '—'}</div>
		</div>
		<div class="field-group">
			<div class="field-hdr">Weight</div>
			<div>{draft.weight || '—'}</div>
		</div>
	</div>
	<div class="grid-2">
		<div class="field-group">
			<div class="field-hdr">Handedness</div>
			<div>{draft.handedness || '—'}</div>
		</div>
		<div class="field-group">
			<div class="field-hdr">Social Class</div>
			<div>{draft.socialClass || '—'}</div>
		</div>
	</div>
	{#if draft.frame}
		<div class="field-group">
			<div class="field-hdr">Frame</div>
			<div>{draft.frame}</div>
		</div>
	{/if}
	{#if draft.description}
		<div class="field-group">
			<div class="field-hdr">Description</div>
			<div>{draft.description}</div>
		</div>
	{/if}
	{#if draft.backgroundNotes}
		<div class="field-group">
			<div class="field-hdr">Background</div>
			<div style="white-space:pre-wrap;">{draft.backgroundNotes}</div>
		</div>
	{/if}
	<div class="field-group">
		<div class="field-hdr">Sharing</div>
		<div>{draft.public ? 'Public' : 'Private'}</div>
	</div>
{/snippet}

{#snippet characteristicsView()}
	<div class="char-list">
		<div class="char-row"><span class="char-row-label">STR</span><span class="char-row-value">{draft.characteristics.str}</span></div>
		<div class="char-row"><span class="char-row-label">CON</span><span class="char-row-value">{draft.characteristics.con}</span></div>
		<div class="char-row"><span class="char-row-label">SIZ</span><span class="char-row-value">{draft.characteristics.siz}</span></div>
		<div class="char-row"><span class="char-row-label">DEX</span><span class="char-row-value">{draft.characteristics.dex}</span></div>
		<div class="char-row"><span class="char-row-label">INT</span><span class="char-row-value">{draft.characteristics.intelligence}</span></div>
		<div class="char-row"><span class="char-row-label">POW</span><span class="char-row-value">{draft.characteristics.pow}</span></div>
		<div class="char-row"><span class="char-row-label">CHA</span><span class="char-row-value">{draft.characteristics.cha}</span></div>
	</div>
{/snippet}

{#snippet attributesView()}
	<div class="char-list">
		<div class="char-row">
			<span class="char-row-label">Action Points</span>
			<span class="char-row-value">
				{#if editable && editingCurrentPool === 'actionPoints'}
					<input
						class="input-demo input-num char-row-current"
						type="number"
						bind:value={draft.attributes.actionPoints.current}
						onblur={() => (editingCurrentPool = null)}
						use:focusOnMount
					/>
				{:else if editable}
					<button class="char-row-current-btn" onclick={() => (editingCurrentPool = 'actionPoints')}
						>{draft.attributes.actionPoints.current}</button
					>
				{:else}
					{draft.attributes.actionPoints.current}
				{/if}
				/ {draft.attributes.actionPoints.max}
			</span>
		</div>
		<div class="char-row">
			<span class="char-row-label">Luck Points</span>
			<span class="char-row-value">
				{#if editable && editingCurrentPool === 'luckPoints'}
					<input
						class="input-demo input-num char-row-current"
						type="number"
						bind:value={draft.attributes.luckPoints.current}
						onblur={() => (editingCurrentPool = null)}
						use:focusOnMount
					/>
				{:else if editable}
					<button class="char-row-current-btn" onclick={() => (editingCurrentPool = 'luckPoints')}
						>{draft.attributes.luckPoints.current}</button
					>
				{:else}
					{draft.attributes.luckPoints.current}
				{/if}
				/ {draft.attributes.luckPoints.max}
			</span>
		</div>
		<div class="char-row">
			<span class="char-row-label">Magic Points</span>
			<span class="char-row-value">
				{#if editable && editingCurrentPool === 'magicPoints'}
					<input
						class="input-demo input-num char-row-current"
						type="number"
						bind:value={draft.attributes.magicPoints.current}
						onblur={() => (editingCurrentPool = null)}
						use:focusOnMount
					/>
				{:else if editable}
					<button class="char-row-current-btn" onclick={() => (editingCurrentPool = 'magicPoints')}
						>{draft.attributes.magicPoints.current}</button
					>
				{:else}
					{draft.attributes.magicPoints.current}
				{/if}
				/ {draft.attributes.magicPoints.max}
			</span>
		</div>
		<div class="char-row"><span class="char-row-label">Damage Mod</span><span class="char-row-value">{draft.attributes.damageModifier}</span></div>
		<div class="char-row"><span class="char-row-label">Healing Rate</span><span class="char-row-value">{draft.attributes.healingRate}</span></div>
		<div class="char-row"><span class="char-row-label">Strike Rank</span><span class="char-row-value">{draft.attributes.initiativeBonus}</span></div>
		<div class="char-row">
			<span class="char-row-label">Exp. Mod</span>
			<span class="char-row-value">{draft.attributes.experienceModifier >= 0 ? '+' + draft.attributes.experienceModifier : draft.attributes.experienceModifier}</span>
		</div>
		<div class="char-row"><span class="char-row-label">Movement</span><span class="char-row-value">{draft.attributes.movementRate}m</span></div>
		<div class="char-row"><span class="char-row-label">Exp. Rolls</span><span class="char-row-value">{draft.experienceRolls}</span></div>
	</div>
{/snippet}

<ConditionBar {draft} {editable} />

<div class="front-top-grid">
	{#if editable}
		<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Identity" color="primary">
			{#snippet view()}{@render identityView()}{/snippet}
			{#snippet edit()}<IdentityPanel {draft} />{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Identity" color="primary">{@render identityView()}</Panel>
	{/if}

	{#if editable}
		<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Characteristics" color="primary">
			{#snippet view()}{@render characteristicsView()}{/snippet}
			{#snippet edit()}<CharacteristicsEditor characteristics={draft.characteristics} />{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Characteristics" color="primary">{@render characteristicsView()}</Panel>
	{/if}

	{#if editable}
		<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Attributes" color="gold">
			{#snippet view()}{@render attributesView()}{/snippet}
			{#snippet edit()}<AttributesEditor attributes={draft.attributes} characteristics={draft.characteristics} {draft} />{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Attributes" color="gold">{@render attributesView()}</Panel>
	{/if}
</div>

<div class="front-top-grid">
	{#if editable}
		<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Languages" color="plain">
			{#snippet view()}
				<div class="list-scroll-4">
					{#each draft.languages as lang}
						<div class="list-view-row">
							<span class="list-view-name">{lang.name}{lang.nativeLanguage ? ' (Native)' : ''}</span>
							<span class="list-view-value">{lang.percentage}%</span>
						</div>
					{:else}
						<div class="empty-hint">No languages yet.</div>
					{/each}
				</div>
			{/snippet}
			{#snippet edit()}
				<div class="list-scroll-4">
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
				</div>
				<button class="add-row-btn" onclick={addLanguage}>+ Add Language</button>
			{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Languages" color="plain">
			<div class="list-scroll-4">
				{#each draft.languages as lang}
					<div class="list-view-row">
						<span class="list-view-name">{lang.name}{lang.nativeLanguage ? ' (Native)' : ''}</span>
						<span class="list-view-value">{lang.percentage}%</span>
					</div>
				{:else}
					<div class="empty-hint">No languages yet.</div>
				{/each}
			</div>
		</Panel>
	{/if}

	{#if editable}
		<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Passions" color="plain">
			{#snippet view()}
				<div class="list-scroll-4">
					{#each draft.passions as passion}
						<div class="list-view-row">
							<span class="list-view-name">{passion.name}</span>
							<span class="list-view-value">{passion.total}%</span>
						</div>
					{:else}
						<div class="empty-hint">No passions yet.</div>
					{/each}
				</div>
			{/snippet}
			{#snippet edit()}
				<div class="list-scroll-4">
					{#each draft.passions as passion, i}
						<div class="list-row">
							<div class="list-row-fields" style="grid-template-columns: 1fr 50px 50px 50px 50px 44px;">
								<input class="input-demo" bind:value={passion.name} placeholder="Passion" />
								<input class="input-demo input-num" type="number" bind:value={passion.base} placeholder="Base" />
								<input class="input-demo input-num" type="number" bind:value={passion.cultural} placeholder="Cult." />
								<input class="input-demo input-num" type="number" bind:value={passion.career} placeholder="Career" />
								<input class="input-demo input-num" type="number" bind:value={passion.bonus} placeholder="Exp." />
								<span class="skill-edit-total">{passion.total}%</span>
							</div>
							<button class="remove-row-btn" onclick={() => removePassion(i)}>&#10005;</button>
						</div>
					{:else}
						<div class="empty-hint">No passions yet.</div>
					{/each}
				</div>
				<button class="add-row-btn" onclick={addPassion}>+ Add Passion</button>
			{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Passions" color="plain">
			<div class="list-scroll-4">
				{#each draft.passions as passion}
					<div class="list-view-row">
						<span class="list-view-name">{passion.name}</span>
						<span class="list-view-value">{passion.total}%</span>
					</div>
				{:else}
					<div class="empty-hint">No passions yet.</div>
				{/each}
			</div>
		</Panel>
	{/if}

	{#if editable}
		<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Cults &amp; Devotion" color="teal">
			{#snippet view()}
				<div class="list-scroll-4">
					{#each draft.cults as cult}
						<div class="list-view-row">
							<span class="list-view-name"
								>{cult.name}{cult.rank ? ` (${cult.rank})` : ''}
								<span style="opacity:0.6;">— {cult.gifts.filter((g) => g.active).length} active gift(s)</span
								></span
							>
							<span class="list-view-value">{cult.devotionalPoolCurrent} / {cult.devotionalPoolMax}</span>
						</div>
					{:else}
						<div class="empty-hint">No cult affiliations yet.</div>
					{/each}
				</div>
			{/snippet}
			{#snippet edit()}
				<CultsEditor {draft} />
			{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Cults &amp; Devotion" color="teal">
			<div class="list-scroll-4">
				{#each draft.cults as cult}
					<div class="list-view-row">
						<span class="list-view-name"
							>{cult.name}{cult.rank ? ` (${cult.rank})` : ''}
							<span style="opacity:0.6;">— {cult.gifts.filter((g) => g.active).length} active gift(s)</span
							></span
						>
						<span class="list-view-value">{cult.devotionalPoolCurrent} / {cult.devotionalPoolMax}</span>
					</div>
				{:else}
					<div class="empty-hint">No cult affiliations yet.</div>
				{/each}
			</div>
		</Panel>
	{/if}
</div>

<div class="gear-split">
	<div class="gear-col">
		<SkillsPanel {draft} {editable} onOpen={beginEdit} onCancel={cancelEdit} />

		{#if editable}
			<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Magic &amp; Abilities" color="teal">
				{#snippet view()}
					<p style="font-family:var(--font-body);font-size:13px;color:var(--on-surface);white-space:pre-wrap;">
						{draft.magicAbilitiesNotes || '—'}
					</p>
				{/snippet}
				{#snippet edit()}
					<textarea
						class="input-demo"
						style="min-height:100px;resize:vertical;"
						bind:value={draft.magicAbilitiesNotes}
						placeholder="Spells, spirits, talents, miracles..."
					></textarea>
				{/snippet}
			</EditableSectionCard>
		{:else}
			<Panel header="Magic &amp; Abilities" color="teal">
				<p style="font-family:var(--font-body);font-size:13px;color:var(--on-surface);white-space:pre-wrap;">
					{draft.magicAbilitiesNotes || '—'}
				</p>
			</Panel>
		{/if}
	</div>

	<div class="gear-col">
		{#if editable}
			<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Equipment" color="plain">
				{#snippet view()}
					{#each draft.equipment as item}
						<div class="list-view-row">
							<span class="list-view-name">{item.name} &times;{item.quantity}</span>
							<span class="list-view-value">{item.encumbrance} ENC</span>
						</div>
					{:else}
						<div class="empty-hint">No equipment yet.</div>
					{/each}
					<div class="list-view-row" style="margin-top:8px;">
						<span class="list-view-name">Total ENC / Max (STR+CON)</span>
						<span class="list-view-value">{totalEnc()} / {computeEncMax(draft.characteristics.str, draft.characteristics.con)}</span>
					</div>
					{#if computeEncPenalty(totalEnc(), computeEncMax(draft.characteristics.str, draft.characteristics.con)) > 0}
						<div class="list-view-row">
							<span class="list-view-name">Penalty (&minus;20% per point over)</span>
							<span class="list-view-value">
								&minus;{computeEncPenalty(totalEnc(), computeEncMax(draft.characteristics.str, draft.characteristics.con)) * 20}%
							</span>
						</div>
					{/if}
				{/snippet}
				{#snippet edit()}
					{#each draft.equipment as item, i}
						<div class="list-row">
							<div class="list-row-fields" style="grid-template-columns: 1fr 50px 60px;">
								<input class="input-demo" bind:value={item.name} placeholder="Item" />
								<input class="input-demo input-num" type="number" bind:value={item.quantity} placeholder="Qty" />
								<input class="input-demo input-num" type="number" bind:value={item.encumbrance} placeholder="ENC" />
							</div>
							<button class="remove-row-btn" onclick={() => removeEquipment(i)}>&#10005;</button>
						</div>
					{:else}
						<div class="empty-hint">No equipment yet.</div>
					{/each}
					<button class="add-row-btn" onclick={addEquipment}>+ Add Equipment</button>
				{/snippet}
			</EditableSectionCard>
		{:else}
			<Panel header="Equipment" color="plain">
				{#each draft.equipment as item}
					<div class="list-view-row">
						<span class="list-view-name">{item.name} &times;{item.quantity}</span>
						<span class="list-view-value">{item.encumbrance} ENC</span>
					</div>
				{:else}
					<div class="empty-hint">No equipment yet.</div>
				{/each}
				<div class="list-view-row" style="margin-top:8px;">
					<span class="list-view-name">Total ENC / Max (STR+CON)</span>
					<span class="list-view-value">{totalEnc()} / {computeEncMax(draft.characteristics.str, draft.characteristics.con)}</span>
				</div>
			</Panel>
		{/if}

		{#if editable}
			<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Wealth" color="plain">
				{#snippet view()}
					<div class="char-list">
						<div class="char-row"><span class="char-row-label">Silver Pieces</span><span class="char-row-value">{draft.wealth.silverPieces}</span></div>
						<div class="char-row"><span class="char-row-label">Income / Day</span><span class="char-row-value">{draft.wealth.incomePerDay}</span></div>
						<div class="char-row"><span class="char-row-label">Income / Week</span><span class="char-row-value">{draft.wealth.incomePerWeek}</span></div>
						<div class="char-row"><span class="char-row-label">Income / Season</span><span class="char-row-value">{draft.wealth.incomePerSeason}</span></div>
						<div class="char-row"><span class="char-row-label">Income / Year</span><span class="char-row-value">{draft.wealth.incomePerYear}</span></div>
					</div>
				{/snippet}
				{#snippet edit()}
					<div class="field-group">
						<div class="field-hdr">Silver Pieces</div>
						<input class="input-demo input-num" type="number" bind:value={draft.wealth.silverPieces} />
					</div>
					<div class="grid-2">
						<div class="field-group">
							<div class="field-hdr">Income / Day</div>
							<input class="input-demo input-num" type="number" bind:value={draft.wealth.incomePerDay} />
						</div>
						<div class="field-group">
							<div class="field-hdr">Income / Week</div>
							<input class="input-demo input-num" type="number" bind:value={draft.wealth.incomePerWeek} />
						</div>
					</div>
					<div class="grid-2">
						<div class="field-group">
							<div class="field-hdr">Income / Season</div>
							<input class="input-demo input-num" type="number" bind:value={draft.wealth.incomePerSeason} />
						</div>
						<div class="field-group">
							<div class="field-hdr">Income / Year</div>
							<input class="input-demo input-num" type="number" bind:value={draft.wealth.incomePerYear} />
						</div>
					</div>
				{/snippet}
			</EditableSectionCard>
		{:else}
			<Panel header="Wealth" color="plain">
				<div class="char-list">
					<div class="char-row"><span class="char-row-label">Silver Pieces</span><span class="char-row-value">{draft.wealth.silverPieces}</span></div>
					<div class="char-row"><span class="char-row-label">Income / Day</span><span class="char-row-value">{draft.wealth.incomePerDay}</span></div>
					<div class="char-row"><span class="char-row-label">Income / Week</span><span class="char-row-value">{draft.wealth.incomePerWeek}</span></div>
					<div class="char-row"><span class="char-row-label">Income / Season</span><span class="char-row-value">{draft.wealth.incomePerSeason}</span></div>
					<div class="char-row"><span class="char-row-label">Income / Year</span><span class="char-row-value">{draft.wealth.incomePerYear}</span></div>
				</div>
			</Panel>
		{/if}

		{#if editable}
			<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Combat Styles" color="plain">
				{#snippet view()}
					{#each draft.combatStyles as style}
						<div class="list-view-row">
							<span class="list-view-name">{style.name} <span style="opacity:0.6;">({style.weapons})</span></span>
							<span class="list-view-value">{style.total}%</span>
						</div>
					{:else}
						<div class="empty-hint">No combat styles yet.</div>
					{/each}
				{/snippet}
				{#snippet edit()}
					{#each draft.combatStyles as style, i}
						<div class="nested-card">
							<div class="list-row">
								<div class="list-row-fields" style="grid-template-columns: 1fr 1fr;">
									<input class="input-demo" bind:value={style.name} placeholder="Style name" />
									<input class="input-demo" bind:value={style.weapons} placeholder="Weapons used" />
								</div>
								<button class="remove-row-btn" onclick={() => removeCombatStyle(i)}>&#10005;</button>
							</div>
							<div class="list-row-fields" style="grid-template-columns: 50px 50px 50px 50px 44px;">
								<input class="input-demo input-num" type="number" bind:value={style.base} placeholder="Base" />
								<input class="input-demo input-num" type="number" bind:value={style.cultural} placeholder="Cult." />
								<input class="input-demo input-num" type="number" bind:value={style.career} placeholder="Career" />
								<input class="input-demo input-num" type="number" bind:value={style.bonus} placeholder="Exp." />
								<span class="skill-edit-total">{style.total}%</span>
							</div>
						</div>
					{:else}
						<div class="empty-hint">No combat styles yet.</div>
					{/each}
					<button class="add-row-btn" onclick={addCombatStyle}>+ Add Combat Style</button>
				{/snippet}
			</EditableSectionCard>
		{:else}
			<Panel header="Combat Styles" color="plain">
				{#each draft.combatStyles as style}
					<div class="list-view-row">
						<span class="list-view-name">{style.name} <span style="opacity:0.6;">({style.weapons})</span></span>
						<span class="list-view-value">{style.total}%</span>
					</div>
				{:else}
					<div class="empty-hint">No combat styles yet.</div>
				{/each}
			</Panel>
		{/if}

		{#if editable}
			<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Melee Weapons &amp; Shields" color="plain">
				{#snippet view()}
					{#each draft.meleeWeapons as weapon}
						<div class="list-view-row">
							<span class="list-view-name"
								>{weapon.name} <span style="opacity:0.6;">({weapon.size}, {weapon.reach}, AP {weapon.armorPoints}, HP {weapon.hitPoints})</span
								></span
							>
							<span class="list-view-value">{weapon.damage}</span>
						</div>
					{:else}
						<div class="empty-hint">No melee weapons yet.</div>
					{/each}
				{/snippet}
				{#snippet edit()}
					{#each draft.meleeWeapons as weapon, i}
						<div class="nested-card">
							<div class="list-row">
								<div class="list-row-fields" style="grid-template-columns: 1.5fr 1fr 60px 60px;">
									<input class="input-demo" bind:value={weapon.name} placeholder="Weapon" />
									<input class="input-demo" bind:value={weapon.damage} placeholder="Damage" />
									<input class="input-demo" bind:value={weapon.size} placeholder="Size" />
									<input class="input-demo" bind:value={weapon.reach} placeholder="Reach" />
								</div>
								<button class="remove-row-btn" onclick={() => removeMeleeWeapon(i)}>&#10005;</button>
							</div>
							<div class="list-row">
								<div class="list-row-fields" style="grid-template-columns: 60px 60px 60px;">
									<input class="input-demo input-num" type="number" bind:value={weapon.armorPoints} placeholder="AP" />
									<input class="input-demo input-num" type="number" bind:value={weapon.hitPoints} placeholder="HP" />
									<input class="input-demo input-num" type="number" bind:value={weapon.encumbrance} placeholder="ENC" />
								</div>
							</div>
							<input
								class="input-demo"
								value={listToText(weapon.traits)}
								oninput={(e) => (weapon.traits = textToList(e.currentTarget.value))}
								placeholder="Traits (comma separated)"
							/>
							<input
								class="input-demo"
								style="margin-top:6px;"
								value={listToText(weapon.combatEffects)}
								oninput={(e) => (weapon.combatEffects = textToList(e.currentTarget.value))}
								placeholder="Combat effects (comma separated)"
							/>
						</div>
					{:else}
						<div class="empty-hint">No melee weapons yet.</div>
					{/each}
					<button class="add-row-btn" onclick={addMeleeWeapon}>+ Add Melee Weapon</button>
				{/snippet}
			</EditableSectionCard>
		{:else}
			<Panel header="Melee Weapons &amp; Shields" color="plain">
				{#each draft.meleeWeapons as weapon}
					<div class="list-view-row">
						<span class="list-view-name"
							>{weapon.name} <span style="opacity:0.6;">({weapon.size}, {weapon.reach}, AP {weapon.armorPoints}, HP {weapon.hitPoints})</span
							></span
						>
						<span class="list-view-value">{weapon.damage}</span>
					</div>
				{:else}
					<div class="empty-hint">No melee weapons yet.</div>
				{/each}
			</Panel>
		{/if}

		{#if editable}
			<EditableSectionCard onOpen={beginEdit} onCancel={cancelEdit} title="Ranged Weapons" color="plain">
				{#snippet view()}
					{#each draft.rangedWeapons as weapon}
						<div class="list-view-row">
							<span class="list-view-name"
								>{weapon.name}
								<span style="opacity:0.6;">(S {weapon.shortRange}/M {weapon.mediumRange}/L {weapon.longRange})</span
								></span
							>
							<span class="list-view-value">{weapon.damage}</span>
						</div>
					{:else}
						<div class="empty-hint">No ranged weapons yet.</div>
					{/each}
				{/snippet}
				{#snippet edit()}
					{#each draft.rangedWeapons as weapon, i}
						<div class="nested-card">
							<div class="list-row">
								<div class="list-row-fields" style="grid-template-columns: 1.5fr 1fr 1fr;">
									<input class="input-demo" bind:value={weapon.name} placeholder="Weapon" />
									<input class="input-demo" bind:value={weapon.damage} placeholder="Damage" />
									<input class="input-demo" bind:value={weapon.force} placeholder="Force" />
								</div>
								<button class="remove-row-btn" onclick={() => removeRangedWeapon(i)}>&#10005;</button>
							</div>
							<div class="list-row">
								<div class="list-row-fields" style="grid-template-columns: 50px 50px 50px 50px 60px;">
									<input class="input-demo input-num" type="number" bind:value={weapon.shortRange} placeholder="S" />
									<input class="input-demo input-num" type="number" bind:value={weapon.mediumRange} placeholder="M" />
									<input class="input-demo input-num" type="number" bind:value={weapon.longRange} placeholder="L" />
									<input class="input-demo input-num" type="number" bind:value={weapon.load} placeholder="Load" />
									<input class="input-demo input-num" type="number" bind:value={weapon.encumbrance} placeholder="ENC" />
								</div>
							</div>
							<div class="list-row">
								<div class="list-row-fields" style="grid-template-columns: 60px 60px auto;">
									<input class="input-demo input-num" type="number" bind:value={weapon.armorPoints} placeholder="AP" />
									<input class="input-demo input-num" type="number" bind:value={weapon.hitPoints} placeholder="HP" />
									<label style="display:flex;align-items:center;gap:4px;font-size:12px;">
										<input type="checkbox" bind:checked={weapon.damageModifierApplies} /> Dmg Mod Applies
									</label>
								</div>
							</div>
							<input
								class="input-demo"
								value={listToText(weapon.combatEffects)}
								oninput={(e) => (weapon.combatEffects = textToList(e.currentTarget.value))}
								placeholder="Combat effects (comma separated)"
							/>
						</div>
					{:else}
						<div class="empty-hint">No ranged weapons yet.</div>
					{/each}
					<button class="add-row-btn" onclick={addRangedWeapon}>+ Add Ranged Weapon</button>
				{/snippet}
			</EditableSectionCard>
		{:else}
			<Panel header="Ranged Weapons" color="plain">
				{#each draft.rangedWeapons as weapon}
					<div class="list-view-row">
						<span class="list-view-name"
							>{weapon.name}
							<span style="opacity:0.6;">(S {weapon.shortRange}/M {weapon.mediumRange}/L {weapon.longRange})</span
							></span
						>
						<span class="list-view-value">{weapon.damage}</span>
					</div>
				{:else}
					<div class="empty-hint">No ranged weapons yet.</div>
				{/each}
			</Panel>
		{/if}
	</div>
</div>
