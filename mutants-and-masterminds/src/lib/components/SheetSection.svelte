<script lang="ts">
	import type { Snippet } from 'svelte';
	import UiSheetSection from '@ui/SheetSection.svelte';

	// Thin wrapper over the shared SheetSection. It supplies m&m's `★ ` header
	// ornament and narrows `color` to this app's palette, so the many call sites
	// in CharacterSheet.svelte stay exactly as they were and the shared component
	// stays free of per-game special cases.
	let {
		title,
		color,
		editable = false,
		view,
		edit,
		onOpen,
		onCancel
	}: {
		title: string;
		color: 'red' | 'yellow' | 'blue' | 'dark';
		editable?: boolean;
		view: Snippet;
		edit?: Snippet;
		onOpen?: () => void;
		onCancel?: () => void;
	} = $props();
</script>

<UiSheetSection {title} {color} headerPrefix="★ " {editable} {view} {edit} {onOpen} {onCancel} />
