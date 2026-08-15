<script lang="ts">
	import EditModal from '@ui/EditModal.svelte';

	let plainOpen = $state(false);
	let errorOpen = $state(false);
	let slowOpen = $state(false);

	const succeed = async () => {};
	const fail = async () => {
		throw new Error('Save failed — this is the .error class rendering.');
	};
	const slow = async () => {
		await new Promise((r) => setTimeout(r, 1500));
	};
</script>

<h2>EditModal</h2>
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
	<button onclick={() => (plainOpen = true)}>Open (saves cleanly)</button>
	<button onclick={() => (errorOpen = true)}>Open (save throws → .error)</button>
	<button onclick={() => (slowOpen = true)}>Open (slow save → disabled state)</button>
</div>

<EditModal bind:open={plainOpen} title="Plain modal" onSave={succeed}>
	{#snippet children()}<p>Cancel and ✕ both close without saving.</p>{/snippet}
</EditModal>
<EditModal bind:open={errorOpen} title="Save failure" onSave={fail}>
	{#snippet children()}<p>Press Save — the message renders in <code>.error</code>.</p>{/snippet}
</EditModal>
<EditModal bind:open={slowOpen} title="Slow save" onSave={slow}>
	{#snippet children()}<p>Press Save — buttons disable for 1.5s.</p>{/snippet}
</EditModal>
