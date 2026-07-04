<script lang="ts">
	let { modifier, onRemove }: { modifier: any; onRemove: () => void } = $props();
</script>

<div class="mod-row-wrap">
	<div class="mod-row">
		<input type="text" class="mod-input" bind:value={modifier.name} placeholder="Modifier name" />
		<select class="mod-type-select" bind:value={modifier.type}>
			<option value="EXTRA">Extra</option>
			<option value="FLAW">Flaw</option>
		</select>
		<div class="mod-meta">
			<label class="sm-label">Cost</label>
			<input type="number" class="sm-input sm-input-sm" bind:value={modifier.costModifier} />
		</div>
		<label class="flat-toggle">
			<input type="checkbox" checked={modifier.flat} onchange={() => modifier.flat = !modifier.flat} />
			<span class="sm-label">Flat</span>
		</label>
		<button class="remove-btn sm" onclick={onRemove}>&#10005;</button>
	</div>
	<input type="text" class="mod-input mod-desc-input" bind:value={modifier.description} placeholder="Describe why this modifier applies..." />
</div>

