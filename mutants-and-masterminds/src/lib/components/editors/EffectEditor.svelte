<script lang="ts">
	import ModifierRow from './ModifierRow.svelte';
	import MinionEditor from './MinionEditor.svelte';

	let { effect, onRemove }: { effect: any; onRemove: () => void } = $props();

	function addModifier() {
		effect.modifiers.push({ name: '', type: 'EXTRA', costModifier: 1, isFlat: false });
	}

	function removeModifier(mi: number) {
		effect.modifiers.splice(mi, 1);
	}
</script>

<div class="effect-card">
	<div class="effect-row">
		<input type="text" class="effect-input" bind:value={effect.effectName} placeholder="Effect name" />
		<button class="combat-toggle" class:active={effect._showInCombat} onclick={() => effect._showInCombat = !effect._showInCombat} title="Show in combat">&#x2694;</button>
		<button class="combat-toggle" class:active={effect._isThrownWeapon} onclick={() => effect._isThrownWeapon = !effect._isThrownWeapon} title="Strength-based damage">&#x1F4AA;</button>
		<select class="resist-select"
			value={effect.resistance ?? ''}
			onchange={(e) => { const v = (e.target as HTMLSelectElement).value; effect.resistance = v || undefined; }}>
			<option value="">Resist (auto)</option>
			<option value="TOUGHNESS">Toughness</option>
			<option value="DODGE">Dodge</option>
			<option value="FORTITUDE">Fortitude</option>
			<option value="WILL">Will</option>
			<option value="WILL_FORTITUDE">Will / Fortitude</option>
			<option value="STRENGTH_DODGE">Strength / Dodge</option>
			<option value="PARRY">Parry</option>
			<option value="NONE">None</option>
		</select>
		<div class="effect-meta">
			<label class="sm-label">Rank</label>
			<input type="number" class="sm-input sm-input-sm" bind:value={effect.rank} />
			<label class="sm-label">PP/r</label>
			<input type="number" class="sm-input sm-input-sm" bind:value={effect.baseCostPerRank} />
		</div>
		<button class="remove-btn sm" onclick={onRemove}>&#10005;</button>
	</div>
	<div class="modifiers-section">
		<div class="mods-head">Modifiers</div>
		{#each effect.modifiers as mod, mi}
			<ModifierRow modifier={mod} onRemove={() => removeModifier(mi)} />
		{/each}
		<button class="add-mod-btn" onclick={addModifier}>+ Modifier</button>
	</div>
	{#if effect.effectName?.toLowerCase() === 'summon' || effect.isSummon}
		<label class="summon-toggle">
			<input type="checkbox" bind:checked={effect.isSummon} />
			<span class="sm-label">Summon</span>
		</label>
		{#if effect.isSummon}
			{@const summonRank = effect.rank}
			{@const ppBudget = summonRank * 15}
			<div class="summon-section">
				<div class="summon-head">Minion &middot; PL {summonRank} &middot; {ppBudget} PP</div>
				{#if effect.summonExtension}
					{@const se = effect.summonExtension}
					<input type="text" class="summon-name-input"
						value={se.minionStatBlock?.name ?? ''}
						oninput={(e) => { const v = (e.target as HTMLInputElement).value; if (se.minionStatBlock) se.minionStatBlock.name = v; }}
						placeholder="Minion name" />
					<button class="edit-minion-btn" onclick={() => { (se as any)._expanded = !(se as any)._expanded; }} type="button">{(se as any)._expanded ? 'Collapse Minion' : 'Edit Minion'}</button>
					{#if (se as any)._expanded && se.minionStatBlock}
						<div class="minion-expanded"><MinionEditor minion={se.minionStatBlock} /></div>
					{/if}
				{/if}
			</div>
		{/if}
	{/if}
</div>

