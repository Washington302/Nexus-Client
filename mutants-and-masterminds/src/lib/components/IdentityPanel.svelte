<script lang="ts">
	let { draft, editable = true }: { draft: any; editable?: boolean } = $props();
</script>

<div class="field-group">
	<div class="field-hdr">Hero Name</div>
	{#if editable}
		<input class="input-demo" bind:value={draft.name} placeholder="Hero Name" />
	{:else}
		<div class="static-demo">{draft.name || '—'}</div>
	{/if}
</div>
<div class="field-group">
	<div class="field-hdr">Real Name</div>
	{#if editable}
		<input class="input-demo" bind:value={draft.realName} placeholder="Real Name" />
	{:else}
		<div class="static-demo">{draft.realName || '—'}</div>
	{/if}
</div>
<div class="field-group">
	<div class="field-hdr">Identity</div>
	{#if editable}
		<select class="input-demo" bind:value={draft.identity}>
			<option value="SECRET">Secret</option>
			<option value="PUBLIC">Public</option>
			<option value="DUAL">Dual</option>
		</select>
	{:else}
		<div class="static-demo">{draft.identity || '—'}</div>
	{/if}
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Gender</div>
		{#if editable}
			<input class="input-demo" bind:value={draft.gender} placeholder="Gender" />
		{:else}
			<div class="static-demo">{draft.gender || '—'}</div>
		{/if}
	</div>
	<div class="field-group">
		<div class="field-hdr">Age</div>
		{#if editable}
			<input class="input-demo" bind:value={draft.age} placeholder="Age" />
		{:else}
			<div class="static-demo">{draft.age || '—'}</div>
		{/if}
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Height</div>
		{#if editable}
			<input class="input-demo" bind:value={draft.height} placeholder="Height" />
		{:else}
			<div class="static-demo">{draft.height || '—'}</div>
		{/if}
	</div>
	<div class="field-group">
		<div class="field-hdr">Weight</div>
		{#if editable}
			<input class="input-demo" bind:value={draft.weight} placeholder="Weight" />
		{:else}
			<div class="static-demo">{draft.weight || '—'}</div>
		{/if}
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Eyes</div>
		{#if editable}
			<input class="input-demo" bind:value={draft.eyes} placeholder="Eyes" />
		{:else}
			<div class="static-demo">{draft.eyes || '—'}</div>
		{/if}
	</div>
	<div class="field-group">
		<div class="field-hdr">Hair</div>
		{#if editable}
			<input class="input-demo" bind:value={draft.hair} placeholder="Hair" />
		{:else}
			<div class="static-demo">{draft.hair || '—'}</div>
		{/if}
	</div>
</div>
<div class="field-group">
	<div class="field-hdr">Group Affiliation</div>
	{#if editable}
		<input class="input-demo" bind:value={draft.groupAffiliation} placeholder="Group Affiliation" />
	{:else}
		<div class="static-demo">{draft.groupAffiliation || '—'}</div>
	{/if}
</div>
<div class="field-group">
	<div class="field-hdr">Base of Operations</div>
	{#if editable}
		<input class="input-demo" bind:value={draft.baseOfOperations} placeholder="Base of Operations" />
	{:else}
		<div class="static-demo">{draft.baseOfOperations || '—'}</div>
	{/if}
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Power Level</div>
		{#if editable}
			<input class="input-demo input-num" type="number" bind:value={draft.powerLevel} />
		{:else}
			<div class="static-demo">{draft.powerLevel ?? '—'}</div>
		{/if}
	</div>
</div>
