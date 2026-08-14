<!--
	Shared-component gallery — every component in shared/ui, in every prop
	permutation, rendered in the consuming app's own theme.

	Each app mounts this at src/routes/dev/gallery/+page.svelte in three lines,
	so adding a component here surfaces it in all four galleries at once.

	Lives in shared/dev, not shared/ui, so check-contract.mjs does not mistake
	it for a product component.

	Dev-only: renders nothing in a production build.
-->
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

{#if import.meta.env.DEV}
	<h1>Shared component gallery</h1>
	<p>
		Every component in <code>shared/ui</code>, in this app's theme. If something here looks
		unstyled, this app is missing a class the component emits — run
		<code>npm run check:contract</code>.
	</p>

	<h2>EditModal</h2>
	<p>
		Classes: <code>.backdrop .dialog .header .header-title .close-btn .content .error .footer
			.btn-cancel .btn-save</code
		>
	</p>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<button onclick={() => (plainOpen = true)}>Open (saves cleanly)</button>
		<button onclick={() => (errorOpen = true)}>Open (save throws → .error)</button>
		<button onclick={() => (slowOpen = true)}>Open (slow save → disabled state)</button>
	</div>

	<EditModal bind:open={plainOpen} title="Plain modal" onSave={succeed}>
		{#snippet children()}
			<p>Body content goes here. Cancel and ✕ both close without saving.</p>
		{/snippet}
	</EditModal>

	<EditModal bind:open={errorOpen} title="Save failure" onSave={fail}>
		{#snippet children()}
			<p>Press Save — the thrown message should render in the <code>.error</code> row.</p>
		{/snippet}
	</EditModal>

	<EditModal bind:open={slowOpen} title="Slow save" onSave={slow}>
		{#snippet children()}
			<p>Press Save — buttons disable and the label reads “Saving...” for 1.5s.</p>
		{/snippet}
	</EditModal>
{/if}
