<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { goto } from '$app/navigation';

	const char = $derived(session.activeCharacter);
	const attrKeys = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'] as const;
	const saveKeys = ['hardiness', 'evasion', 'spirit'] as const;
</script>

<div class="print-page">
	{#if !char}
		<div class="prompt-card"><p>No active character. <a href="/characters">Select one</a> first.</p></div>
	{:else}
		<div class="print-actions no-print">
			<button class="gb-btn" onclick={() => window.print()}>Print / Save as PDF</button>
			<button class="gb-btn secondary" onclick={() => goto('/character')}>Back to Sheet</button>
		</div>

		<div class="print-header">
			<div class="print-title">{char.name}</div>
			<div class="print-sub">
				{char.description}{#if char.goal}&nbsp;&mdash; {char.goal}{/if}
			</div>
			<div class="print-sub">Level {char.level} &bull; {char.experience} Experience</div>
		</div>

		<div class="print-section">
			<div class="print-section-title">Attributes</div>
			<div class="print-grid-2">
				{#each attrKeys as key}
					<div class="print-row"><span style="text-transform:capitalize;">{key}</span><span>{char.attributes[key].score} ({char.attributes[key].mod >= 0 ? '+' : ''}{char.attributes[key].mod}) &bull; Check {char.attributes[key].check}</span></div>
				{/each}
			</div>
		</div>

		<div class="print-section">
			<div class="print-section-title">Saving Throws &amp; Hit Points</div>
			<div class="print-grid-2">
				{#each saveKeys as key}
					<div class="print-row"><span style="text-transform:capitalize;">{key}</span><span>Base {char.savingThrows[key].base} &bull; Save {char.savingThrows[key].save}</span></div>
				{/each}
				<div class="print-row"><span>Hit Points</span><span>{char.hp.current} / {char.hp.max}</span></div>
				<div class="print-row"><span>Fray Die</span><span>{char.frayDie}</span></div>
			</div>
		</div>

		<div class="print-section">
			<div class="print-section-title">Facts</div>
			<div class="print-row"><span>Origin</span><span>{char.facts.origin || '—'}</span></div>
			<div class="print-row"><span>Past Career</span><span>{char.facts.pastCareer || '—'}</span></div>
			<div class="print-row"><span>Relationship</span><span>{char.facts.relationship || '—'}</span></div>
			{#each char.additionalFacts ?? [] as fact}
				<div class="print-row"><span>Fact</span><span>{fact.description}</span></div>
			{/each}
			<div class="print-row"><span>Player</span><span>{char.player || '—'}</span></div>
		</div>

		<div class="print-section">
			<div class="print-section-title">Weapons &amp; Armor</div>
			{#each char.weapons as weapon}
				<div class="print-row"><span>{weapon.description || 'Weapon'}</span><span>{weapon.attr} &bull; Atk {weapon.atk} &bull; Dmg {weapon.dmg}</span></div>
			{/each}
			<div class="print-row"><span>Armor</span><span>{char.armor.type || '—'} &bull; AC {char.armor.armorClass}{char.armor.shield ? ' (+1 Shield)' : ''}</span></div>
		</div>

		<div class="print-section">
			<div class="print-section-title">Resources</div>
			<div class="print-grid-2">
				<div class="print-row"><span>Effort</span><span>{char.resources.effort.free} / {char.resources.effort.total}</span></div>
				<div class="print-row"><span>Influence</span><span>{char.resources.influence.free} / {char.resources.influence.total}</span></div>
				<div class="print-row"><span>Dominion</span><span>{char.resources.dominion.free} / {char.resources.dominion.total}</span></div>
				<div class="print-row"><span>Wealth</span><span>{char.resources.wealth.free} / {char.resources.wealth.total}</span></div>
			</div>
		</div>

		<div class="print-section">
			<div class="print-section-title">Words of Creation</div>
			{#each char.words as word}
				<div class="print-word-block">
					<div class="print-word-name">{word.name}</div>
					{#if word.description}
						<p class="print-word-desc">{word.description}</p>
					{/if}
					{#each word.gifts as gift}
						<div class="print-gift-block">
							<div class="print-gift-name">{gift.name}{#if gift.active}&nbsp;<span class="print-gift-active">(Active)</span>{/if}</div>
							<div class="print-gift-meta">{gift.tier} &bull; {gift.type} &bull; Effort: {gift.effort}</div>
							{#if gift.description}
								<p class="print-gift-desc">{gift.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
