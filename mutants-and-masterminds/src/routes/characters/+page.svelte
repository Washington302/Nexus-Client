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
			await api.character.create({
				name: newName,
				powerLevel: newPowerLevel,
				description: 'A new hero emerges!'
			});
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
		<span style="position:relative;z-index:1;">&#9733; {characters.length} HERO{(characters.length !== 1 ? 'ES' : '')} IN YOUR ROSTER &#9733;</span>
	</div>
</div>

{#if showNewChar}
	<div class="modal-overlay" onclick={() => (showNewChar = false)} onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNewChar = false)}>
			<h2 class="modal-title">&#9733; New Hero &#9733;</h2>
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

<style>
	.page {
		font-family: 'Nunito', sans-serif;
		background: var(--newsprint);
		padding: 20px;
		width: 100%;
		max-width: 1200px;
	}

	.prompt-card {
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
		padding: 32px;
		margin-bottom: 14px;
		font-size: 16px;
	}
	.prompt-card a { color: var(--danger); font-weight: 700; }

	.char-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
		margin-bottom: 14px;
	}

	.char-card {
		display: block;
		text-decoration: none;
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
		overflow: hidden;
		transition: transform 0.1s;
	}
	.char-card:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--border); }

	.char-card-header {
		background: var(--primary);
		padding: 10px 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 3px solid var(--border);
	}

	.char-name {
		font-family: 'Bangers', cursive;
		font-size: 20px;
		color: white;
		text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
		letter-spacing: 0.04em;
	}

	.char-card-body { padding: 12px; }

	.char-stat-row {
		display: flex;
		gap: 16px;
		justify-content: center;
	}

	.char-stat-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-right: 2px;
	}
	.char-stat-value {
		font-family: 'Bangers', cursive;
		font-size: 20px;
		color: var(--primary);
	}

	.char-card-footer {
		padding: 8px 12px;
		border-top: 2px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.delete-btn {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background: none;
		border: 1px solid transparent;
		padding: 2px 8px;
		cursor: pointer;
		transition: all 0.15s;
	}
	.delete-btn:hover { color: var(--danger); border-color: var(--danger); }

	.open-indicator {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--danger);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.add-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 160px;
		background: transparent;
		border: 3px dashed #bbb;
		cursor: pointer;
		transition: all 0.15s;
	}
	.add-card:hover { border-color: var(--danger); background: #F0F0F0; }

	.add-icon {
		font-family: 'Bangers', cursive;
		font-size: 36px;
		color: var(--accent);
	}
	.add-card:hover .add-icon { color: var(--danger); }

	.add-label {
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.comic-btn {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.08em;
		background: var(--primary);
		color: white;
		border: 3px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		padding: 8px 20px;
		cursor: pointer;
		text-transform: uppercase;
		transition: transform 0.1s;
	}
	.comic-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.comic-btn:hover:not(:disabled) { transform: translate(1px, 1px); box-shadow: 2px 2px 0 var(--border); }
	.comic-btn.secondary { background: transparent; color: var(--ink); }

	.signature-band {
		background: var(--border);
		color: var(--accent);
		font-family: 'Bangers', cursive;
		font-size: 15px;
		letter-spacing: 0.15em;
		text-align: center;
		padding: 5px;
		position: relative;
		overflow: hidden;
	}
	.sig-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, var(--highlight) 1px, transparent 1px);
		background-size: 10px 10px;
		opacity: 0.15;
	}

	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 500;
		display: flex; align-items: center; justify-content: center;
	}
	.modal-box {
		background: var(--panel-bg); border: 3px solid var(--border); box-shadow: 6px 6px 0 var(--border);
		padding: 24px; width: 400px; display: flex; flex-direction: column; gap: 16px;
	}
	.modal-title {
		font-family: 'Bangers', cursive; font-size: 24px; color: var(--primary); margin: 0;
	}
	.modal-error {
		padding: 10px; background: #ffdad6; border: 2px solid var(--danger);
		font-family: 'Nunito', sans-serif; font-size: 14px; color: var(--danger);
	}
	.field-group { display: flex; flex-direction: column; gap: 4px; }
	.field-label {
		font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: 700;
		color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em;
	}
	.comic-input {
		border: none; border-bottom: 3px solid var(--border);
		font-family: 'Nunito', sans-serif; font-size: 16px;
		padding: 6px 2px; background: transparent; color: var(--ink); outline: none;
	}
	.modal-actions { display: flex; gap: 8px; }
</style>
