<script lang="ts">
	import GalleryShell from '@shared/dev/GalleryShell.svelte';
	import SiteNavSection from '@shared/dev/sections/SiteNavSection.svelte';
	import EditModalSection from '@shared/dev/sections/EditModalSection.svelte';
	import PanelSection from '@shared/dev/sections/PanelSection.svelte';
	import PillSection from '@shared/dev/sections/PillSection.svelte';
	import SplashSection from '@shared/dev/sections/SplashSection.svelte';
	import StatBubbleSection from '@shared/dev/sections/StatBubbleSection.svelte';
</script>

<GalleryShell>
	{#snippet children()}
		<EditModalSection />
		<PanelSection colors={['red', 'yellow', 'blue', 'dark']} headerPrefix="★ " />
		<SiteNavSection />
		<PillSection colors={['primary', 'danger']} />
		<StatBubbleSection colors={['default', 'danger', 'success', 'secondary']} />
		<SplashSection eyebrow="★ Character Sheet ★" />
	{/snippet}
</GalleryShell>
