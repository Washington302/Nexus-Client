/** Svelte action: focuses and selects an input as soon as it mounts (used for click-to-edit fields). */
export function focusOnMount(node: HTMLInputElement) {
	node.focus();
	node.select();
}
