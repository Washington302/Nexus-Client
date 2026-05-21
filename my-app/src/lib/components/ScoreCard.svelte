<script lang="ts">
  import { COLORS, S } from '../constants';

  let { 
    name = '',
    exp = 0, 
    score = 0,
    highlightScore = false,
    isLast = false,
  } = $props();
  let hovered = $state(false);
    

</script>

<div
  role="row"
  tabindex="0"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  style=
    "width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0px;
    border-bottom: {isLast ? 'none' : `1px solid ${COLORS.outlineVar}`};
    background-color: {hovered ? 'transparent' : COLORS.bgLow};;
    cursor: default;
    transition: background-color 0.15s ease;
    
  "
>
  <!-- Left: XP -->
  <span style="
    font-family: {S.fontBody};
    font-size: 10px;
    color: {COLORS.inkMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex: 1;
    text-align: left;
  ">{exp} xp</span>

  <!-- Middle: Name -->
  <span style="
    font-family: {S.fontHeadline};
    font-size: 14px;
    font-weight: 500;
    color: {hovered ? COLORS.red : COLORS.ink};
    flex: 1;
    text-align: center;
    transition: color 0.15s ease;
  ">{name}</span>

  <!-- Right: Score -->
  <span style="
    font-family: {S.fontHeadline};
    font-size: 14px;
    font-weight: 800;
    color: {hovered ? COLORS.red : COLORS.ink};
    flex: 1;
    text-align: right;
    transition: color 0.15s ease;
  ">{score}</span>
</div>