<script lang="ts">
	import type { MythrasCharacter } from '$lib/services/api';

	let { draft }: { draft: MythrasCharacter } = $props();
</script>

<div class="field-group">
	<div class="field-hdr">Character Name</div>
	<input class="input-demo" bind:value={draft.name} placeholder="Character Name" />
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Culture</div>
		<input class="input-demo" bind:value={draft.raceCulture} placeholder="e.g. Civilised" />
	</div>
	<div class="field-group">
		<div class="field-hdr">Career</div>
		<input class="input-demo" bind:value={draft.career} placeholder="e.g. Warrior" />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Player Name</div>
		<input class="input-demo" bind:value={draft.player} />
	</div>
	<div class="field-group">
		<div class="field-hdr">Homeland</div>
		<input class="input-demo" bind:value={draft.homeland} />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Gender</div>
		<input class="input-demo" bind:value={draft.gender} />
	</div>
	<div class="field-group">
		<div class="field-hdr">Age</div>
		<input class="input-demo" bind:value={draft.age} />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Height</div>
		<input class="input-demo" bind:value={draft.height} />
	</div>
	<div class="field-group">
		<div class="field-hdr">Weight</div>
		<input class="input-demo" bind:value={draft.weight} />
	</div>
</div>
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Handedness</div>
		<input class="input-demo" bind:value={draft.handedness} />
	</div>
	<div class="field-group">
		<div class="field-hdr">Social Class</div>
		<input class="input-demo" bind:value={draft.socialClass} />
	</div>
</div>
<div class="field-group">
	<div class="field-hdr">Description</div>
	<input class="input-demo" bind:value={draft.description} />
</div>
