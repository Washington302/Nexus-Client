<script lang="ts">
	let {
		open = $bindable(false),
		title = '',
		onSave,
		children
	} = $props<{
		open: boolean;
		title: string;
		onSave: () => Promise<void>;
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
	}
</script>

{#if open}
	<div class="backdrop" onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} aria-label="Close modal"></div>

	<div class="dialog" role="dialog" aria-modal="true" tabindex="0" onkeydown={(e) => e.key === 'Escape' && handleClose()}>
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

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.5);
		z-index: 100;
		border: none;
		cursor: default;
		width: 100%;
	}
	.dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 6px 6px 0 var(--border);
		width: 90%;
		max-width: 70vw;
		max-height: 80vh;
		overflow-y: auto;
		scrollbar-width: none;
		z-index: 101;
		display: flex;
		flex-direction: column;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border-bottom: 3px solid var(--border);
		background: var(--primary);
		flex-shrink: 0;
	}
	.header-title {
		font-family: 'Bangers', cursive;
		font-size: 20px;
		color: white;
		letter-spacing: 0.04em;
	}
	.close-btn {
		background: none;
		border: 2px solid white;
		color: white;
		font-size: 16px;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		opacity: 0.9;
	}
	.close-btn:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
	.content {
		padding: 16px;
		flex: 1;
		overflow-y: auto;
		scrollbar-width: none;
	}
	.error {
		padding: 8px 16px;
		background: #ffdad6;
		border-top: 2px solid var(--danger);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--danger);
	}
	.footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 12px 16px;
		border-top: 3px solid var(--border);
		background: var(--newsprint);
		flex-shrink: 0;
	}
	.btn-cancel {
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
		background: var(--panel-bg);
		border: 2px solid var(--border);
		padding: 6px 18px;
		cursor: pointer;
	}
	.btn-cancel:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.btn-save {
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: white;
		background: var(--primary);
		border: 2px solid var(--border);
		padding: 6px 18px;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.btn-save:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
