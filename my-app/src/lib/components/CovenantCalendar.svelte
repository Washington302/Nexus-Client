<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { api } from '$lib/services/api';
  import type { Covenant } from '$lib/types/covenant';
  import type { ArsCharacter, ActivitySummary } from '$lib/types/character';
  import { onMount } from 'svelte';

  let { covenant }: { covenant: Covenant } = $props();

  let memberActivities = $state<{ characterName: string; entry: ActivitySummary }[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const seasonColor: Record<string, string> = {
    SPRING: '#4a7c59', SUMMER: '#c8a24e', AUTUMN: '#b86f2e', WINTER: '#6b8fa7',
  };

  const seasonOrder: Record<string, number> = {
    SPRING: 0, SUMMER: 1, AUTUMN: 2, WINTER: 3,
  };

  const sortedActivities = $derived(
    [...memberActivities].sort((a, b) => {
      if (a.entry.year !== b.entry.year) return b.entry.year - a.entry.year;
      return seasonOrder[a.entry.season] - seasonOrder[b.entry.season];
    })
  );

  const allMemberIds = $derived([
    ...covenant.magiIds,
    ...covenant.companionIds,
    ...covenant.namedGrogIds,
  ]);

  onMount(async () => {
    try {
      const userChars = await api.character.myCharacters();
      const matched = userChars.filter((c: ArsCharacter) => c.covenantId === covenant.id);
      const activities: { characterName: string; entry: ActivitySummary }[] = [];
      for (const c of matched) {
        if (c.yearLog && c.yearLog.length > 0) {
          for (const entry of c.yearLog) {
            activities.push({ characterName: c.name, entry });
          }
        }
      }
      memberActivities = activities;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  });
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
">
  <div style="
    background-color: {COLORS.bgLow};
    border: 1px solid {COLORS.outlineVar};
    border-radius: 6px;
    overflow: hidden;
  ">
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      border-bottom: 1px solid {COLORS.outlineVar};
    ">
      <span style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:{COLORS.red};">
        Covenant Timeline
      </span>
      <span style="font-family:{S.fontBody}; font-size:10px; color:{COLORS.inkMuted};">
        {sortedActivities.length} entries from {allMemberIds.length} members
      </span>
    </div>

    <div style="display:flex; flex-direction:column;">
      {#if loading}
        <div style="padding: 24px; text-align: center;">
          <span style="font-family:{S.fontBody}; font-size:12px; font-style:italic; color:{COLORS.inkMuted};">Loading timeline...</span>
        </div>
      {:else if error}
        <div style="padding: 24px; text-align: center;">
          <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.red};">{error}</span>
        </div>
      {:else if sortedActivities.length === 0}
        <div style="padding: 24px; text-align: center;">
          <span style="font-family:{S.fontBody}; font-size:12px; font-style:italic; color:{COLORS.inkMuted};">No activities recorded yet for this covenant's members.</span>
        </div>
      {:else}
        {#each sortedActivities as { characterName, entry }}
          <div style="
            padding: 10px 12px;
            border-bottom: 1px solid {COLORS.outlineVar};
          ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <div style="display:flex; align-items:center; gap: 8px;">
                <span style="font-family:{S.fontHeadline}; font-size:14px; font-weight:700; color:{COLORS.ink};">{entry.year}</span>
                <span style="font-family:{S.fontBody}; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:2px 6px; border-radius:3px; color:{COLORS.white}; background-color:{seasonColor[entry.season]};">
                  {entry.season}
                </span>
                <span style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted}; font-style:italic;">
                  — {characterName}
                </span>
              </div>
              <span style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted};">
                {entry.activities.length} activities
              </span>
            </div>
            {#if entry.activities.length > 0}
              <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                {#each entry.activities as act}
                  <span style="
                    font-family:{S.fontBody}; font-size:11px;
                    padding: 2px 8px;
                    border: 1px solid {COLORS.outlineVar};
                    border-radius: 3px;
                    color: {COLORS.ink};
                  ">{act.type}{#if act.target} ({act.target}){/if}</span>
                {/each}
              </div>
            {/if}
            {#if entry.notes}
              <div style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted}; margin-top:4px;">
                {entry.notes}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
