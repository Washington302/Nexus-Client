<script lang="ts">
	let {
		open = $bindable(false),
		title = '',
		onSave,
		onCancel,
		children
	} = $props<{
		open: boolean;
		title: string;
		onSave: () => Promise<void>;
		onCancel?: () => void;
		children?: any;
	}>();

	let saving = $state(false);
	let error = $state<string | null>(null);

	async function handleSave() {
		saving = true;
		error = null;
		try {
			await onSave();
			open = false;
		} catch (e) {
			error = (e as Error).message;
		} finally {
			saving = false;
		}
	}

	function handleClose() {
		if (saving) return;
		open = false;
		error = null;
		onCancel?.();
	}
</script>

{#if open}
	<div
		class="backdrop"
		role="presentation"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		aria-label="Close modal"
	></div>

	<div
		class="dialog"
		role="dialog"
		aria-modal="true"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
	>
		<div class="header">
			<span class="header-title">{title}</span>
			<button class="close-btn" onclick={handleClose} disabled={saving}>&#10005;</button>
		</div>

		<div class="content">
			{@render children?.()}
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<div class="footer">
			<button class="btn-cancel" onclick={handleClose} disabled={saving}>Cancel</button>
			<button class="btn-save" onclick={handleSave} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
		</div>
	</div>
{/if}
