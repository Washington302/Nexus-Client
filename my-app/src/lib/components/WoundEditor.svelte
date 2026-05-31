<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Wound } from '$lib/types';

  let {
    track = $bindable([] as Wound[]),
  } = $props<{
    track: Wound[];
  }>();
</script>

<div style="display: flex; flex-direction: column; gap: 10px;">
  {#each track as wound, i}
    <div style="display: flex; align-items: center; gap: 12px;">
      <span
        style="
          width: 120px;
          font-family: {S.fontBody};
          font-size: 13px;
          font-weight: 600;
          color: {COLORS.ink};
        "
      >{wound.type}</span>
      <label style="
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: {S.fontBody};
        font-size: 12px;
        color: {COLORS.inkMuted};
      ">
        Penalty
        <input
          type="number"
          bind:value={track[i].penalty}
          style="
            width: 50px;
            padding: 4px 6px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 12px;
            color: {COLORS.ink};
            background-color: {COLORS.white};
            text-align: center;
          "
        />
      </label>
      <label style="
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: {S.fontBody};
        font-size: 12px;
        color: {COLORS.inkMuted};
      ">
        Current
        <input
          type="number"
          min="0"
          bind:value={track[i].currentWounds}
          style="
            width: 40px;
            padding: 4px 6px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 12px;
            color: {COLORS.ink};
            background-color: {COLORS.white};
            text-align: center;
          "
        />
        /{wound.maxWounds}
      </label>
    </div>
  {/each}
</div>
