<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter, Gift } from '$lib/services/api';
	import { createDefaultWord, createDefaultGift } from '$lib/utils/character';
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

	function addWord() {
		if (!draft) return;
		draft.words = [...draft.words, createDefaultWord()];
	}

	function removeWord(i: number) {
		if (!draft) return;
		draft.words = draft.words.filter((_, idx) => idx !== i);
	}

	function addGift(wordIndex: number) {
		if (!draft) return;
		const word = draft.words[wordIndex];
		word.gifts = [...word.gifts, createDefaultGift(word.name)];
		word.associatedGifts = word.gifts.length;
	}

	function removeGift(wordIndex: number, giftIndex: number) {
		if (!draft) return;
		const word = draft.words[wordIndex];
		word.gifts = word.gifts.filter((_, idx) => idx !== giftIndex);
		word.associatedGifts = word.gifts.length;
	}

	function toggleGiftActive(wordIndex: number, gift: Gift) {
		if (!draft) return;
		gift.active = !gift.active;
		const word = draft.words[wordIndex];
		word.activeGifts = word.gifts.filter((g) => g.active).length;
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
			<div class="gb-panel-header">Words of Creation</div>
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
					<div style="display:flex; justify-content:space-between; margin-top:10px;">
						<button onclick={() => addGift(wi)} class="gb-btn secondary">+ Add Gift</button>
						<button onclick={() => removeWord(wi)} class="delete-btn">Remove Word</button>
					</div>
				</div>
			{/each}
			<button onclick={addWord} class="gb-btn">+ Add Word</button>
		</div>

		<div class="gb-panel">
			<div class="gb-panel-header">Detailed Gifts</div>
			{#each draft.words as word, wi}
				{#each word.gifts as gift, gi}
					<div class="item-row" style="flex-direction:column; align-items:stretch; gap:8px;">
						<div style="display:flex; gap:8px;">
							<input type="text" bind:value={gift.name} placeholder="Gift Name" class="gb-input" style="flex:2;" />
							<span class="gift-meta" style="align-self:center;">{word.name} &bull; {gift.tier}</span>
						</div>
						<div style="display:flex; gap:8px;">
							<select bind:value={gift.tier} class="gb-select" style="flex:1;">
								<option value="Lesser">Lesser</option>
								<option value="Greater">Greater</option>
							</select>
							<select bind:value={gift.type} class="gb-select" style="flex:1;">
								{#each ['Action', '(Smite)Action', 'Constant', 'On Turn', 'Instant', '(Smite)Instant'] as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
							<select bind:value={gift.effort} class="gb-select" style="flex:1;">
								{#each ['None', 'Scene', 'Day', 'Committed'] as effort}
									<option value={effort}>{effort}</option>
								{/each}
							</select>
							<button onclick={() => removeGift(wi, gi)} class="delete-btn">✕</button>
						</div>
						<textarea bind:value={gift.description} placeholder="Effect Description" class="gb-textarea"></textarea>
					</div>
				{/each}
			{/each}
			{#if allGifts.length === 0}
				<p style="font-size:13px; color:var(--muted-foreground);">No gifts yet. Add a Word above, then add gifts to it.</p>
			{/if}
		</div>
	{/if}
</div>
