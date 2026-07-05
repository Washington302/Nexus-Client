<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter, Gift } from '$lib/services/api';
	import { gameRules } from '$lib/stores/gameRules.svelte';
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

	const totalEffort = $derived(draft?.resources.effort.total ?? 0);
	const freeEffort = $derived(draft?.resources.effort.free ?? 0);

	// All gifts across all words, flattened, for the "Detailed Gifts" section
	const allGifts = $derived(draft?.words.flatMap((w) => w.gifts) ?? []);

	function removeWord(i: number) {
		if (!draft) return;
		draft.words = draft.words.filter((_, idx) => idx !== i);
	}

	function removeGift(wordIndex: number, giftIndex: number) {
		if (!draft) return;
		const word = draft.words[wordIndex];
		word.gifts = word.gifts.filter((_, idx) => idx !== giftIndex);
		word.associatedGifts = word.gifts.length;
	}

	let effortNote = $state<string | null>(null);

	function toggleGiftActive(wordIndex: number, gift: Gift) {
		if (!draft) return;
		const activating = !gift.active;
		if (gameRules.trackEffortAutomatically && gift.effort !== 'None') {
			if (activating) {
				if (draft.resources.effort.free <= 0) {
					effortNote = 'Not enough free Effort to activate this Gift.';
					return;
				}
				draft.resources.effort.free -= 1;
			} else {
				draft.resources.effort.free = Math.min(draft.resources.effort.total, draft.resources.effort.free + 1);
			}
			effortNote = null;
		}
		gift.active = activating;
		const word = draft.words[wordIndex];
		word.activeGifts = word.gifts.filter((g) => g.active).length;
	}

	// ─── Bind a New Word modal ──────────────────────────────────────────────
	let showNewWord = $state(false);
	let newWordName = $state('');
	let newWordDescription = $state('');

	function openNewWordModal() {
		newWordName = '';
		newWordDescription = '';
		showNewWord = true;
	}

	function bindWord() {
		if (!draft || !newWordName) return;
		draft.words = [
			...draft.words,
			{
				name: newWordName,
				description: newWordDescription,
				associatedGifts: 0,
				activeGifts: 0,
				gifts: [],
				committedEffort: false,
			},
		];
		showNewWord = false;
	}

	// ─── Inscribe a New Gift modal ──────────────────────────────────────────
	let showNewGift = $state(false);
	let newGiftName = $state('');
	let newGiftWordIndex = $state(0);
	let newGiftTier = $state<'Lesser' | 'Greater'>('Lesser');
	let newGiftType = $state<Gift['type']>('Action');
	let newGiftEffort = $state<Gift['effort']>('None');
	let newGiftDescription = $state('');

	function openNewGiftModal() {
		newGiftName = '';
		newGiftWordIndex = 0;
		newGiftTier = 'Lesser';
		newGiftType = 'Action';
		newGiftEffort = 'None';
		newGiftDescription = '';
		showNewGift = true;
	}

	function inscribeGift() {
		if (!draft || !newGiftName || !draft.words[newGiftWordIndex]) return;
		const word = draft.words[newGiftWordIndex];
		word.gifts = [
			...word.gifts,
			{
				id: crypto.randomUUID(),
				name: newGiftName,
				word: word.name,
				tier: newGiftTier,
				type: newGiftType,
				effort: newGiftEffort,
				description: newGiftDescription,
				active: false,
			},
		];
		word.associatedGifts = word.gifts.length;
		showNewGift = false;
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
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your gifts.</p></div>
	{:else if !draft}
		<div class="prompt-card"><p>No active character. <a href="/characters">Create or select one</a>.</p></div>
	{:else}
		<SplashHeader title="Divine" highlight="Gifts" subtitle="The manifestations of your celestial Words in the mortal realm" />

		{#if effortNote}
			<p class="error-box">{effortNote}</p>
		{/if}

		<SaveBar {saving} {saveError} {saveSuccess} onSave={handleSave} />

		<div class="stat-card" style="margin-bottom:16px;">
			<div class="stat-card-row" style="justify-content:space-around;">
				<div>
					<div class="stat-card-label">Total Effort</div>
					<div class="stat-card-title">{totalEffort - freeEffort} / {totalEffort}</div>
				</div>
				<div>
					<div class="stat-card-label">Committed</div>
					<div class="stat-card-title">{draft.words.filter((w) => w.committedEffort).length} Words</div>
				</div>
			</div>
		</div>

		<div class="gb-panel">
			<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
				<div class="gb-panel-header" style="margin-bottom:0;">Words of Creation</div>
				<button onclick={openNewWordModal} class="gb-btn secondary">+ Add Word</button>
			</div>
			{#each draft.words as word, wi}
				<div class="word-card">
					<div class="word-header">
						<input type="text" bind:value={word.name} placeholder="Word name" class="gb-input word-name" style="background:none; border:none; padding:0; width:auto;" />
						<label style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted-foreground);">
							<input type="checkbox" bind:checked={word.committedEffort} /> Committed Effort
						</label>
					</div>
					<textarea bind:value={word.description} placeholder="Intrinsic ability" class="gb-textarea" style="margin-bottom:10px;"></textarea>
					<div class="gift-meta">Associated Gifts: {word.gifts.length} &bull; {word.gifts.filter((g) => g.active).length} Active</div>
					{#each word.gifts as gift}
						<div class="gift-row">
							<label style="display:flex; align-items:center; gap:8px; font-size:13px;">
								<input type="checkbox" checked={gift.active} onchange={() => toggleGiftActive(wi, gift)} />
								{gift.name || '(unnamed gift)'}
							</label>
						</div>
					{/each}
					<div style="display:flex; justify-content:flex-end; margin-top:10px;">
						<button onclick={() => removeWord(wi)} class="delete-btn">Remove Word</button>
					</div>
				</div>
			{/each}
			{#if draft.words.length === 0}
				<p style="font-size:13px; color:var(--muted-foreground);">No Words bound yet.</p>
			{/if}
		</div>

		<div class="gb-panel">
			<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
				<div class="gb-panel-header" style="margin-bottom:0;">Detailed Gifts</div>
				<button onclick={openNewGiftModal} class="gb-btn secondary" disabled={draft.words.length === 0}>+ Add Gift</button>
			</div>
			{#each draft.words as word, wi}
				{#each word.gifts as gift, gi}
					<div class="gift-detail-card">
						<button onclick={() => removeGift(wi, gi)} class="gift-detail-delete" aria-label="Remove Gift">✕</button>
						<div class="gift-detail-name-col">
							<input type="text" bind:value={gift.name} placeholder="Gift Name" class="gift-detail-name-input" />
							<div class="gift-detail-caption">
								{word.name}
								<span>&bull;</span>
								<select bind:value={gift.tier} class="gift-detail-tier-select">
									<option value="Lesser">Lesser</option>
									<option value="Greater">Greater</option>
								</select>
							</div>
						</div>
						<div>
							<label class="field-label" style="margin:0 0 4px;" for="gift-type-{gift.id}">Type</label>
							<select id="gift-type-{gift.id}" bind:value={gift.type} class="gb-select" style="width:100%;">
								{#each ['Action', '(Smite)Action', 'Constant', 'On Turn', 'Instant', '(Smite)Instant'] as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="field-label" style="margin:0 0 4px;" for="gift-effort-{gift.id}">Effort</label>
							<select id="gift-effort-{gift.id}" bind:value={gift.effort} class="gb-select" style="width:100%;">
								{#each ['None', 'Scene', 'Day', 'Committed'] as effort}
									<option value={effort}>{effort}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="field-label" style="margin:0 0 4px;" for="gift-desc-{gift.id}">Effect Description</label>
							<textarea id="gift-desc-{gift.id}" bind:value={gift.description} placeholder="Effect Description" class="gb-textarea gift-detail-desc"></textarea>
						</div>
					</div>
				{/each}
			{/each}
			{#if allGifts.length === 0}
				<p style="font-size:13px; color:var(--muted-foreground);">No gifts yet. {draft.words.length === 0 ? 'Add a Word above first.' : 'Use "+ Add Gift" to inscribe one.'}</p>
			{/if}
		</div>
	{/if}
</div>

{#if showNewWord}
	<div class="modal-overlay" onclick={() => (showNewWord = false)} onkeydown={(e) => e.key === 'Escape' && (showNewWord = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNewWord = false)}>
			<h2 class="modal-title">Bind a New Word</h2>
			<div class="field-group">
				<label class="field-label" for="new-word-name">Word Name</label>
				<input id="new-word-name" type="text" bind:value={newWordName} class="gb-input" placeholder="e.g. Fertility" />
			</div>
			<div class="field-group">
				<label class="field-label" for="new-word-desc">Intrinsic Ability</label>
				<textarea id="new-word-desc" bind:value={newWordDescription} class="gb-textarea" placeholder="What does this Word grant intrinsically?"></textarea>
			</div>
			<div class="modal-actions">
				<button onclick={bindWord} disabled={!newWordName} class="gb-btn">Bind Word</button>
				<button onclick={() => (showNewWord = false)} class="gb-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}

{#if showNewGift && draft}
	<div class="modal-overlay" onclick={() => (showNewGift = false)} onkeydown={(e) => e.key === 'Escape' && (showNewGift = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNewGift = false)}>
			<h2 class="modal-title">Inscribe a New Gift</h2>
			<div style="display:flex; gap:10px;">
				<div class="field-group" style="flex:1;">
					<label class="field-label" for="new-gift-name">Gift Name</label>
					<input id="new-gift-name" type="text" bind:value={newGiftName} class="gb-input" placeholder="e.g. Perfect Cut" />
				</div>
				<div class="field-group" style="flex:1;">
					<label class="field-label" for="new-gift-word">Word</label>
					<select id="new-gift-word" bind:value={newGiftWordIndex} class="gb-select" style="width:100%;">
						{#each draft.words as word, wi}
							<option value={wi}>{word.name || '(unnamed word)'}</option>
						{/each}
					</select>
				</div>
			</div>
			<div style="display:flex; gap:10px;">
				<div class="field-group" style="flex:1;">
					<label class="field-label" for="new-gift-tier">Tier</label>
					<select id="new-gift-tier" bind:value={newGiftTier} class="gb-select" style="width:100%;">
						<option value="Lesser">Lesser</option>
						<option value="Greater">Greater</option>
					</select>
				</div>
				<div class="field-group" style="flex:1;">
					<label class="field-label" for="new-gift-type">Type</label>
					<select id="new-gift-type" bind:value={newGiftType} class="gb-select" style="width:100%;">
						{#each ['Action', '(Smite)Action', 'Constant', 'On Turn', 'Instant', '(Smite)Instant'] as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<div class="field-group" style="flex:1;">
					<label class="field-label" for="new-gift-effort">Effort</label>
					<select id="new-gift-effort" bind:value={newGiftEffort} class="gb-select" style="width:100%;">
						{#each ['None', 'Scene', 'Day', 'Committed'] as effort}
							<option value={effort}>{effort}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="field-group">
				<label class="field-label" for="new-gift-desc">Effect Description</label>
				<textarea id="new-gift-desc" bind:value={newGiftDescription} class="gb-textarea" placeholder="What does this Gift do?"></textarea>
			</div>
			<div class="modal-actions">
				<button onclick={inscribeGift} disabled={!newGiftName} class="gb-btn">Inscribe Gift</button>
				<button onclick={() => (showNewGift = false)} class="gb-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}
