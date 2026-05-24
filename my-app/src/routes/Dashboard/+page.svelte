<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { character } from '$lib/data/character';

  // Mock data — will come from API later
  const saga = {
    id: 'saga_rhine_01',
    name: 'The Rhine Tribunal',
    tribunalRegion: 'Greater Alps',
    season: 'SUMMER',
    currentYear: 1220,
  };

  const characters = [character];
</script>

<div style="
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
">

  <!-- Saga Header -->
  <div style="
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    border-bottom: 2px solid {COLORS.ink};
    padding-bottom: 16px;
  ">
    <div>
      <h1 style="
        font-family: {S.fontHeadline};
        font-size: 32px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
        line-height: 1;
        margin-bottom: 4px;
      ">{saga.name}</h1>
      <span style="
        font-family: {S.fontBody};
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: {COLORS.inkMuted};
      ">{saga.tribunalRegion} · Anno Domini {saga.currentYear}</span>
    </div>

    <div style="display: flex; gap: 8px;">
      
        <a href="/covenant"
        style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          text-decoration: none;
          border: 1px solid {COLORS.outlineVar};
          padding: 8px 16px;
          background-color: {COLORS.bgLow};
          transition: all 0.15s ease;
        "
      >View Covenant</a>
      <button style="
        font-family: {S.fontBody};
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.white};
        background-color: {COLORS.red};
        border: none;
        padding: 8px 16px;
        cursor: pointer;
      ">New Character</button>
    </div>
  </div>

  <!-- Section: My Characters -->
  <div style="margin-bottom: 32px;">
    <p style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: {COLORS.red};
      margin-bottom: 16px;
    ">My Characters</p>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
      {#each characters as char}
        
        <a  href="/character"
          style="
            display: block;
            text-decoration: none;
            background-color: {COLORS.bgLow};
            border: 1px solid {COLORS.outlineVar};
            border-radius: 6px;
            overflow: hidden;
            transition: box-shadow 0.15s ease, border-color 0.15s ease;
          "
          onmouseenter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = COLORS.red;
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          onmouseleave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar;
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <!-- Card Header -->
          <div style="
            background-color: {COLORS.ink};
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {COLORS.white};
            ">{char.name}</span>
            <span style="
              font-family: {S.fontBody};
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: {COLORS.red};
              font-weight: 700;
            ">{char.type}</span>
          </div>

          <!-- Card Body -->
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">

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
              ">{char.hermeticData.house}</span>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="
                font-family: {S.fontBody};
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: {COLORS.inkMuted};
              ">Covenant</span>
              <span style="
                font-family: {S.fontBody};
                font-size: 13px;
                font-weight: 600;
                color: {COLORS.ink};
              ">{char.covenant}</span>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="
                font-family: {S.fontBody};
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: {COLORS.inkMuted};
              ">Age</span>
              <span style="
                font-family: {S.fontBody};
                font-size: 13px;
                font-weight: 600;
                color: {COLORS.ink};
              ">{char.age}</span>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="
                font-family: {S.fontBody};
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: {COLORS.inkMuted};
              ">Player</span>
              <span style="
                font-family: {S.fontBody};
                font-size: 13px;
                font-weight: 600;
                color: {COLORS.ink};
              ">{char.player}</span>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: {COLORS.outlineVar}; margin: 4px 0;" />

            <!-- Description -->
            <p style="
              font-family: {S.fontBody};
              font-size: 12px;
              font-style: italic;
              color: {COLORS.inkMuted};
              line-height: 1.5;
            ">{char.description}</p>

          </div>

          <!-- Card Footer -->
          <div style="
            padding: 10px 16px;
            border-top: 1px solid {COLORS.outlineVar};
            background-color: {COLORS.bgHigh};
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="
              font-family: {S.fontBody};
              font-size: 11px;
              color: {COLORS.inkMuted};
            ">Warping: {char.warpingPoints} · Decrepitude: {char.decrepitudePoints}</span>
            <span style="
              font-family: {S.fontBody};
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: {COLORS.red};
            ">Open →</span>
          </div>

        </a>
      {/each}

      <!-- New Character Card -->
      <button style="
        background-color: transparent;
        border: 1px dashed {COLORS.outlineVar};
        border-radius: 6px;
        padding: 32px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.15s ease;
        min-height: 200px;
      "
        onmouseenter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = COLORS.red;
          (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgLow;
        }}
        onmouseleave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = COLORS.outlineVar;
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        <span style="
          font-size: 32px;
          color: {COLORS.outlineVar};
        ">+</span>
        <span style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">New Character</span>
      </button>
    </div>
  </div>

</div>