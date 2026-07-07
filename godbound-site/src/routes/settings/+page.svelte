<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import { preferences, updatePreferences, TYPOGRAPHY_SCALE_OPTIONS } from '$lib/stores/preferences.svelte';
	import { gameRules, updateGameRules } from '$lib/stores/gameRules.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ThemeEditor from '$lib/components/ThemeEditor.svelte';

	let actionNote = $state<string | null>(null);
	let actionError = $state<string | null>(null);

	const shareUrl = $derived(
		session.activeCharacter && typeof window !== 'undefined'
			? `${window.location.origin}/share/${session.activeCharacter.id}`
			: ''
	);

	function copyShareLink() {
		navigator.clipboard
			.writeText(shareUrl)
			.then(() => {
				actionError = null;
				actionNote = 'Share link copied to clipboard.';
			})
			.catch((e) => {
				actionNote = null;
				actionError = `Couldn't copy the link: ${(e as Error).message}`;
			});
	}

	let importInput: HTMLInputElement;
	let importing = $state(false);

	let joinCode = $state('');
	let joinCharacterId = $state('');
	let joining = $state(false);

	$effect(() => {
		if (!joinCharacterId && session.characters.length > 0) {
			joinCharacterId = session.activeCharacterId ?? session.characters[0].id;
		}
	});

	function exportLedger() {
		if (!session.activeCharacter) {
			actionNote = null;
			actionError = 'No active character to export.';
			return;
		}
		const data = JSON.stringify(session.activeCharacter, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${session.activeCharacter.name || 'character'}.json`;
		a.click();
		URL.revokeObjectURL(url);
		actionError = null;
		actionNote = 'Character ledger exported.';
	}

	async function handleImport(e: Event) {
		actionNote = null;
		actionError = null;
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		importing = true;
		try {
			const text = await file.text();
			const parsed = JSON.parse(text);
			if (!parsed.name || typeof parsed.name !== 'string') {
				throw new Error('File is missing a character "name" field.');
			}
			const created = await api.character.create({ name: parsed.name, campaignId: parsed.campaignId });
			const merged: GodboundCharacter = { ...created, ...parsed, id: created.id, userId: created.userId, gameSystem: created.gameSystem };
			const updated = await api.character.update(created.id, merged);
			session.characters = [...session.characters, updated];
			actionNote = `Imported "${updated.name}".`;
		} catch (err) {
			actionError = (err as Error).message;
		} finally {
			importing = false;
			input.value = '';
		}
	}

	async function togglePublic(checked: boolean) {
		if (!session.activeCharacter) return;
		actionNote = null;
		actionError = null;
		const updatedDraft = { ...session.activeCharacter, isPublic: checked };
		try {
			const updated = await api.character.update(updatedDraft.id, updatedDraft);
			session.activeCharacter = updated;
			const idx = session.characters.findIndex((c) => c.id === updated.id);
			if (idx >= 0) session.characters[idx] = updated;
			actionNote = checked ? 'Sheet is now publicly viewable.' : 'Sheet is now private.';
		} catch (err) {
			actionError = (err as Error).message;
		}
	}

	async function joinCampaign() {
		if (!joinCode.trim() || !joinCharacterId) return;
		joining = true;
		actionNote = null;
		actionError = null;
		try {
			const campaign = await api.campaign.join(joinCode.trim());
			const char = session.characters.find((c) => c.id === joinCharacterId);
			if (!char) throw new Error('Select a character to link.');
			const updated = await api.character.update(char.id, { ...char, campaignId: campaign.id });
			const idx = session.characters.findIndex((c) => c.id === updated.id);
			if (idx >= 0) session.characters[idx] = updated;
			if (session.activeCharacter?.id === updated.id) session.activeCharacter = updated;
			actionNote = `Joined "${campaign.name}" with ${updated.name}.`;
			joinCode = '';
		} catch (err) {
			actionError = (err as Error).message;
		} finally {
			joining = false;
		}
	}
</script>

<div class="page">
	<SplashHeader title="Lexicon of" highlight="Configuration" subtitle="Refine the vessel of your divinity." />

	{#if actionError}
		<p class="error-box" style="margin-bottom:16px;">{actionError}</p>
	{:else if actionNote}
		<p class="settings-note" style="margin-bottom:16px;">{actionNote}</p>
	{/if}

	<div class="settings-grid">
		<div class="settings-col">
			<div class="gb-panel">
				<div class="gb-panel-header">&#8681; Character Management</div>
				<div class="settings-btn-stack">
					<button class="gb-btn secondary block" onclick={exportLedger}>&#8681; Export Character Ledger</button>
					<button class="gb-btn secondary block" onclick={() => importInput.click()} disabled={importing}>
						&#8679; {importing ? 'Importing...' : 'Import Character Data'}
					</button>
					<input type="file" accept=".json" onchange={handleImport} bind:this={importInput} class="theme-file-input" />
				</div>
			</div>

			<div class="gb-panel">
				<div class="gb-panel-header">&#9813; Session Settings</div>
				<div class="field-group">
					<label class="field-label" for="join-code">Campaign Share Code</label>
					<input id="join-code" type="text" bind:value={joinCode} class="gb-input" placeholder="Paste a campaign ID..." />
				</div>
				{#if session.characters.length > 0}
					<div class="field-group">
						<label class="field-label" for="join-character">Character to Join With</label>
						<select id="join-character" bind:value={joinCharacterId} class="gb-select" style="width:100%;">
							{#each session.characters as char}
								<option value={char.id}>{char.name}</option>
							{/each}
						</select>
					</div>
					<button class="gb-btn block" onclick={joinCampaign} disabled={joining || !joinCode.trim()}>
						{joining ? 'Joining...' : 'Join Campaign'}
					</button>
				{:else}
					<p class="settings-note">Create a character first to join a campaign.</p>
				{/if}

				<div class="settings-row">
					<div>
						<div class="settings-row-label">Public Sheet Visibility</div>
						<div class="settings-row-desc">Allow others in the pantheon to view your stats.</div>
					</div>
					<label class="gb-toggle">
						<input
							type="checkbox"
							checked={session.activeCharacter?.isPublic ?? false}
							disabled={!session.activeCharacter}
							onchange={(e) => togglePublic((e.target as HTMLInputElement).checked)}
						/>
						<span class="gb-toggle-track"><span class="gb-toggle-thumb"></span></span>
					</label>
				</div>
				{#if session.activeCharacter?.isPublic}
					<div class="share-link-row">
						<a href={shareUrl} target="_blank" rel="noopener" class="share-link-text">{shareUrl}</a>
						<button onclick={copyShareLink} class="gb-btn secondary" style="padding:6px 12px; font-size:12px;">Copy</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="settings-col">
			<div class="gb-panel">
				<div class="gb-panel-header">&#9998; Game Rules &amp; Automation</div>
				<div class="settings-row">
					<div>
						<div class="settings-row-label">Auto-calculate Saving Throws</div>
						<div class="settings-row-desc">Derived automatically from your attributes and armor.</div>
					</div>
					<label class="gb-toggle">
						<input type="checkbox" checked={gameRules.autoCalculateSavingThrows} onchange={(e) => updateGameRules({ autoCalculateSavingThrows: (e.target as HTMLInputElement).checked })} />
						<span class="gb-toggle-track"><span class="gb-toggle-thumb"></span></span>
					</label>
				</div>
				<div class="settings-row">
					<div>
						<div class="settings-row-label">Track Effort Usage Automatically</div>
						<div class="settings-row-desc">Reduces free Effort when activating a Gift that costs Effort.</div>
					</div>
					<label class="gb-toggle">
						<input type="checkbox" checked={gameRules.trackEffortAutomatically} onchange={(e) => updateGameRules({ trackEffortAutomatically: (e.target as HTMLInputElement).checked })} />
						<span class="gb-toggle-track"><span class="gb-toggle-thumb"></span></span>
					</label>
				</div>
				<div class="settings-row" style="margin-bottom:0;">
					<div>
						<div class="settings-row-label">Enable Dominion Reminders</div>
						<div class="settings-row-desc">Adds an End Session action on the Chronicle page that prompts for Dominion earned.</div>
					</div>
					<label class="gb-toggle">
						<input type="checkbox" checked={gameRules.enableDominionReminders} onchange={(e) => updateGameRules({ enableDominionReminders: (e.target as HTMLInputElement).checked })} />
						<span class="gb-toggle-track"><span class="gb-toggle-thumb"></span></span>
					</label>
				</div>
			</div>

			<div class="gb-panel">
				<div class="gb-panel-header">&#9681; Display Preferences</div>
				<div class="settings-row">
					<div>
						<div class="settings-row-label">Compact Mode</div>
						<div class="settings-row-desc">Tighter padding and spacing across panels.</div>
					</div>
					<label class="gb-toggle">
						<input type="checkbox" checked={preferences.compactMode} onchange={(e) => updatePreferences({ compactMode: (e.target as HTMLInputElement).checked })} />
						<span class="gb-toggle-track"><span class="gb-toggle-thumb"></span></span>
					</label>
				</div>
				<div class="settings-row">
					<div>
						<div class="settings-row-label">Typography Scale</div>
					</div>
					<select
						class="gb-select"
						value={preferences.typographyScale}
						onchange={(e) => updatePreferences({ typographyScale: Number((e.target as HTMLSelectElement).value) as 14 | 16 | 18 | 20 })}
					>
						{#each TYPOGRAPHY_SCALE_OPTIONS as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div class="settings-row" style="margin-bottom:0;">
					<div>
						<div class="settings-row-label">High Contrast Text</div>
					</div>
					<label class="gb-toggle">
						<input type="checkbox" checked={preferences.highContrastText} onchange={(e) => updatePreferences({ highContrastText: (e.target as HTMLInputElement).checked })} />
						<span class="gb-toggle-track"><span class="gb-toggle-thumb"></span></span>
					</label>
				</div>

				<div class="settings-preview-box">
					<p style="font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--muted-foreground); margin-bottom:8px;">Preview Rendering</p>
					<div class="settings-preview-title">A Call to Might</div>
					<p class="settings-preview-body">The Godbound exerts their will upon the world, turning the tides of fate with effortless grace.</p>
				</div>
			</div>
		</div>
	</div>

	<div class="gb-panel" style="margin-top:24px;">
		<div class="gb-panel-header">Theme Editor</div>
		<ThemeEditor />
	</div>
</div>
