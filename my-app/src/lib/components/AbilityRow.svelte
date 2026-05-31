<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { abilityScoreFromXp } from '$lib/utils/arsmagica';

  let {
    name = '',
    exp = 0,
    specialty = '',
    category = '',
    isLast = false
  } = $props();

  const score = $derived(abilityScoreFromXp(exp));

  let hovered = $state(false);
</script>

<button
  class="ability-row"
  class:ability-row--last={isLast}
  style="background-color: {hovered ? 'transparent' : COLORS.bgLow};"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
>
  <!-- Left: XP -->
  <span class="ability-row__xp">{exp} xp</span>

  <!-- Middle: Name + Specialty -->
  <div class="ability-row__name">
    <span style="color: {hovered ? COLORS.red : COLORS.ink};">{name}</span>
    <span class="ability-row__specialty">Specialty: {specialty}</span>
  </div>

  <!-- Right: Score -->
  <span class="ability-row__score" style="color: {hovered ? COLORS.red : COLORS.ink};">{score}</span>
</button>

<style>
  .ability-row {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 10px 0;
    border: none;
    border-bottom: 1px solid var(--outline-var, #c8c7be);
    cursor: default;
    transition: background-color 0.15s ease;
    text-align: left;
    box-sizing: border-box;
  }

  .ability-row--last {
    border-bottom: none;
  }

  .ability-row__xp {
    font-size: 10px;
    color: var(--ink-muted, #474741);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: 52px;
    flex-shrink: 0;
    text-align: left;
  }

  .ability-row__name {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.15s ease;
  }

  .ability-row__specialty {
    font-size: 11px;
    color: var(--ink-muted, #474741);
    font-style: italic;
  }

  .ability-row__score {
    font-size: 16px;
    font-weight: 800;
    width: 32px;
    text-align: right;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }
</style>