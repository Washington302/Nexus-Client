<script lang="ts">
	import GalleryShell from '@shared/dev/GalleryShell.svelte';
	import SiteNavSection from '@shared/dev/sections/SiteNavSection.svelte';
	import EditModalSection from '@shared/dev/sections/EditModalSection.svelte';
	import PanelSection from '@shared/dev/sections/PanelSection.svelte';
	import PillSection from '@shared/dev/sections/PillSection.svelte';
</script>

<GalleryShell>
	{#snippet children()}
		<EditModalSection />
		<PanelSection colors={['primary', 'gold', 'teal', 'plain']} />
		<SiteNavSection />
		<PillSection colors={['primary', 'gold', 'error']} />
	{/snippet}
</GalleryShell>
