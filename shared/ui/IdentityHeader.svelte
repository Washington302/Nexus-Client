<script lang="ts">
	// `editable` gates owner-only chrome: a public share viewer has no profile to open.
	// The destination is a callback rather than a hardcoded route, because where the
	// settings button leads is the consuming app's business, not this component's.
	let {
		name,
		portraitUrl = null,
		editable = true,
		onSettings
	}: {
		name: string;
		portraitUrl?: string | null;
		editable?: boolean;
		onSettings?: () => void;
	} = $props();
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
	{#if editable && onSettings}
		<button class="identity-settings-btn" onclick={onSettings} aria-label="Settings">⚙</button>
	{/if}
</header>
