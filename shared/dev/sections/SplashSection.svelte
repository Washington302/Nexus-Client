<script lang="ts">
	import SplashHeader from '@ui/SplashHeader.svelte';

	let { eyebrow = '' }: { eyebrow?: string } = $props();
</script>

<h2>SplashHeader</h2>
<SplashHeader title="Title" highlight="Highlight" subtitle="Subtitle line" {eyebrow} />
<SplashHeader title="No highlight" subtitle="Subtitle only" {eyebrow} />
