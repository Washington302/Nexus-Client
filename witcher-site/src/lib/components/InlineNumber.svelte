<script lang="ts">
	import { focusOnMount } from '$lib/utils/actions';

	// Click-to-edit number. Live-play values (damage taken, a drained stat, the Vigor
	// threshold) change constantly, so a modal per edit is too heavy — but a permanent
	// input box makes the sheet read as a form. This shows the value as text until it
	// is clicked, then swaps in an input and swaps back on blur.
	let {
		value = $bindable(),
		fallback,
		min,
		max,
		step,
		label,
		viewClass = '',
		editClass = '',
		editable = true
	}: {
		value: number | null | undefined;
		/** Shown (and seeded into the input on open) when `value` is unset. */
		fallback?: number;
		min?: number;
		max?: number;
		step?: number;
		label: string;
		viewClass?: string;
		editClass?: string;
		editable?: boolean;
	} = $props();

	let editing = $state(false);
	// The input binds straight to the draft, so every keystroke is already committed by
	// the time Escape is pressed — stash the entry value so it has something to restore.
	let stash: number | null | undefined;

	const shown = $derived(value ?? fallback);

	function open() {
		stash = value;
		// Seed from the fallback so clicking a value that reads "8" opens on 8 rather
		// than an empty box the player has to retype.
		if (value == null && fallback != null) value = fallback;
		editing = true;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			value = stash;
			editing = false;
		} else if (event.key === 'Enter') {
			editing = false;
		}
	}
</script>

{#if !editable}
	<span class={viewClass}>{shown}</span>
{:else if editing}
	<input
		class={editClass}
		type="number"
		{min}
		{max}
		{step}
		aria-label={label}
		bind:value
		use:focusOnMount
		onblur={() => (editing = false)}
		{onkeydown}
	/>
{:else}
	<button type="button" class="inline-num-btn {viewClass}" aria-label="Edit {label}" onclick={open}>
		{shown}
	</button>
{/if}
