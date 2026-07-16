<script lang="ts">
	import { goto } from '$app/navigation';

	let { name, portraitUrl = null }: { name: string; portraitUrl?: string | null } = $props();
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
	<button class="identity-settings-btn" onclick={() => goto('/profile')} aria-label="Settings"
		>⚙</button
	>
</header>
