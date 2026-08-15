<script lang="ts">
	import type { Snippet } from 'svelte';

	// `extra` carries anything an app wants alongside the save controls without
	// pushing it into the shared API — m&m puts its section-reorder control there.
	let {
		saving,
		saveError,
		saveSuccess,
		autosaveDirty = false,
		shareCopied = false,
		shareEnabled = true,
		showShare = true,
		saveLabel = 'Save Character',
		shareCopiedLabel = 'Link Copied!',
		shareDisabledTitle = '',
		onSave,
		onShare,
		extra
	}: {
		saving: boolean;
		saveError: string | null;
		saveSuccess: boolean;
		autosaveDirty?: boolean;
		shareCopied?: boolean;
		shareEnabled?: boolean;
		showShare?: boolean;
		saveLabel?: string;
		shareCopiedLabel?: string;
		shareDisabledTitle?: string;
		onSave: () => void;
		onShare?: () => void;
		extra?: Snippet;
	} = $props();
</script>

<div class="save-bar">
	<div class="save-left">
		<button onclick={onSave} disabled={saving} class="save-btn">
			{saving ? 'Saving...' : saveLabel}
		</button>
		{#if showShare}
			<button
				onclick={onShare}
				disabled={!shareEnabled}
				class="share-btn"
				title={shareEnabled ? '' : shareDisabledTitle}
			>
				{shareCopied ? shareCopiedLabel : 'Share'}
			</button>
		{/if}
		{#if autosaveDirty}
			<span class="autosave-indicator">&bull; Unsaved changes &mdash; autosave in 15s</span>
		{/if}
		{#if saveError}
			<span class="save-error">{saveError}</span>
		{/if}
		{#if saveSuccess}
			<span class="save-success">Saved!</span>
		{/if}
	</div>
	{@render extra?.()}
</div>
