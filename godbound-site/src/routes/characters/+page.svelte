<script lang="ts">
	import { session, loadActiveCharacter, setActiveCharacterById } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import SplashHeader from '$lib/components/SplashHeader.svelte';

	let showNewChar = $state(false);
	let newName = $state('');
	let creating = $state(false);
	let createError = $state<string | null>(null);

	const characters = $derived(session.characters);

	async function handleCreate() {
		creating = true;
		createError = null;
		try {
			await api.character.create({ name: newName });
			await loadActiveCharacter();
			showNewChar = false;
			newName = '';
		} catch (e) {
			createError = (e as Error).message;
		} finally {
			creating = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this character? This cannot be undone.')) return;
		try {
			await api.character.delete(id);
			await loadActiveCharacter();
		} catch {}
	}
</script>

<div class="page">
	<SplashHeader title="My" highlight="Godbound" subtitle="All your ascended in one place" />

	{#if characters.length === 0}
		<div class="prompt-card" style="text-align:center;">
			<p style="margin-bottom:16px;">No characters yet. Begin your ascension!</p>
			<button onclick={() => (showNewChar = true)} class="gb-btn">Create Character</button>
		</div>
	{:else}
		<div class="char-grid">
			{#each characters as char}
				<a
					href="/character"
					onclick={() => setActiveCharacterById(char.id)}
					class="char-card"
				>
					<div class="char-card-header">
						<span class="char-name">{char.name}</span>
					</div>
					<div class="char-card-body">
						<div class="char-stat-row">
							<span class="char-stat-label">Level</span>
							<span class="char-stat-value">{char.level}</span>
						</div>
					</div>
					<div class="char-card-footer">
						<button onclick={(e) => { e.preventDefault(); handleDelete(char.id); }} class="delete-btn">Delete</button>
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
	<div class="modal-overlay" onclick={() => (showNewChar = false)} onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)}>
			<h2 class="modal-title">New Godbound</h2>
			{#if createError}
				<div class="modal-error">{createError}</div>
			{/if}
			<div class="field-group">
				<label for="new-name" class="field-label">Name</label>
				<input id="new-name" type="text" bind:value={newName} required class="gb-input" placeholder="e.g. Kelemvor the Risen" />
			</div>
			<div class="modal-actions">
				<button onclick={handleCreate} disabled={creating || !newName} class="gb-btn">{creating ? 'Creating...' : 'Create'}</button>
				<button onclick={() => (showNewChar = false)} class="gb-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}
