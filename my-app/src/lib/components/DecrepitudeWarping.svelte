<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import Modal from './Modal.svelte';
  import { evaluateAgingRoll } from '$lib/utils/aging';
  import type { CoreCharacteristicName } from '$lib/types/shared';

  let { 
    decrepitudePoints = $bindable(0), 
    warpingPoints = $bindable(0),
    warpingEffects = $bindable(''),
    agingPoints = $bindable({} as Record<string, number>),
    characteristics = $bindable({ scores: {} as Record<string, number> }),
    onSave = async (_field: string, _data: unknown) => {},
  } = $props();

  let agingModalOpen = $state(false);
  let warpingModalOpen = $state(false);
  let rollModalOpen = $state(false);

  // Editable copies
  let localAgingPoints = $state({} as Record<string, number>);
  let localWarping = $state(0);
  let localWarpingEffects = $state('');
  let newAgingKey = $state('');

  // Derived scores
  let decrepitudeScore = $derived(decrepitudePoints);
  let warpingScore = $derived(Math.floor(warpingPoints / 5));

  // Aging roll state
  let agingTotal = $state(0);
  let rollChar = $state<CoreCharacteristicName>('STAMINA');
  let rollResult = $state<ReturnType<typeof evaluateAgingRoll> | null>(null);

  const coreChars: CoreCharacteristicName[] = [
    'INTELLIGENCE', 'PERCEPTION', 'STRENGTH', 'STAMINA',
    'PRESENCE', 'COMMUNICATION', 'DEXTERITY', 'QUICKNESS',
  ];

  function openAging() {
    localAgingPoints = { ...agingPoints };
    newAgingKey = '';
    agingModalOpen = true;
  }

  function openWarping() {
    localWarping = warpingPoints;
    localWarpingEffects = warpingEffects;
    warpingModalOpen = true;
  }

  function openRoll() {
    agingTotal = 0;
    rollChar = 'STAMINA';
    rollResult = null;
    rollModalOpen = true;
  }

  async function saveAging() {
    await onSave('agingPoints', localAgingPoints);
    agingPoints = { ...localAgingPoints };
    agingModalOpen = false;
  }

  async function saveWarping() {
    await onSave('warpingPoints', localWarping);
    await onSave('warpingEffects', localWarpingEffects);
    warpingPoints = localWarping;
    warpingEffects = localWarpingEffects;
    warpingModalOpen = false;
  }

  function addAgingPoint(stat: string) {
    localAgingPoints[stat] = (localAgingPoints[stat] ?? 0) + 1;
    localAgingPoints = { ...localAgingPoints };
  }

  function removeAgingPoint(stat: string) {
    const current = localAgingPoints[stat] ?? 0;
    if (current > 0) {
      localAgingPoints[stat] = current - 1;
      if (localAgingPoints[stat] === 0) {
        const { [stat]: _, ...rest } = localAgingPoints;
        localAgingPoints = rest;
      } else {
        localAgingPoints = { ...localAgingPoints };
      }
    }
  }

  function addNewAgingKey() {
    const key = newAgingKey.trim();
    if (key && !(key in localAgingPoints)) {
      localAgingPoints[key] = 1;
      localAgingPoints = { ...localAgingPoints };
      newAgingKey = '';
    }
  }

  function resolveRoll() {
    rollResult = evaluateAgingRoll(
      agingTotal,
      rollChar,
      decrepitudePoints,
      localAgingPoints,
      characteristics.scores as Record<CoreCharacteristicName, number>,
    );
  }

  async function applyRoll() {
    const result = rollResult;
    if (!result) return;
    await onSave('agingPoints', result.updatedAgingPoints);
    await onSave('decrepitudePoints', result.updatedDecrepitudePoints);
    await onSave('characteristics', { scores: result.updatedCharacteristics });
    decrepitudePoints = result.updatedDecrepitudePoints;
    agingPoints = { ...result.updatedAgingPoints };
    characteristics = { scores: { ...result.updatedCharacteristics } };
    localAgingPoints = { ...result.updatedAgingPoints };
    rollModalOpen = false;
    rollResult = null;
  }
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <!-- Header -->
  <div style="
    background-color: {COLORS.bgLow};
    border-bottom: 1px solid {COLORS.outlineVar};
    padding: 6px 12px;
  ">
    <span style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: {COLORS.red};
    ">Decrepitude & Warping</span>
  </div>

  <!-- Scores -->
  <div style="display: grid; grid-template-columns: 1fr 1fr;">

    <!-- Decrepitude -->
    <button
      onclick={openAging}
      style="
        padding: 10px 12px;
        text-align: center;
        border: none;
        border-right: 1px solid {COLORS.outlineVar};
        background: none;
        cursor: pointer;
        transition: background-color 0.15s ease;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHigh}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
    >
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 2px;
      ">Decrepitude Score</div>
      <div style="
        font-family: {S.fontHeadline};
        font-size: 24px;
        font-weight: 800;
        color: {decrepitudeScore > 0 ? COLORS.red : COLORS.ink};
      ">{decrepitudeScore}</div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        color: {COLORS.inkMuted};
      ">{decrepitudePoints} pts</div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        color: {COLORS.inkMuted};
        font-style: italic;
        margin-top: 2px;
      ">click for effects</div>
    </button>

    <!-- Warping -->
    <button
      onclick={openWarping}
      style="
        padding: 10px 12px;
        text-align: center;
        border: none;
        background: none;
        cursor: pointer;
        transition: background-color 0.15s ease;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHigh}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
    >
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
        margin-bottom: 2px;
      ">Warping Score</div>
      <div style="
        font-family: {S.fontHeadline};
        font-size: 24px;
        font-weight: 800;
        color: {warpingScore > 0 ? COLORS.red : COLORS.ink};
      ">{warpingScore}</div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        color: {COLORS.inkMuted};
      ">{warpingPoints} pts</div>
      <div style="
        font-family: {S.fontBody};
        font-size: 10px;
        color: {COLORS.inkMuted};
        font-style: italic;
        margin-top: 2px;
      ">click for effects</div>
    </button>

  </div>
