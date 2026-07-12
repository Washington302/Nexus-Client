<script lang="ts">
	let { modifier }: { modifier: any } = $props();

	let hovered = $state(false);
	let tooltipHovered = $state(false);
	let flipUp = $state(false);
	let badgeRef = $state<HTMLSpanElement | null>(null);

	function handleMouseEnter() {
		if (badgeRef) {
			const rect = badgeRef.getBoundingClientRect();
			flipUp = rect.top > 300;
		}
		hovered = true;
	}

	const visible = $derived((hovered || tooltipHovered) && !!modifier.description);
	const costLabel = $derived(
		modifier.flat ? '' : (modifier.type === 'FLAW' ? ' (-' + modifier.costModifier + ')' : ' (+' + modifier.costModifier + ')')
	);
</script>

<span
	class="mod-badge-wrap"
	bind:this={badgeRef}
	style="z-index: {visible ? 100 : 1};"
	onmouseenter={handleMouseEnter}
	onmouseleave={() => hovered = false}
	role="button"
	tabindex="0"
	onfocus={handleMouseEnter}
	onblur={() => hovered = false}
>
	<span class="mod-badge" class:extra={modifier.type === 'EXTRA'} class:flaw={modifier.type === 'FLAW'}>{modifier.name}{costLabel}</span>

	{#if visible}
		<span
			class="mod-badge-bridge"
			class:mod-badge-bridge--up={flipUp}
			onmouseenter={() => tooltipHovered = true}
			onmouseleave={() => tooltipHovered = false}
		></span>

		<span
			class="mod-badge-tooltip"
			class:mod-badge-tooltip--up={flipUp}
			role="tooltip"
			onmouseenter={() => tooltipHovered = true}
			onmouseleave={() => tooltipHovered = false}
		>
			{modifier.description}
		</span>
	{/if}
</span>

<style>
	.mod-badge-wrap {
		position: relative;
		display: inline-block;
	}

	.mod-badge-bridge {
		position: absolute;
		left: 0;
		width: 100%;
		height: 8px;
		top: 100%;
		z-index: 99;
	}

	.mod-badge-bridge--up {
		top: auto;
		bottom: 100%;
	}

	.mod-badge-tooltip {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		background: var(--panel-bg);
		border: 1.5px solid var(--border);
		padding: 8px 10px;
		min-width: 180px;
		max-width: 280px;
		font-family: 'Nunito', sans-serif;
		font-size: 12px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--ink);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		white-space: normal;
		z-index: 100;
	}

	.mod-badge-tooltip--up {
		top: auto;
		bottom: calc(100% + 8px);
	}
</style>
