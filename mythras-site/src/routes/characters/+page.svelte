<script lang="ts">
	import { session, loadActiveCharacter, setActiveCharacterById } from '$lib/stores/session.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';

	let showNewChar = $state(false);
	let newName = $state('');
	let newCulture = $state('');
	let newCareer = $state('');
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
				raceCulture: newCulture,
				career: newCareer
			});
			await loadActiveCharacter();
			showNewChar = false;
			newName = '';
			newCulture = '';
			newCareer = '';
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
		<p class="list-subtitle">All your Mythras characters in one place</p>
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
						<PillBadge text={char.career || 'Unassigned'} color="gold" />
					</div>
					<div class="char-card-body">
						<div class="char-stat-row">
							<span class="char-stat-label">STR</span>
							<span class="char-stat-value">{char.characteristics?.str ?? 0}</span>
							<span class="char-stat-label">DEX</span>
							<span class="char-stat-value">{char.characteristics?.dex ?? 0}</span>
							<span class="char-stat-label">POW</span>
							<span class="char-stat-value">{char.characteristics?.pow ?? 0}</span>
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
					placeholder="e.g. Kaelen of Meeros"
				/>
			</div>
			<div class="field-group">
				<label for="new-culture" class="field-label">Culture</label>
				<input
					id="new-culture"
					type="text"
					bind:value={newCulture}
					class="comic-input"
					placeholder="e.g. Civilised"
				/>
			</div>
			<div class="field-group">
				<label for="new-career" class="field-label">Career</label>
				<input
					id="new-career"
					type="text"
					bind:value={newCareer}
					class="comic-input"
					placeholder="e.g. Warrior"
				/>
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
