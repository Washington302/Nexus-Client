<script lang="ts">
  import SiteNav from '$lib/components/SiteNav.svelte';
  import CharacterNav from '$lib/components/CharacterNav.svelte';
  import { session } from '$lib/stores/session.svelte';

  let { children } = $props();

  let user = $derived(
    session.userId
      ? { id: session.userId, displayName: session.username ?? '', role: 'PLAYER' as const }
      : null,
  );

  let saga = $derived(
    session.activeCampaign && 'tribunalRegion' in session.activeCampaign
      ? session.activeCampaign as import('$lib/types/campaign').ArsMagicaSaga
      : null,
  );
</script>

<SiteNav {saga} {user} />
{#if session.activeCharacter}
  <CharacterNav character={session.activeCharacter} />
{/if}

{@render children()}
