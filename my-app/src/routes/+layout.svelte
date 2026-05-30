<script lang="ts">
  import SiteNav from '$lib/components/SiteNav.svelte';
  import CharacterNav from '$lib/components/CharacterNav.svelte';
  import { character } from '$lib/data/character';
  import type { ArsMagicaSaga } from '$lib/types/campaign'; // Adjust path if needed

  let { children } = $props();

  // Modeled explicitly after the ArsMagicaSaga contract
  const saga: ArsMagicaSaga = {
    id: 'saga_rhine_01',
    name: 'The Rhine Tribunal',
    gameSystem: 'ARS_MAGICA',
    ownerUserId: 'user_kaleb',
    members: [
      { userId: 'user_kaleb', displayName: 'Kaleb', role: 'OWNER' }
    ],
    sharedCharacters: [],
    covenantId: 'covenant_rhine_01',
    tribunalRegion: 'Greater Alps',
    allowHouseMercereVirtues: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Structured correctly for the NavUser contract
  const user = {
    id: 'user_kaleb',
    displayName: 'Kaleb',
    role: 'OWNER' as const
  };

  const characterInfo = {
    name: character.name,
    house: character.hermeticData?.house ?? '',
    covenant: character.covenant,
  };
</script>

<SiteNav {saga} {user} />
<CharacterNav {character} />

{@render children()}