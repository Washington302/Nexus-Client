<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { ArsMagicaSaga, CampaignRole } from '$lib/types/campaign';
  import { logout } from '$lib/stores/session.svelte';

  // Interface for the logged-in user viewing the navbar
  interface NavUser {
    id: string;
    displayName: string;
    role: CampaignRole;
  }

  // Svelte 5 Snippet Props
  let { saga, user } = $props<{ 
    saga: ArsMagicaSaga | null; 
    user: NavUser | null; 
  }>();

  let menuOpen = $state(false);

  // Typed explicitly to CampaignRole to catch typos
  const roleColor: Record<CampaignRole, string> = {
    OWNER:       COLORS.red,
    STORYTELLER: '#b8860b',
    PLAYER:      COLORS.inkMuted,
    SPECTATOR:   COLORS.outlineVar,
  };
</script>

<nav style="
  position: sticky;
  top: 0;
  z-index: 200;
  width: 100%;
  background-color: {COLORS.ink};
  border-bottom: 2px solid {COLORS.red};
  box-sizing: border-box;
">
  <div style="
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
  ">

    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" style="
        font-family: {S.fontHeadline};
        font-size: 18px;
        font-weight: 800;
        color: {COLORS.white};
        text-decoration: none;
        letter-spacing: -0.01em;
      ">NEXUS</a>

      {#if saga}
        <div style="
          width: 1px;
          height: 20px;
          background-color: {COLORS.inkMuted};
        " />

        <a href="/saga/{saga.id}" style="
          display: flex;
          flex-direction: column;
          text-decoration: none;
        ">
          <span style="
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: 600;
            color: {COLORS.white};
            line-height: 1.2;
          ">{saga.name}</span>
          <span style="
            font-family: {S.fontBody};
            font-size: 10px;
            color: {COLORS.inkMuted};
            text-transform: uppercase;
            letter-spacing: 0.08em;
          ">{saga.tribunalRegion}</span>
        </a>
      {/if}
    </div>

    {#if saga}
      <div style="display: flex; align-items: center; gap: 4px;">
        {#each [
          ['Characters', `/saga/${saga.id}`],
          ['Covenant', `/saga/${saga.id}/covenant`],
        ] as [label, href]}
          <a {href}
            style="
              font-family: {S.fontBody};
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {COLORS.white};
              text-decoration: none;
              padding: 6px 12px;
              border-radius: 3px;
              transition: background-color 0.15s ease;
            "
            onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
          >{label}</a>
        {/each}
      </div>
    {/if}

    {#if user}
      <div style="position: relative;">
        <button
          onclick={() => menuOpen = !menuOpen}
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            background: none;
            border: 1px solid {COLORS.inkMuted};
            padding: 4px 10px;
            cursor: pointer;
            border-radius: 3px;
            transition: border-color 0.15s ease;
          "
          onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.white}
          onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.inkMuted}
        >
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: {roleColor [user.role as CampaignRole]};
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: {S.fontHeadline};
            font-size: 11px;
            font-weight: 800;
            color: {COLORS.white};
          ">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="
              font-family: {S.fontBody};
              font-size: 12px;
              font-weight: 600;
              color: {COLORS.white};
              line-height: 1.2;
            ">{user.displayName}</span>
            <span style="
              font-family: {S.fontBody};
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {roleColor [user.role as CampaignRole]};
            ">{user.role}</span>
          </div>
          
          <span style="
            font-size: 10px;
            color: {COLORS.inkMuted};
            margin-left: 4px;
          ">{menuOpen ? '▲' : '▼'}</span>
        </button>

        {#if menuOpen}
          <div style="
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background-color: {COLORS.white};
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            min-width: 180px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 300;
            overflow: hidden;
          ">
            {#each [
              ['My Characters', `/saga/${saga?.id}`],
              ['Profile', '/profile'],
              ['Settings', '/settings'],
            ] as [label, href]}
              <a {href}
                onclick={() => menuOpen = false}
                style="
                  display: block;
                  font-family: {S.fontBody};
                  font-size: 13px;
                  color: {COLORS.ink};
                  text-decoration: none;
                  padding: 10px 16px;
                  border-bottom: 1px solid {COLORS.outlineVar};
                  transition: background-color 0.15s ease;
                "
                onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgLow}
                onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >{label}</a>
            {/each}

            <button
              onclick={logout}
              style="
                width: 100%;
                font-family: {S.fontBody};
                font-size: 13px;
                font-weight: 700;
                color: {COLORS.red};
                background: none;
                border: none;
                padding: 10px 16px;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.15s ease;
              "
              onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgLow}
              onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
            >Sign Out</button>
          </div>
        {/if}
      </div>
    {:else}
      <a href="/auth/login"
        style="
          font-family: {S.fontBody};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.white};
          text-decoration: none;
          padding: 6px 14px;
          border: 1px solid {COLORS.inkMuted};
          border-radius: 3px;
          transition: border-color 0.15s ease;
        "
        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.white}
        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = COLORS.inkMuted}
      >Sign In</a>
    {/if}

  </div>
</nav>