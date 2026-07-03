<script lang="ts">
	let { saving, saveError, saveSuccess, onSave }:
		{ saving: boolean; saveError: string | null; saveSuccess: boolean; onSave: () => void } = $props();
</script>

<div class="save-bar">
	<button onclick={onSave} disabled={saving} class="gb-btn">
		{saving ? 'Saving...' : 'Save Changes'}
	</button>
	{#if saveError}
		<span class="save-error">{saveError}</span>
	{/if}
	{#if saveSuccess}
		<span class="save-success">Saved!</span>
	{/if}
</div>

<style>
	.save-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		margin-bottom: 16px;
		background: var(--background);
	}
	.save-error { color: var(--destructive); font-size: 13px; }
	.save-success { color: var(--success); font-size: 13px; }
</style>
