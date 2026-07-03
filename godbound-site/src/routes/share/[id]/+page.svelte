<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import SplashHeader from '$lib/components/SplashHeader.svelte';

	let char = $state<GodboundCharacter | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id) {
			error = 'No character specified.';
			loading = false;
			return;
		}
		loading = true;
		error = null;
		api.character.getPublic(id)
			.then((data) => { char = data; })
			.catch((e) => { error = (e as Error).message; })
			.finally(() => { loading = false; });
	});

	const attrKeys = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'] as const;
</script>

<div class="page">
	{#if loading}
		<div class="prompt-card"><p>Loading character...</p></div>
	{:else if error || !char}
		<div class="prompt-card"><p>{error ?? 'Character not found.'}</p></div>
	{:else}
		<SplashHeader title={char.name} highlight="" subtitle={char.goal || 'A Godbound of the Ascension'} />

		<div class="sheet-grid">
			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Attributes</div>
					<div class="stat-table">
						<div class="stat-table-head"><span>Type</span><span>Score</span><span>Mod</span><span>Check</span></div>
						{#each attrKeys as key}
							<div class="stat-table-row">
								<span class="stat-table-label">{key}</span>
								<span>{char.attributes[key].score}</span>
								<span>{char.attributes[key].mod}</span>
								<span>{char.attributes[key].check}</span>
							</div>
						{/each}
					</div>
				</div>
				<div class="gb-panel">
					<div class="hp-grid">
						<div class="hp-box">
							<div class="hp-box-label">HP</div>
							<div class="hp-box-input">{char.hp.current} / {char.hp.max}</div>
						</div>
						<div class="hp-box">
							<div class="hp-box-label">Level</div>
							<div class="hp-box-input">{char.level}</div>
						</div>
					</div>
				</div>
			</div>

			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Facts</div>
					<p style="font-size:13px; margin-bottom:8px;"><strong>Origin:</strong> {char.facts.origin}</p>
					<p style="font-size:13px; margin-bottom:8px;"><strong>Past Career:</strong> {char.facts.pastCareer}</p>
					<p style="font-size:13px;"><strong>Relationship:</strong> {char.facts.relationship}</p>
				</div>
				<div class="gb-panel">
					<div class="gb-panel-header">Weapons</div>
					{#each char.weapons as weapon}
						<div class="item-row"><span>{weapon.description} &mdash; {weapon.attr} {weapon.atk}/{weapon.dmg}</span></div>
					{/each}
				</div>
			</div>

			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Words of Creation</div>
					{#each char.words as word}
						<div class="word-card">
							<div class="word-name">{word.name}</div>
							<p style="font-size:13px; color:var(--muted-foreground);">{word.description}</p>
							{#each word.gifts as gift}
								<div class="gift-row"><strong>{gift.name}</strong> <span class="gift-meta">{gift.tier} &bull; {gift.type}</span></div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
