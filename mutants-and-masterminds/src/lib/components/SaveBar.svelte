<script lang="ts">
	let { saving, saveError, saveSuccess, shareCopied, autosaveDirty, priorityOrder, onSave, onShare, onMove }:
		{ saving: boolean; saveError: string | null; saveSuccess: boolean; shareCopied: boolean; autosaveDirty: boolean; priorityOrder: string[]; onSave: () => void; onShare: () => void; onMove: (i: number, to: number) => void } = $props();
</script>

<div class="save-bar">
	<div class="save-left">
		<button onclick={onSave} disabled={saving} class="save-btn">
			{saving ? 'Saving...' : 'Save Character'}
		</button>
		<button onclick={onShare} class="share-btn">
			{shareCopied ? 'Copied!' : 'Share'}
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
	<div class="priority-controls">
		<span class="priority-label">Section order:</span>
		{#each priorityOrder as key, i}
			<div class="priority-item">
				<span class="priority-name">{key}</span>
				<button class="move-btn" onclick={() => onMove(i, i - 1)} disabled={i === 0}>&#9650;</button>
				<button class="move-btn" onclick={() => onMove(i, i + 1)} disabled={i === priorityOrder.length - 1}>&#9660;</button>
			</div>
		{/each}
	</div>
</div>

