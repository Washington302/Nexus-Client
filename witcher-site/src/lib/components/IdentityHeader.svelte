<script lang="ts">
	import { goto } from '$app/navigation';

	// `editable` gates owner-only chrome: a public share viewer has no profile to open.
	let {
		name,
		portraitUrl = null,
		editable = true
	}: { name: string; portraitUrl?: string | null; editable?: boolean } = $props();
</script>

<header class="identity-bar">
	<div class="identity-left">
		<div class="identity-portrait">
			{#if portraitUrl}
				<img src={portraitUrl} alt={name} />
			{:else}
				{name.charAt(0).toUpperCase() || '?'}
			{/if}
		</div>
		<h1 class="identity-name">{name}</h1>
	</div>
	{#if editable}
		<button class="identity-settings-btn" onclick={() => goto('/profile')} aria-label="Settings"
			>⚙</button
		>
	{/if}
</header>
