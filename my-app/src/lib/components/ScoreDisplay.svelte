<script lang="ts">
  import { COLORS, S } from '../constants';

  let { score = 0, size = 'lg' } = $props();

  const color = $derived(score > 0 ? COLORS.red : score < 0 ? COLORS.ink : COLORS.inkMuted);
  const fontSize = $derived(size === 'lg' ? 28 : size === 'md' ? 20 : 16);
  const display = $derived(score > 0 ? `+${score}` : score);
</script>

<span style="
  font-family: {S.fontHeadline};
  font-size: {fontSize}px;
  font-weight: 700;
  color: {color};
">{display}</span>