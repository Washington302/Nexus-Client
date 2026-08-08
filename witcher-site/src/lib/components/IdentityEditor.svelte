<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';

	let { draft }: { draft: WitcherCharacter } = $props();
</script>

<div class="field-group">
	<div class="field-hdr">Name</div>
	<input class="input-demo" type="text" bind:value={draft.name} />
</div>

<!-- Age and Gender have no home on the backend yet, so they are accepted and dropped
     on save. Flagged in the UI rather than left to look like a bug — see §8 of
     BACKEND-REQUESTS.md. Delete the hint once the fields ship. -->
<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Age</div>
		<input class="input-demo input-num" type="number" min="0" bind:value={draft.age} />
	</div>
	<div class="field-group">
		<div class="field-hdr">Gender</div>
		<input class="input-demo" type="text" bind:value={draft.gender} />
	</div>
</div>
<span class="field-hint" style="display:block;margin:-4px 0 12px;">
	Age and Gender are not stored yet — the backend has no field for them, so they reset on save.
	Everything else here persists.
</span>

<div class="field-group">
	<div class="field-hdr">Portrait Image URL</div>
	<input class="input-demo" type="url" bind:value={draft.portraitUrl} placeholder="https://..." />
</div>

<!-- Background/campaign notes live on the Background tab as Campaign Information. -->

<div class="field-group">
	<label class="checkbox-row">
		<input type="checkbox" bind:checked={draft.public} />
		<span>Public — anyone with the share link can view this sheet</span>
	</label>
</div>
