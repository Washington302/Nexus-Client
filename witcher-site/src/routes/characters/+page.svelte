<script lang="ts">
	import { session, loadActiveCharacter, setActiveCharacterById } from '$lib/stores/session.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';
	import { RACE_OPTIONS, PROFESSION_OPTIONS, GAME_TYPE_OPTIONS, label } from '$lib/utils/character';
	import type { Race, Profession, GameType } from '$lib/services/api';

	let showNewChar = $state(false);
	let newName = $state('');
	let newRace = $state<Race | ''>('');
	let newProfession = $state<Profession | ''>('');
	let newGameType = $state<GameType>('AVERAGE');
	let creating = $state(false);
	let createError = $state<string | null>(null);

	const characters = $derived(session.characters);

	async function handleCreate() {
		creating = true;
		createError = null;
		try {
			const { api } = await import('$lib/services/api');
			await api.character.create({
				name: newName,
				race: newRace || undefined,
				profession: newProfession || undefined,
				gameType: newGameType
			});
			await loadActiveCharacter();
			showNewChar = false;
			newName = '';
			newRace = '';
			newProfession = '';
			newGameType = 'AVERAGE';
		} catch (e) {
			createError = (e as Error).message;
		} finally {
			creating = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this character? This cannot be undone.')) return;
		try {
			const { api } = await import('$lib/services/api');
			await api.character.delete(id);
			await loadActiveCharacter();
		} catch {
			/* ignore */
		}
	}
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">My Characters</h1>
		<p class="list-subtitle">All your Witcher characters in one place</p>
	</div>

	{#if !session.userId}
		<div class="prompt-card">
			<p><a href="/auth/login">Sign in</a> to view your characters.</p>
		</div>
	{:else if characters.length === 0}
		<div class="prompt-card" style="text-align:center;">
			<p style="margin-bottom:16px;">No characters yet. Create your first one!</p>
			<button onclick={() => (showNewChar = true)} class="comic-btn">Create Character</button>
		</div>
	{:else}
		<div class="char-grid">
			{#each characters as char}
				<a href="/character" onclick={() => setActiveCharacterById(char.id)} class="char-card">
					<div class="char-card-header">
						<span class="char-name">{char.name}</span>
						<PillBadge
							text={char.professionInfo?.profession
								? label(char.professionInfo.profession)
								: 'Unassigned'}
							color="gold"
						/>
					</div>
					<div class="char-card-body">
						<div class="char-stat-row">
							<span class="char-stat-label">BODY</span>
							<span class="char-stat-value">{char.statistics?.body ?? 0}</span>
							<span class="char-stat-label">REF</span>
							<span class="char-stat-value">{char.statistics?.reflexes ?? 0}</span>
							<span class="char-stat-label">WILL</span>
							<span class="char-stat-value">{char.statistics?.will ?? 0}</span>
						</div>
					</div>
					<div class="char-card-footer">
						<button
							onclick={(e) => {
								e.preventDefault();
								handleDelete(char.id);
							}}
							class="delete-btn">Delete</button
						>
						<span class="open-indicator">Open &#8594;</span>
					</div>
				</a>
			{/each}

			<button onclick={() => (showNewChar = true)} class="add-card">
				<span class="add-icon">+</span>
				<span class="add-label">New Character</span>
			</button>
		</div>
	{/if}
</div>

{#if showNewChar}
	<div
		class="modal-overlay"
		onclick={() => (showNewChar = false)}
		onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)}
		role="presentation"
	>
		<div
			class="modal-box"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)}
		>
			<h2 class="modal-title">New Character</h2>
			{#if createError}
				<div class="modal-error">{createError}</div>
			{/if}
			<div class="field-group">
				<label for="new-name" class="field-label">Name</label>
				<input
					id="new-name"
					type="text"
					bind:value={newName}
					required
					class="comic-input"
					placeholder="e.g. Geralt of Rivia"
				/>
			</div>
			<div class="field-group">
				<label for="new-race" class="field-label">Race</label>
				<select id="new-race" bind:value={newRace} class="comic-input">
					<option value="">&mdash; Select &mdash;</option>
					{#each RACE_OPTIONS as opt}
						<option value={opt}>{label(opt)}</option>
					{/each}
				</select>
			</div>
			<div class="field-group">
				<label for="new-profession" class="field-label">Profession</label>
				<select id="new-profession" bind:value={newProfession} class="comic-input">
					<option value="">&mdash; Select &mdash;</option>
					{#each PROFESSION_OPTIONS as opt}
						<option value={opt}>{label(opt)}</option>
					{/each}
				</select>
			</div>
			<div class="field-group">
				<label for="new-gametype" class="field-label">Point-Buy Pool</label>
				<select id="new-gametype" bind:value={newGameType} class="comic-input">
					{#each GAME_TYPE_OPTIONS as opt}
						<option value={opt}>{label(opt)}</option>
					{/each}
				</select>
			</div>
			<div class="modal-actions">
				<button onclick={handleCreate} disabled={creating || !newName} class="comic-btn"
					>{creating ? 'Creating...' : 'Create Character'}</button
				>
				<button onclick={() => (showNewChar = false)} class="comic-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}
