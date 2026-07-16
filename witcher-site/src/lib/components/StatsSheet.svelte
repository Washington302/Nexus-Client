<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import { STAT_ORDER, skillsForStat, statValue, label } from '$lib/utils/character';
	import IdentityHeader from '$lib/components/IdentityHeader.svelte';
	import VitalsBar from '$lib/components/VitalsBar.svelte';
	import AttributeCard from '$lib/components/AttributeCard.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let { draft }: { draft: WitcherCharacter } = $props();
</script>

<IdentityHeader name={draft.name} portraitUrl={draft.portraitUrl} />

<div
	class="page"
	style="display:flex; flex-direction:column; gap: var(--stack-md); max-width: 1100px;"
>
	<VitalsBar derivedStats={draft.derivedStats} />

	<section class="attribute-grid">
		{#each STAT_ORDER as stat}
			<AttributeCard
				{stat}
				value={statValue(draft, stat)}
				skills={skillsForStat(draft.skills, stat)}
			/>
		{/each}
	</section>

	<footer class="footer-stats">
		<div class="footer-stat">
			<div class="footer-stat-label">Encumbrance</div>
			<div class="footer-stat-value">{draft.derivedStats.encumbrance}</div>
		</div>
		<div class="footer-stat">
			<div class="footer-stat-label">Recovery</div>
			<div class="footer-stat-value">{draft.derivedStats.recovery}</div>
		</div>
		<div class="footer-stat">
			<div class="footer-stat-label">Run</div>
			<div class="footer-stat-value">{draft.derivedStats.run}</div>
		</div>
		<div class="footer-stat">
			<div class="footer-stat-label">Leap</div>
			<div class="footer-stat-value">{draft.derivedStats.leap}</div>
		</div>
		<div class="footer-stat">
			<div class="footer-stat-label">Melee Dmg Bonus</div>
			<div class="footer-stat-value">{draft.derivedStats.meleeDamageBonus}</div>
		</div>
		{#if draft.raceInfo.race}
			<div class="footer-stat">
				<div class="footer-stat-label">Race</div>
				<div class="footer-stat-value" style="font-size:16px;">{label(draft.raceInfo.race)}</div>
			</div>
		{/if}
		{#if draft.professionInfo.profession}
			<div class="footer-stat">
				<div class="footer-stat-label">Profession</div>
				<div class="footer-stat-value" style="font-size:16px;">
					{label(draft.professionInfo.profession)}
				</div>
			</div>
		{/if}
	</footer>
</div>

<BottomNav active="stats" />
