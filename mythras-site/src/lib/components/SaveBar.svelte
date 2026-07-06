<script lang="ts">
	let {
		saving,
		saveError,
		saveSuccess,
		autosaveDirty,
		onSave
	}: {
		saving: boolean;
		saveError: string | null;
		saveSuccess: boolean;
		autosaveDirty: boolean;
		onSave: () => void;
	} = $props();
</script>

<div class="save-bar">
	<div class="save-left">
		<button onclick={onSave} disabled={saving} class="save-btn">
			{saving ? 'Saving...' : 'Save Character'}
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
