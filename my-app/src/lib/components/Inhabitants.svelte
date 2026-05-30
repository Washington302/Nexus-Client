<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Covenant } from '$lib/types/covenant';

  let { covenant }: { covenant: Covenant } = $props();

  // ── Stub character shapes — replace with API-resolved data later ──────────
  interface CharacterStub {
    id: string;
    name: string;
    type: 'MAGUS' | 'COMPANION' | 'GROG';
    house?: string;
  }

  // Derived from covenant ids — swap these out when API returns real objects
  const magiStubs: CharacterStub[] = covenant.magiIds.map(id => ({
    id,
    name: id.replace(/^mag_[a-z]+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: 'MAGUS',
    house: id.split('_')[1]?.replace(/\b\w/g, c => c.toUpperCase()) ?? '—',
  }));

  const companionStubs: CharacterStub[] = covenant.companionIds.map(id => ({
    id,
    name: id.replace(/^comp_[a-z]+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: 'COMPANION',
  }));

  const grogStubs: CharacterStub[] = covenant.namedGrogIds.map(id => ({
    id,
    name: id.replace(/^grog_[a-z]+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: 'GROG',
  }));

  // ── Population rows ───────────────────────────────────────────────────────
  const populationRows = $derived([
    ['Grogs',       covenant.grogs],
    ['Specialists', covenant.specialists],
    ['Craftsmen',   covenant.craftsmen],
    ['Laborers',    covenant.laborers],
    ['Servants',    covenant.servants],
    ['Teamsters',   covenant.teamsters],
  ]);

  const totalPopulation = $derived(
    covenant.grogs + covenant.specialists + covenant.craftsmen +
    covenant.laborers + covenant.servants + covenant.teamsters
  );

  // ── Type badge colors ─────────────────────────────────────────────────────
  const typeColor: Record<string, string> = {
    MAGUS:     COLORS.red,
    COMPANION: '#b8860b',
    GROG:      COLORS.inkMuted,
  };
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">

  <!-- Population & Loyalty Summary -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: start;
  ">

    <!-- Population counts -->
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
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: {COLORS.red};
        ">Covenfolk Population</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr);">
        {#each populationRows as [label, count]}
          <div style="
            padding: 10px 12px;
            text-align: center;
            border-right: 1px solid {COLORS.outlineVar};
            border-bottom: 1px solid {COLORS.outlineVar};
          ">
            <div style="
              font-family: {S.fontBody};
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {COLORS.inkMuted};
              margin-bottom: 4px;
            ">{label}</div>
            <div style="
              font-family: {S.fontHeadline};
              font-size: 20px;
              font-weight: 800;
              color: {COLORS.ink};
            ">{count}</div>
          </div>
        {/each}
      </div>

      <!-- Total -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: {COLORS.bgHigh};
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Total Covenfolk</span>
        <span style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {COLORS.red};
        ">{totalPopulation}</span>
      </div>
    </div>

    <!-- Loyalty -->
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
        <span style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: {COLORS.red};
        ">Loyalty</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr);">
        {#each [
          ['Base Loyalty',      covenant.baseLoyalty],
          ['Prevailing Score',  covenant.prevailingLoyaltyScore],
          ['Current Points',    covenant.currentLoyaltyPoints],
        ] as [label, value]}
          <div style="
            padding: 10px 12px;
            text-align: center;
            border-right: 1px solid {COLORS.outlineVar};
          ">
            <div style="
              font-family: {S.fontBody};
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {COLORS.inkMuted};
              margin-bottom: 4px;
            ">{label}</div>
            <div style="
              font-family: {S.fontHeadline};
              font-size: 20px;
              font-weight: 800;
              color: {COLORS.ink};
            ">{value}</div>
          </div>
        {/each}
      </div>

      <!-- Governance -->
      <div style="
        padding: 10px 12px;
        border-top: 1px solid {COLORS.outlineVar};
        background-color: {COLORS.bgHigh};
        display: flex;
        align-items: baseline;
        gap: 8px;
      ">
        <span style="
          font-family: {S.fontBody};
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          white-space: nowrap;
        ">Governance:</span>
        <span style="
          font-family: {S.fontBody};
          font-size: 13px;
          font-style: italic;
          color: {COLORS.ink};
        ">{covenant.governance || '—'}</span>
      </div>
    </div>
  </div>

  <!-- Roster sections -->
  {#each [
    { label: 'Magi', stubs: magiStubs },
    { label: 'Companions', stubs: companionStubs },
    { label: 'Named Grogs', stubs: grogStubs },
  ] as { label, stubs }}
    {#if stubs.length > 0}
      <div>
        <p style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: {COLORS.red};
          margin: 0 0 10px 0;
        ">{label}</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
          {#each stubs as stub}
            <div style="
              background-color: {COLORS.bgLow};
              border: 1px solid {COLORS.outlineVar};
              border-radius: 6px;
              overflow: hidden;
              transition: border-color 0.15s ease;
            "
              onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.red}
              onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar}
              role="article"
            >
              <!-- Card header -->
              <div style="
                background-color: {COLORS.bgHigh};
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
                <span style="
                  font-family: {S.fontHeadline};
                  font-size: 14px;
                  font-weight: 800;
                  color: {COLORS.ink};
                ">{stub.name}</span>
                <span style="
                  font-family: {S.fontBody};
                  font-size: 10px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: {typeColor[stub.type] ?? COLORS.inkMuted};
                ">{stub.type}</span>
              </div>

              <!-- Card body -->
              <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;">
                {#if stub.house}
                  <div style="display: flex; justify-content: space-between;">
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 11px;
                      text-transform: uppercase;
                      letter-spacing: 0.08em;
                      color: {COLORS.inkMuted};
                    ">House</span>
                    <span style="
                      font-family: {S.fontBody};
                      font-size: 13px;
                      font-weight: 600;
                      color: {COLORS.ink};
                    ">{stub.house}</span>
                  </div>
                {/if}

                <!-- Placeholder for when API resolves full character -->
                <div style="
                  font-family: {S.fontBody};
                  font-size: 11px;
                  font-style: italic;
                  color: {COLORS.inkMuted};
                  border-top: 1px solid {COLORS.outlineVar};
                  padding-top: 6px;
                  margin-top: 2px;
                ">Full character data pending API</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}

</div>