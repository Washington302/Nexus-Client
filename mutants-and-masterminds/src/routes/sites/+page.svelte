<script lang="ts">
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';

	const sites: { href: string; label: string; desc: string }[] = [];
</script>

<div class="page">
	<SplashHeader title="My Other" highlight="Sites" subtitle="Everything else I'm building" />

	<ComicPanel header="★ Coming Soon" color="dark">
		{#if sites.length}
			<div class="card-grid">
				{#each sites as site}
					<a href={site.href} class="dash-card" target="_blank" rel="noopener noreferrer">
						<div class="dash-card-header">
							<span class="dash-card-icon">★</span>
							<span class="dash-card-label">{site.label}</span>
						</div>
						<p class="dash-card-desc">{site.desc}</p>
						<span class="dash-card-open">Visit &#8594;</span>
					</a>
				{/each}
			</div>
		{:else}
			<p style="font-family:'Nunito',sans-serif;font-size:11px;line-height:1.6;color:var(--ink);">
				Links to my other projects will show up here soon. Check back later!
			</p>
		{/if}
	</ComicPanel>
</div>
