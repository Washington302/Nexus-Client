<script lang="ts">
	import UiSplashHeader from '@ui/SplashHeader.svelte';

	// Thin wrapper over the shared SplashHeader supplying m&m's fixed eyebrow, so
	// the app's many call sites stay as they were. The halftone texture that used
	// to be a <div class="dots-bg"> here is now .splash-header::before in app.css.
	let {
		title = '',
		highlight = '',
		subtitle = ''
	}: { title?: string; highlight?: string; subtitle?: string } = $props();
</script>

<UiSplashHeader {title} {highlight} {subtitle} eyebrow="★ Character Sheet ★" />
