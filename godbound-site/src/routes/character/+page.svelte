<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import { attributeModifier, attributeCheck, createDefaultWeapon } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';

	let draft = $state<GodboundCharacter | null>(null);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);

	$effect(() => {
		if (session.activeCharacter && !draft) {
			draft = JSON.parse(JSON.stringify(session.activeCharacter));
		}
	});

	const attrKeys = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'] as const;
	const saveKeys = ['hardiness', 'evasion', 'spirit'] as const;

	function recalcAttribute(key: (typeof attrKeys)[number]) {
		if (!draft) return;
		const attr = draft.attributes[key];
		attr.mod = attributeModifier(attr.score);
		attr.check = attributeCheck(attr.score);
	}

	function addWeapon() {
		if (!draft) return;
		draft.weapons = [...draft.weapons, createDefaultWeapon()];
	}

	function removeWeapon(i: number) {
		if (!draft) return;
		draft.weapons = draft.weapons.filter((_, idx) => idx !== i);
	}

	async function handleSave() {
		if (!draft) return;
		saving = true;
		saveError = null;
		saveSuccess = false;
		try {
			const updated = await api.character.update(draft.id, draft);
			draft = updated;
			session.activeCharacter = updated;
			const idx = session.characters.findIndex((c) => c.id === updated.id);
			if (idx >= 0) session.characters[idx] = updated;
			saveSuccess = true;
			setTimeout(() => (saveSuccess = false), 2000);
		} catch (e) {
			saveError = (e as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="page">
	{#if !session.userId}
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your character.</p></div>
	{:else if !draft}
		<div class="prompt-card">
			<p>No active character. <a href="/characters">Create or select one</a>.</p>
		</div>
	{:else}
		<SplashHeader title={draft.name} highlight="" subtitle={draft.goal || 'A Godbound of the Ascension'} />

		<SaveBar {saving} {saveError} {saveSuccess} onSave={handleSave} />

		<div class="sheet-header">
			<div class="field-group" style="margin:0;">
				<label class="field-label" for="ch-name">Name</label>
				<input id="ch-name" type="text" bind:value={draft.name} class="gb-input" />
			</div>
			<div class="field-group" style="margin:0;">
				<label class="field-label" for="ch-goal">Goal</label>
				<input id="ch-goal" type="text" bind:value={draft.goal} class="gb-input" />
			</div>
			<div class="field-group" style="margin:0;">
				<label class="field-label" for="ch-level">Level</label>
				<input id="ch-level" type="number" bind:value={draft.level} min="1" class="gb-input" />
			</div>
			<div class="field-group" style="margin:0;">
				<label class="field-label" for="ch-xp">Experience</label>
				<input id="ch-xp" type="number" bind:value={draft.experience} min="0" class="gb-input" />
			</div>
			<div class="field-group" style="margin:0;">
				<label class="field-label" for="ch-player">Player</label>
				<input id="ch-player" type="text" bind:value={draft.player} class="gb-input" />
			</div>
		</div>

		<div class="sheet-grid">
			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Attributes</div>
					<div class="stat-table">
						<div class="stat-table-head"><span>Type</span><span>Score</span><span>Mod</span><span>Check</span></div>
						{#each attrKeys as key}
							<div class="stat-table-row">
								<span class="stat-table-label">{key}</span>
								<input type="number" class="stat-input" bind:value={draft.attributes[key].score} oninput={() => recalcAttribute(key)} />
								<input type="number" class="stat-input" bind:value={draft.attributes[key].mod} />
								<input type="number" class="stat-input" bind:value={draft.attributes[key].check} />
							</div>
						{/each}
					</div>
				</div>

				<div class="gb-panel">
					<div class="gb-panel-header">Saving Throws</div>
					<div class="stat-table">
						<div class="stat-table-head"><span>Type</span><span>Base</span><span>Mod</span><span>Save</span></div>
						{#each saveKeys as key}
							<div class="stat-table-row">
								<span class="stat-table-label">{key}</span>
								<input type="number" class="stat-input" bind:value={draft.savingThrows[key].base} />
								<input type="number" class="stat-input" bind:value={draft.savingThrows[key].mod} />
								<input type="number" class="stat-input" bind:value={draft.savingThrows[key].save} />
							</div>
						{/each}
					</div>
				</div>

				<div class="gb-panel">
					<div class="hp-grid">
						<div class="hp-box">
							<div class="hp-box-label">Current HP</div>
							<input type="number" class="hp-box-input" bind:value={draft.hp.current} />
						</div>
						<div class="hp-box">
							<div class="hp-box-label">Max HP</div>
							<input type="number" class="hp-box-input" bind:value={draft.hp.max} />
						</div>
					</div>
				</div>
			</div>

			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Facts</div>
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
				</div>

				<div class="gb-panel">
					<div class="gb-panel-header">Weapons</div>
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
				</div>

				<div class="gb-panel">
					<div class="gb-panel-header">Armor</div>
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
						<label><input type="checkbox" bind:checked={draft.armor.savingThrowPenalties.hardiness} /> Hardiness</label>
						<label><input type="checkbox" bind:checked={draft.armor.savingThrowPenalties.evasion} /> Evasion</label>
						<label><input type="checkbox" bind:checked={draft.armor.savingThrowPenalties.spirit} /> Spirit</label>
					</div>
				</div>

				<div class="gb-panel">
					<div class="gb-panel-header">Fray Die</div>
					<select bind:value={draft.frayDie} class="gb-select" style="margin-bottom:10px;">
						{#each ['1d4', '1d6', '1d8', '1d10', '1d12'] as die}
							<option value={die}>{die}</option>
						{/each}
					</select>
					{#each draft.frayDieTable as entry}
						<div class="item-row">
							<span style="flex:1; font-size:13px;">{entry.roll}</span>
							<input type="number" class="stat-input" style="flex:1;" bind:value={entry.dmg} />
						</div>
					{/each}
				</div>
			</div>

			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Resources</div>
					<div class="stat-table">
						<div class="stat-table-head"><span>Type</span><span>Total</span><span>Free</span><span></span></div>
						<div class="stat-table-row">
							<span class="stat-table-label">effort</span>
							<input type="number" class="stat-input" bind:value={draft.resources.effort.total} />
							<input type="number" class="stat-input" bind:value={draft.resources.effort.free} />
							<span></span>
						</div>
						<div class="stat-table-row">
							<span class="stat-table-label">influence</span>
							<input type="number" class="stat-input" bind:value={draft.resources.influence.total} />
							<input type="number" class="stat-input" bind:value={draft.resources.influence.free} />
							<span></span>
						</div>
						<div class="stat-table-row">
							<span class="stat-table-label">dominion</span>
							<input type="number" class="stat-input" bind:value={draft.resources.dominion.total} />
							<input type="number" class="stat-input" bind:value={draft.resources.dominion.free} />
							<span></span>
						</div>
						<div class="stat-table-row">
							<span class="stat-table-label">wealth</span>
							<input type="number" class="stat-input" bind:value={draft.resources.wealth.total} />
							<input type="number" class="stat-input" bind:value={draft.resources.wealth.free} />
							<span></span>
						</div>
					</div>
					<div class="field-group" style="margin-top:10px; margin-bottom:0;">
						<label class="field-label" for="earned">Earned Per Month</label>
						<input id="earned" type="text" bind:value={draft.earnedPerMonth} class="gb-input" />
					</div>
				</div>

				<div class="gb-panel">
					<div class="gb-panel-header">Description</div>
					<textarea bind:value={draft.description} class="gb-textarea" style="min-height:100px;"></textarea>
				</div>

				<div class="gb-panel">
					<div class="gb-panel-header">Words of Creation</div>
					<p style="font-size:13px; color:var(--muted-foreground);">
						{draft.words.length} Word{draft.words.length === 1 ? '' : 's'} bound &mdash; manage on the <a href="/gifts" style="color:var(--gold-bright);">Gifts</a> page.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
