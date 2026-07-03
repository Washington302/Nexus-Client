<script lang="ts">
	import { goto } from '$app/navigation';
	import { COMIC, FONT } from '$lib/constants';
	import { session, loadActiveCharacter, setActiveCharacterById } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';

	let showNewChar = $state(false);
	let newName = $state('');
	let newPowerLevel = $state(10);
	let creating = $state(false);
	let createError = $state<string | null>(null);

	const characters = $derived(session.characters);

	async function handleCreate() {
		creating = true;
		createError = null;
		try {
			const { api } = await import('$lib/services/api');
			const created = await api.character.create({
				name: newName,
				powerLevel: newPowerLevel,
				description: 'A new hero emerges!'
			});
			await loadActiveCharacter();
			await setActiveCharacterById(created.id);
			showNewChar = false;
			newName = '';
			goto('/character');
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
		} catch {}
	}
</script>

<div class="page">
	<SplashHeader title="My" highlight="Heroes" subtitle="All your characters in one place" />

	{#if !session.userId}
		<div class="prompt-card">
			<p><a href="/auth/login">Sign in</a> to view your characters.</p>
		</div>
	{:else if characters.length === 0}
		<div class="prompt-card" style="text-align:center;">
			<p style="margin-bottom:16px;">No characters yet. Create your first hero!</p>
			<button onclick={() => (showNewChar = true)} class="comic-btn">Create Character</button>
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
						<PillBadge text="PL {char.powerLevel}" color="primary" />
					</div>
					<div class="char-card-body">
						<div class="char-stat-row">
							<span class="char-stat-label">STR</span>
							<span class="char-stat-value">{char.abilities?.strengthFinalValue ?? 0}</span>
							<span class="char-stat-label">AGL</span>
							<span class="char-stat-value">{char.abilities?.agilityFinalValue ?? 0}</span>
							<span class="char-stat-label">INT</span>
							<span class="char-stat-value">{char.abilities?.intellectFinalValue ?? 0}</span>
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

	<div class="signature-band" style="margin-top:16px;">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">★ {characters.length} HERO{(characters.length !== 1 ? 'ES' : '')} IN YOUR ROSTER ★</span>
	</div>
</div>

{#if showNewChar}
	<div class="modal-overlay" onclick={() => (showNewChar = false)} onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)}>
			<h2 class="modal-title">★ New Hero ★</h2>
			{#if createError}
				<div class="modal-error">{createError}</div>
			{/if}
			<div class="field-group">
				<label for="new-name" class="field-label">Hero Name</label>
				<input id="new-name" type="text" bind:value={newName} required class="comic-input" placeholder="e.g. Captain Nova" />
			</div>
			<div class="field-group">
				<label for="new-pl" class="field-label">Power Level</label>
				<input id="new-pl" type="number" bind:value={newPowerLevel} min="1" max="20" class="comic-input" />
			</div>
			<div class="modal-actions">
				<button onclick={handleCreate} disabled={creating || !newName} class="comic-btn">{creating ? 'Creating...' : 'Create Hero'}</button>
				<button onclick={() => (showNewChar = false)} class="comic-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}

