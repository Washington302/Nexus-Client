<script lang="ts">
  import CharacterSheet from '$lib/components/CharacterSheet.svelte';
  import { character } from '$lib/data/character';
</script>

<CharacterSheet {character} />