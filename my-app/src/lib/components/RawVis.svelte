<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { RawVisStore, StandardVis, ExtraordinaryVis } from '$lib/types';

  let {
    personalVis,
    labVis
  } = $props<{
    personalVis: RawVisStore;
    labVis: RawVisStore;
  }>();

  // Local mutable copies
  let personal = $state<RawVisStore>({
    standard: personalVis.standard.map((v: StandardVis) => ({ ...v })),
    extraordinary: personalVis.extraordinary.map((v: ExtraordinaryVis) => ({ ...v }))
  });

  let lab = $state<RawVisStore>({
    standard: labVis.standard.map((v: StandardVis) => ({ ...v })),
    extraordinary: labVis.extraordinary.map((v: ExtraordinaryVis) => ({ ...v }))
  });

  // Transfer modal state
  let transferOpen = $state(false);
  let transferArt = $state('');
  let transferAmount = $state(1);
  let transferDirection = $state<'tolab' | 'topersonal'>('tolab');

  const allArts = $derived([
    ...new Set([
      ...personal.standard.map(v => v.art),
      ...lab.standard.map(v => v.art)
    ])
  ]);

  function getPersonalPawns(art: string) {
    return personal.standard.find(v => v.art === art)?.pawns ?? 0;
  }

  function getLabPawns(art: string) {
    return lab.standard.find(v => v.art === art)?.pawns ?? 0;
  }

  function openTransfer(art: string, direction: 'tolab' | 'topersonal') {
    transferArt = art;
    transferDirection = direction;
    transferAmount = 1;
    transferOpen = true;
  }

  function executeTransfer() {
    const from = transferDirection === 'tolab' ? personal : lab;
    const to = transferDirection === 'tolab' ? lab : personal;

    const fromEntry = from.standard.find(v => v.art === transferArt);
    if (!fromEntry || fromEntry.pawns < transferAmount) return;

    // Deduct from source
    from.standard = from.standard.map(v =>
      v.art === transferArt ? { ...v, pawns: v.pawns - transferAmount } : v
    );

    // Add to destination
    const toEntry = to.standard.find(v => v.art === transferArt);
    if (toEntry) {
      to.standard = to.standard.map(v =>
        v.art === transferArt ? { ...v, pawns: v.pawns + transferAmount } : v
      );
    } else {
      to.standard = [...to.standard, { art: transferArt, pawns: transferAmount }];
    }

    transferOpen = false;
  }

  function consumeExtraordinary(source: 'personal' | 'lab', id: string) {
    if (source === 'personal') {
      personal = {
        ...personal,
        extraordinary: personal.extraordinary.filter(v => v.id !== id)
      };
    } else {
      lab = {
        ...lab,
        extraordinary: lab.extraordinary.filter(v => v.id !== id)
      };
    }
  }

  const sourceTypeIcon: Record<string, string> = {
    STANDARD:   '◆',
    DEDICATED:  '⚡',
    INFERNAL:   '💀',
    FAERIE:     '✦',
    DIVINE:     '☩',
    SPELL_LIKE: '🔮',
  };

  const sourceTypeColor: Record<string, string> = {
    STANDARD:   COLORS.inkMuted,
    DEDICATED:  '#b8860b',
    INFERNAL:   COLORS.red,
    FAERIE:     '#4a7c59',
    DIVINE:     '#4a6fa5',
    SPELL_LIKE: '#6a4c93',
  };

  const headerStyle = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${COLORS.red};
  `;

  const sectionLabelStyle = `
    font-family: ${S.fontBody};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${COLORS.inkMuted};
    margin-bottom: 8px;
  `;
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
">

  <!-- STANDARD VIS -->
  <div style="
    background-color: {COLORS.bgLow};
    border: 1px solid {COLORS.outlineVar};
    border-radius: 6px;
    overflow: hidden;
  ">
    <div style="
      padding: 6px 12px;
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <span style={headerStyle}>Standard Hermetic Vis</span>
    </div>

    <div style="padding: 12px;">
      <!-- Column headers -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 80px 80px 80px;
        padding: 4px 0;
        border-bottom: 1px solid {COLORS.outlineVar};
        margin-bottom: 8px;
      ">
        {#each ['Art', 'Personal', '', 'Lab'] as label}
          <div style="
            font-family: {S.fontBody};
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            text-align: center;
          ">{label}</div>
        {/each}
      </div>

      <!-- Art rows -->
      {#each allArts as art}
        {@const personalPawns = getPersonalPawns(art)}
        {@const labPawns = getLabPawns(art)}
        <div style="
          display: grid;
          grid-template-columns: 1fr 80px 80px 80px;
          padding: 6px 0;
          border-bottom: 1px solid {COLORS.outlineVar};
          align-items: center;
        ">
          <!-- Art name -->
          <span style="
            font-family: {S.fontBody};
            font-size: 13px;
            font-weight: 600;
            color: {COLORS.ink};
          ">{art}</span>

          <!-- Personal pawns -->
          <div style="text-align: center;">
            <span style="
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {personalPawns > 0 ? COLORS.ink : COLORS.inkMuted};
            ">{personalPawns}</span>
          </div>

          <!-- Transfer buttons -->
          <div style="display: flex; justify-content: center; gap: 4px;">
            <button
              onclick={() => openTransfer(art, 'tolab')}
              disabled={personalPawns === 0}
              style="
                font-size: 10px;
                padding: 2px 6px;
                border: 1px solid {COLORS.outlineVar};
                background: none;
                cursor: {personalPawns === 0 ? 'not-allowed' : 'pointer'};
                color: {personalPawns === 0 ? COLORS.inkMuted : COLORS.ink};
                border-radius: 3px;
              "
            >→</button>
            <button
              onclick={() => openTransfer(art, 'topersonal')}
              disabled={labPawns === 0}
              style="
                font-size: 10px;
                padding: 2px 6px;
                border: 1px solid {COLORS.outlineVar};
                background: none;
                cursor: {labPawns === 0 ? 'not-allowed' : 'pointer'};
                color: {labPawns === 0 ? COLORS.inkMuted : COLORS.ink};
                border-radius: 3px;
              "
            >←</button>
          </div>

          <!-- Lab pawns -->
          <div style="text-align: center;">
            <span style="
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {labPawns > 0 ? COLORS.ink : COLORS.inkMuted};
            ">{labPawns}</span>
          </div>
        </div>
      {/each}

      <!-- Totals -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 80px 80px 80px;
        padding: 6px 0;
        margin-top: 4px;
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Total</span>
        <div style="text-align: center;">
          <span style="
            font-family: {S.fontHeadline};
            font-size: 16px;
            font-weight: 800;
            color: {COLORS.red};
          ">{personal.standard.reduce((s, v) => s + v.pawns, 0)}</span>
        </div>
        <div />
        <div style="text-align: center;">
          <span style="
            font-family: {S.fontHeadline};
            font-size: 16px;
            font-weight: 800;
            color: {COLORS.red};
          ">{lab.standard.reduce((s, v) => s + v.pawns, 0)}</span>
        </div>
      </div>
    </div>
  </div>

<!-- EXTRAORDINARY VIS — always render -->
<div style="
      background-color: {COLORS.bgLow};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 6px;
      overflow: hidden;
    ">
      <div style="padding: 6px 12px; border-bottom: 1px solid {COLORS.outlineVar};">
        <span style={headerStyle}>Extraordinary & Tainted Vis</span>
      </div>

      <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; scrollbar-width: none;">

        <!-- Personal extraordinary -->
        {#if personal.extraordinary.length > 0}
          <p style={sectionLabelStyle}>Personal</p>
          {#each personal.extraordinary as vis}
            <div style="
              border: 1px solid {sourceTypeColor[vis.sourceType]};
              border-left: 3px solid {sourceTypeColor[vis.sourceType]};
              padding: 10px 12px;
              background-color: {COLORS.white};
              border-radius: 3px;
            ">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <span style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: {sourceTypeColor[vis.sourceType]};
                    margin-right: 6px;
                  ">{sourceTypeIcon[vis.sourceType]} {vis.sourceType}</span>
                  <span style="
                    font-family: {S.fontBody};
                    font-size: 13px;
                    font-weight: 600;
                    color: {COLORS.ink};
                  ">{vis.name}</span>
                  <div style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    color: {COLORS.inkMuted};
                    margin-top: 2px;
                  ">{vis.arts.join(' / ')}</div>
                </div>
                <span style="
                  font-family: {S.fontHeadline};
                  font-size: 18px;
                  font-weight: 800;
                  color: {COLORS.ink};
                ">{vis.pawns} {vis.pawns === 1 ? 'pawn' : 'pawns'}</span>
              </div>

              {#if vis.effect}
                <div style="
                  margin-top: 8px;
                  padding: 8px 10px;
                  background-color: {COLORS.bgLow};
                  border: 1px solid {COLORS.outlineVar};
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <div style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      color: {COLORS.inkMuted};
                      font-style: italic;
                    ">{vis.effect.description}</div>
                    <div style="
                      font-family: {S.fontBody};
                      font-size: 10px;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.inkMuted};
                      margin-top: 2px;
                    ">Level {vis.effect.level}</div>
                  </div>
                  <button
                    onclick={() => consumeExtraordinary('personal', vis.id)}
                    style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.white};
                      background-color: {COLORS.red};
                      border: none;
                      padding: 4px 10px;
                      cursor: pointer;
                    "
                  >Consume</button>
                </div>
              {/if}
            </div>
          {/each}
        {/if}

        <!-- Lab extraordinary -->
        {#if lab.extraordinary.length > 0}
          <p style={sectionLabelStyle}>Laboratory</p>
          {#each lab.extraordinary as vis}
            <div style="
              border: 1px solid {sourceTypeColor[vis.sourceType]};
              border-left: 3px solid {sourceTypeColor[vis.sourceType]};
              padding: 10px 12px;
              background-color: {COLORS.white};
              border-radius: 3px;
            ">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <span style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: {sourceTypeColor[vis.sourceType]};
                    margin-right: 6px;
                  ">{sourceTypeIcon[vis.sourceType]} {vis.sourceType}</span>
                  <span style="
                    font-family: {S.fontBody};
                    font-size: 13px;
                    font-weight: 600;
                    color: {COLORS.ink};
                  ">{vis.name}</span>
                  <div style="
                    font-family: {S.fontBody};
                    font-size: 11px;
                    color: {COLORS.inkMuted};
                    margin-top: 2px;
                  ">{vis.arts.join(' / ')}</div>
                </div>
                <span style="
                  font-family: {S.fontHeadline};
                  font-size: 18px;
                  font-weight: 800;
                  color: {COLORS.ink};
                ">{vis.pawns} {vis.pawns === 1 ? 'pawn' : 'pawns'}</span>
              </div>

              {#if vis.effect}
                <div style="
                  margin-top: 8px;
                  padding: 8px 10px;
                  background-color: {COLORS.bgLow};
                  border: 1px solid {COLORS.outlineVar};
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <div style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      color: {COLORS.inkMuted};
                      font-style: italic;
                    ">{vis.effect.description}</div>
                    <div style="
                      font-family: {S.fontBody};
                      font-size: 10px;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.inkMuted};
                      margin-top: 2px;
                    ">Level {vis.effect.level}</div>
                  </div>
                  <button
                    onclick={() => consumeExtraordinary('lab', vis.id)}
                    style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 0.06em;
                      color: {COLORS.white};
                      background-color: {COLORS.red};
                      border: none;
                      padding: 4px 10px;
                      cursor: pointer;
                    "
                  >Consume</button>
                </div>
              {/if}
            </div>
          {/each}
        {/if}

  </div>
</div>

</div>

<!-- Transfer Modal -->
{#if transferOpen}
  <div
    role="dialog"
    aria-modal="true"
    tabindex="0"
    style="
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.4);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
    "
    onclick={() => transferOpen = false}
    onkeydown={(e) => e.key === 'Escape' && (transferOpen = false)}
  >
    <div
      role="document"
      tabindex="0"
      style="
        background-color: {COLORS.white};
        border: 1px solid {COLORS.outlineVar};
        border-radius: 8px;
        padding: 24px;
        width: 320px;
        box-sizing: border-box;
      "
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <p style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.red};
        margin-bottom: 16px;
      ">Transfer {transferArt} Vis</p>

      <p style="
        font-family: {S.fontBody};
        font-size: 13px;
        color: {COLORS.inkMuted};
        margin-bottom: 16px;
        font-style: italic;
      ">
        {transferDirection === 'tolab' 
          ? `Personal → Laboratory (${getPersonalPawns(transferArt)} available)`
          : `Laboratory → Personal (${getLabPawns(transferArt)} available)`}
      </p>

      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <label style="
          font-family: {S.fontBody};
          font-size: 12px;
          color: {COLORS.inkMuted};
          text-transform: uppercase;
          letter-spacing: 0.06em;
        ">Pawns</label>
        <input
          type="number"
          bind:value={transferAmount}
          min="1"
          max={transferDirection === 'tolab' ? getPersonalPawns(transferArt) : getLabPawns(transferArt)}
          style="
            width: 80px;
            font-family: {S.fontBody};
            font-size: 16px;
            font-weight: 700;
            color: {COLORS.ink};
            background-color: {COLORS.bgLow};
            border: 1px solid {COLORS.outlineVar};
            padding: 6px 10px;
            box-sizing: border-box;
          "
        />
      </div>

      <div style="display: flex; gap: 8px;">
        <button
          onclick={executeTransfer}
          style="
            flex: 1;
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.white};
            background-color: {COLORS.red};
            border: none;
            padding: 8px;
            cursor: pointer;
          "
        >Transfer</button>
        <button
          onclick={() => transferOpen = false}
          style="
            flex: 1;
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {COLORS.inkMuted};
            background-color: {COLORS.bgLow};
            border: 1px solid {COLORS.outlineVar};
            padding: 8px;
            cursor: pointer;
          "
        >Cancel</button>
      </div>
    </div>
  </div>
{/if}