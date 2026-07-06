<script lang="ts">
	import type { MythrasCharacter, FatigueLevel } from '$lib/services/api';
	import Panel from '$lib/components/Panel.svelte';

	let { draft }: { draft: MythrasCharacter } = $props();

	const FATIGUE_STEPS: FatigueLevel[] = [
		'Fresh',
		'Winded',
		'Tired',
		'Wearied',
		'Exhausted',
		'Debilitated',
		'Incapacitated',
		'Semi-Conscious',
		'Comatose',
		'Dead'
	];

	function totalEquipmentEnc(): number {
		return draft.equipment.reduce((sum, e) => sum + (e.encumbrance ?? 0) * (e.quantity ?? 1), 0);
	}
	function totalArmorEnc(): number {
		return draft.hitLocations.reduce((sum, l) => sum + (l.armorWorn ? l.armorPoints : 0), 0);
	}
	function totalEnc(): number {
		return Math.round(totalArmorEnc() / 2 + totalEquipmentEnc());
	}

	function listToText(list: string[]): string {
		return (list ?? []).join(', ');
	}
	function textToList(text: string): string[] {
		return text
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
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
	function addCult() {
		draft.cults.push({ name: '', rank: '', benefits: '', restrictions: '', gifts: '', devotionalPoolCurrent: 0, devotionalPoolMax: 0 });
	}
	function removeCult(index: number) {
		draft.cults = draft.cults.filter((_, i) => i !== index);
	}
</script>

<div class="panel-grid">
	<Panel header="Hit Locations" color="primary">
		{#each draft.hitLocations as loc}
			<div class="hitloc-row">
				<span class="hitloc-roll">{loc.d20Range}</span>
				<span class="hitloc-name">{loc.name}</span>
				<div class="hitloc-hp">
					<input class="input-demo input-num" type="number" bind:value={loc.currentHp} />
					/ {loc.maxHp}
				</div>
				<div>
					<input class="input-demo input-num" type="number" bind:value={loc.armorPoints} placeholder="AP" />
				</div>
			</div>
			<div class="field-group" style="margin-bottom:6px;">
				<input class="input-demo" bind:value={loc.armorWorn} placeholder="Armor worn on this location" />
			</div>
		{/each}
		<div class="field-group" style="margin-top:8px;">
			<div class="field-hdr">Wounds</div>
			<input class="input-demo" bind:value={draft.woundNotes} placeholder="Wound notes" />
		</div>
		<div class="list-view-row" style="margin-top:8px;">
			<span class="list-view-name">Total Armor Points Worn</span>
			<span class="list-view-value">{totalArmorEnc()}</span>
		</div>
	</Panel>

	<Panel header="Fatigue" color="gold">
		<div class="fatigue-ladder">
			{#each FATIGUE_STEPS as step}
				<button
					class="fatigue-step"
					class:active={draft.fatigueLevel === step}
					onclick={() => (draft.fatigueLevel = step)}
				>
					{step}
				</button>
			{/each}
		</div>
	</Panel>
</div>

<Panel header="Equipment" color="plain">
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
	<div class="list-view-row" style="margin-top:8px;">
		<span class="list-view-name">Total ENC (worn armor counts half)</span>
		<span class="list-view-value">{totalEnc()}</span>
	</div>
	<div class="list-view-row">
		<span class="list-view-name">Burdened (STR&times;2)</span>
		<span class="list-view-value">{draft.characteristics.str * 2}</span>
	</div>
	<div class="list-view-row">
		<span class="list-view-name">Overloaded (STR&times;3)</span>
		<span class="list-view-value">{draft.characteristics.str * 3}</span>
	</div>
</Panel>

<Panel header="Combat Styles" color="plain">
	{#each draft.combatStyles as style, i}
		<div class="list-row">
			<div class="list-row-fields" style="grid-template-columns: 1fr 1fr 60px;">
				<input class="input-demo" bind:value={style.name} placeholder="Style name" />
				<input class="input-demo" bind:value={style.weapons} placeholder="Weapons used" />
				<input class="input-demo input-num" type="number" bind:value={style.total} />
			</div>
			<button class="remove-row-btn" onclick={() => removeCombatStyle(i)}>&#10005;</button>
		</div>
	{:else}
		<div class="empty-hint">No combat styles yet.</div>
	{/each}
	<button class="add-row-btn" onclick={addCombatStyle}>+ Add Combat Style</button>
</Panel>

<Panel header="Melee Weapons &amp; Shields" color="plain">
	{#each draft.meleeWeapons as weapon, i}
		<div class="list-row">
			<div class="list-row-fields" style="grid-template-columns: 1.5fr 1fr 60px 60px 1fr auto;">
				<input class="input-demo" bind:value={weapon.name} placeholder="Weapon" />
				<input class="input-demo" bind:value={weapon.damage} placeholder="Damage" />
				<input class="input-demo" bind:value={weapon.size} placeholder="Size" />
				<input class="input-demo" bind:value={weapon.reach} placeholder="Reach" />
				<input
					class="input-demo"
					value={listToText(weapon.traits)}
					oninput={(e) => (weapon.traits = textToList(e.currentTarget.value))}
					placeholder="Traits (comma separated)"
				/>
				<input class="input-demo input-num" type="number" bind:value={weapon.encumbrance} placeholder="ENC" />
			</div>
			<button class="remove-row-btn" onclick={() => removeMeleeWeapon(i)}>&#10005;</button>
		</div>
	{:else}
		<div class="empty-hint">No melee weapons yet.</div>
	{/each}
	<button class="add-row-btn" onclick={addMeleeWeapon}>+ Add Melee Weapon</button>
</Panel>

<Panel header="Ranged Weapons" color="plain">
	{#each draft.rangedWeapons as weapon, i}
		<div class="list-row">
			<div class="list-row-fields" style="grid-template-columns: 1.5fr 1fr 1fr 60px 60px;">
				<input class="input-demo" bind:value={weapon.name} placeholder="Weapon" />
				<input class="input-demo" bind:value={weapon.damage} placeholder="Damage" />
				<input class="input-demo" bind:value={weapon.force} placeholder="Force" />
				<input class="input-demo input-num" type="number" bind:value={weapon.load} placeholder="Load" />
				<input class="input-demo input-num" type="number" bind:value={weapon.encumbrance} placeholder="ENC" />
			</div>
			<button class="remove-row-btn" onclick={() => removeRangedWeapon(i)}>&#10005;</button>
		</div>
	{:else}
		<div class="empty-hint">No ranged weapons yet.</div>
	{/each}
	<button class="add-row-btn" onclick={addRangedWeapon}>+ Add Ranged Weapon</button>
</Panel>

<Panel header="Cults &amp; Devotion" color="teal">
	{#each draft.cults as cult, i}
		<div class="list-row">
			<div class="list-row-fields" style="grid-template-columns: 1fr 60px 60px;">
				<input class="input-demo" bind:value={cult.name} placeholder="Cult name" />
				<input class="input-demo input-num" type="number" bind:value={cult.devotionalPoolCurrent} placeholder="Cur." />
				<input class="input-demo input-num" type="number" bind:value={cult.devotionalPoolMax} placeholder="Max" />
			</div>
			<button class="remove-row-btn" onclick={() => removeCult(i)}>&#10005;</button>
		</div>
	{:else}
		<div class="empty-hint">No cult affiliations yet.</div>
	{/each}
	<button class="add-row-btn" onclick={addCult}>+ Add Cult</button>
</Panel>

<Panel header="Magic &amp; Abilities" color="teal">
	<textarea
		class="input-demo"
		style="min-height:100px;resize:vertical;"
		bind:value={draft.magicAbilitiesNotes}
		placeholder="Spells, spirits, talents, miracles..."
	></textarea>
</Panel>
