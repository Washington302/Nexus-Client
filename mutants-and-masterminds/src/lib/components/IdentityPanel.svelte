<script lang="ts">
	let { draft }: { draft: any } = $props();
</script>

<div class="field-group">
	<div class="field-hdr">Hero Name</div>
	<input class="input-demo" bind:value={draft.name} placeholder="Hero Name" />
</div>
<div class="field-group">
	<div class="field-hdr">Real Name</div>
	<input class="input-demo" bind:value={draft.realName} placeholder="Real Name" />
</div>
<div class="field-group">
	<div class="field-hdr">Identity</div>
	<select class="input-demo" bind:value={draft.identity}>
		<option value="SECRET">Secret</option>
		<option value="PUBLIC">Public</option>
		<option value="DUAL">Dual</option>
	</select>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Gender</div>
		<input class="input-demo" bind:value={draft.gender} placeholder="Gender" />
	</div>
	<div class="field-group">
		<div class="field-hdr">Age</div>
		<input class="input-demo" bind:value={draft.age} placeholder="Age" />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Height</div>
		<input class="input-demo" bind:value={draft.height} placeholder="Height" />
	</div>
	<div class="field-group">
		<div class="field-hdr">Weight</div>
		<input class="input-demo" bind:value={draft.weight} placeholder="Weight" />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Eyes</div>
		<input class="input-demo" bind:value={draft.eyes} placeholder="Eyes" />
	</div>
	<div class="field-group">
		<div class="field-hdr">Hair</div>
		<input class="input-demo" bind:value={draft.hair} placeholder="Hair" />
	</div>
</div>
<div class="field-group">
	<div class="field-hdr">Group Affiliation</div>
	<input class="input-demo" bind:value={draft.groupAffiliation} placeholder="Group Affiliation" />
</div>
<div class="field-group">
	<div class="field-hdr">Base of Operations</div>
	<input class="input-demo" bind:value={draft.baseOfOperations} placeholder="Base of Operations" />
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Power Level</div>
		<input class="input-demo input-num" type="number" bind:value={draft.powerLevel} />
	</div>
</div>

