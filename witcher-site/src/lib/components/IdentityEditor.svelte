<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';

	let { draft }: { draft: WitcherCharacter } = $props();
</script>

<div class="field-group">
	<div class="field-hdr">Name</div>
	<input class="input-demo" type="text" bind:value={draft.name} />
</div>

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
