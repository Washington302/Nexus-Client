<script lang="ts">
	let {
		saving,
		saveError,
		saveSuccess,
		autosaveDirty,
		shareCopied,
		shareEnabled = true,
		onSave,
		onShare
	}: {
		saving: boolean;
		saveError: string | null;
		saveSuccess: boolean;
		autosaveDirty: boolean;
		shareCopied: boolean;
		shareEnabled?: boolean;
		onSave: () => void;
		onShare: () => void;
	} = $props();
</script>

<div class="save-bar">
	<div class="save-left">
		<button onclick={onSave} disabled={saving} class="save-btn">
			{saving ? 'Saving...' : 'Save Character'}
		</button>
		<button
			onclick={onShare}
			disabled={!shareEnabled}
			class="comic-btn secondary"
			title={shareEnabled ? '' : 'Mark this character Public in Identity to enable sharing'}
		>
			{shareCopied ? 'Link Copied!' : 'Share'}
		</button>
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
</div>
