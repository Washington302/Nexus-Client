<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Reputation } from "$lib/types";

  let { reputations = $bindable([]) } = $props<{ reputations: Reputation[] }>();

  let adding = $state(false);
  let newName = $state('');
  let newType = $state('HERMETIC');
  let newScore = $state(1);
  let newScope = $state('');
</script>

<div
  style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
"
>
  <div
    style="
    background-color: {COLORS.bgLow};
    padding: 6px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  "
  >
    <span
      style="
      font-family: {S.fontBody};
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Reputations</span
    >
    <button onclick={() => adding = true} style="padding:4px 10px; border:1px dashed {COLORS.outlineVar}; border-radius:4px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;">+ Add</button>
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      {#each reputations as rep, i}
        <tr
          style="background-color: {i % 2 === 0 ? COLORS.bgLow : COLORS.white};"
        >
          <td
            style="
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          "
          >
            <div
              style="
              font-family: {S.fontBody};
              font-size: 14px;
              font-style: italic;
              color: {COLORS.ink};
            "
            >
              {rep.name}
            </div>
            <div
              style="
              font-family: {S.fontBody};
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: {COLORS.inkMuted};
            "
            >
              {rep.type} · {rep.scope}
            </div>
          </td>
          <td
            style="
            font-family: {S.fontHeadline};
            font-size: 18px;
            font-weight: 700;
            color: {COLORS.ink};
            text-align: right;
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">{rep.score}</td
          >
          <td style="padding: 8px 4px; border-bottom: 1px solid {COLORS.outlineVar}; text-align: center;">
            <button
              onclick={() => { reputations = reputations.filter((_r: Reputation, idx: number) => idx !== i); }}
              style="
                width: 22px; height: 22px;
                border: none; border-radius: 50%;
                background: transparent;
                color: {COLORS.red};
                cursor: pointer;
                font-size: 12px;
                display: flex; align-items: center; justify-content: center;
                padding: 0;
              "
              aria-label="Remove {rep.name}"
            >✕</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if adding}
    <div style="display:flex; align-items:center; gap:8px; padding:8px 12px; border-top:1px solid {COLORS.outlineVar};">
      <input type="text" bind:value={newName} placeholder="Name" style="flex:1; padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;" />
      <select bind:value={newType} style="padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:11px;">
        <option value="HERMETIC">Hermetic</option>
        <option value="MUNDANE">Mundane</option>
        <option value="FAERIE">Faerie</option>
        <option value="INFERNAL">Infernal</option>
        <option value="DIVINE">Divine</option>
      </select>
      <input type="text" bind:value={newScope} placeholder="Scope" style="width:100px; padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;" />
      <input type="number" bind:value={newScore} min="-5" max="5" style="width:50px; padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center;" />
      <button onclick={() => { if (newName) { reputations = [...reputations, { name: newName, type: newType, score: newScore, scope: newScope, xp: 0 }]; newName = ''; newScope = ''; newScore = 1; adding = false; } }} disabled={!newName} style="padding:4px 10px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.white}; font-family:{S.fontBody}; font-size:11px; cursor:pointer;">Add</button>
      <button onclick={() => adding = false} style="padding:4px 10px; border:none; background:transparent; font-family:{S.fontBody}; font-size:11px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
    </div>
  {/if}
</div>
