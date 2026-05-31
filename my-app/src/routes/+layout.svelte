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
</script>

<SiteNav saga={null} {user} />
{#if session.activeCharacter}
  <CharacterNav character={session.activeCharacter} />
{/if}

{@render children()}
