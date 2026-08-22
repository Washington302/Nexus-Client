<script lang="ts">
	import GalleryShell from '@shared/dev/GalleryShell.svelte';
	import SiteNavSection from '@shared/dev/sections/SiteNavSection.svelte';
	import PillSection from '@shared/dev/sections/PillSection.svelte';
	import RulesReferenceSection from '@shared/dev/sections/RulesReferenceSection.svelte';
	import SplashSection from '@shared/dev/sections/SplashSection.svelte';
</script>

<GalleryShell>
	{#snippet children()}
		<SiteNavSection />
		<PillSection colors={['primary', 'danger']} />
		<SplashSection />
		<RulesReferenceSection />
	{/snippet}
</GalleryShell>