</div>

<!-- Aging Modal -->
<Modal bind:open={agingModalOpen} title="Effects of Aging">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    {#each Object.entries(localAgingPoints) as [stat, points]}
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid {COLORS.outlineVar};
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 14px;
          color: {COLORS.ink};
        ">{stat}</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button onclick={() => removeAgingPoint(stat)} style="width:22px; height:22px; border:1px solid {COLORS.outlineVar}; border-radius:3px; background:{COLORS.bgLow}; cursor:pointer; font-size:13px; line-height:1; padding:0;">−</button>
          <span style="
            font-family: {S.fontHeadline};
            font-size: 16px;
            font-weight: 700;
            min-width: 24px;
            text-align: center;
            color: {(points as number) > 0 ? COLORS.red : COLORS.inkMuted};
          ">{points}</span>
          <button onclick={() => addAgingPoint(stat)} style="width:22px; height:22px; border:1px solid {COLORS.outlineVar}; border-radius:3px; background:{COLORS.bgLow}; cursor:pointer; font-size:13px; line-height:1; padding:0;">+</button>
        </div>
      </div>
    {/each}
    {#if Object.keys(localAgingPoints).length === 0}
      <p style="
        font-family: {S.fontBody};
        font-size: 13px;
        font-style: italic;
        color: {COLORS.inkMuted};
      ">No aging effects yet.</p>
    {/if}
    <div style="display: flex; gap: 6px; margin-top: 8px;">
      <input type="text" placeholder="New stat..." bind:value={newAgingKey}
        onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewAgingKey(); } }}
        style="flex:1; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink}; background:{COLORS.bg};"
      />
      <button onclick={addNewAgingKey} style="padding:6px 12px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.ink}; font-family:{S.fontBody}; font-size:12px; cursor:pointer;">Add</button>
    </div>
    <button onclick={openRoll} style="width:100%; margin-top:4px; padding:8px; border:1px dashed {COLORS.red}; border-radius:4px; background:transparent; color:{COLORS.red}; font-family:{S.fontBody}; font-size:11px; font-weight:600; cursor:pointer; text-transform:uppercase; letter-spacing:0.06em;">+ Roll Aging</button>
    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button onclick={saveAging} style="flex:1; padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Save</button>
      <button onclick={() => agingModalOpen = false} style="flex:1; padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Cancel</button>
    </div>
  </div>
</Modal>

<!-- Aging Roll Modal -->
<Modal bind:open={rollModalOpen} title="Aging Roll">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Aging Total (roll + modifiers)</span>
      <input type="number" bind:value={agingTotal} style="width:100px; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontHeadline}; font-size:18px; font-weight:700; color:{COLORS.ink}; text-align:center;" />
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Target Characteristic (for 9–12 range)</span>
      <select bind:value={rollChar} style="width:fit-content; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink}; background:{COLORS.bg};">
        {#each coreChars as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
    </div>
    <button onclick={resolveRoll} disabled={agingTotal === null} style="padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Resolve</button>

    {#if rollResult}
      <div style="padding:12px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; display:flex; flex-direction:column; gap:6px;">
        <div style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:{COLORS.inkMuted};">Outcome</div>
        <div style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.red};">
          {#if rollResult.outcome === 'NO_EFFECT'}
            No Effect
          {:else if rollResult.outcome === 'APPARENT_AGE_INCREASE'}
            Apparent Age Increase
          {:else if rollResult.outcome === 'AGING_POINT'}
            Aging Point — {rollResult.affectedCharacteristic}
          {:else}
            Decrepitude Gained
          {/if}
        </div>
        {#if rollResult.crisisTriggered}
          <div style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.red}; font-weight:600;">Crisis!</div>
        {/if}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:4px;">
          <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Decrepitude</span>
          <span style="font-family:{S.fontHeadline}; font-size:14px; font-weight:700; color:{COLORS.ink}; text-align:right;">{rollResult.updatedDecrepitudePoints}</span>
          <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Aging Points ({rollResult.affectedCharacteristic ?? '—'})</span>
          <span style="font-family:{S.fontHeadline}; font-size:14px; font-weight:700; color:{COLORS.ink}; text-align:right;">{rollResult.updatedAgingPoints[rollResult.affectedCharacteristic ?? ''] ?? '—'}</span>
        </div>
      </div>
      <button onclick={applyRoll} style="padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Apply Result</button>
    {/if}

    <button onclick={() => rollModalOpen = false} style="padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Cancel</button>
  </div>
</Modal>

<!-- Warping Modal -->
<Modal bind:open={warpingModalOpen} title="Effects of Warping">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink};">Warping Points</span>
      <input type="number" min="0" bind:value={localWarping} style="width:80px; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; text-align:center;" />
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted};">Warping Effects</span>
      <textarea bind:value={localWarpingEffects} rows="4"
        style="width:100%; padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink}; background:{COLORS.bg}; resize:vertical; box-sizing:border-box;"
      ></textarea>
    </div>
    <div style="display: flex; gap: 8px; margin-top: 4px;">
      <button onclick={saveWarping} style="flex:1; padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Save</button>
      <button onclick={() => warpingModalOpen = false} style="flex:1; padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Cancel</button>
    </div>
  </div>
</Modal>