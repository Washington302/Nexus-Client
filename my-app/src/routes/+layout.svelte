<script lang="ts">
  import SiteNav from '$lib/components/SiteNav.svelte';
  import CharacterNav from '$lib/components/CharacterNav.svelte';
  import { character } from '$lib/data/character';
  

  let { children } = $props();

  const saga = {
    id: 'saga_rhine_01',
    name: 'The Rhine Tribunal',
    tribunalRegion: 'Greater Alps'
  };

  const user = {
    userId: 'user_kaleb',
    displayName: 'Kaleb',
    role: 'OWNER' as const
  };

  const characterInfo = {
    name: character.name,
    house: character.hermeticData.house,
    covenant: character.covenant,
  };
</script>

<SiteNav {saga} {user} />
<CharacterNav character={characterInfo} />

{@render children()}