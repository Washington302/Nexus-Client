<script lang="ts">
	import type {
		Statistics,
		GameType,
		DerivedStats,
		CriticalWound,
		RacialPerk,
		WitcherStat
	} from '$lib/services/api';
	import {
		STAT_TABLE_ORDER,
		STAT_ABBREV,
		STAT_TO_STATISTICS_FIELD,
		STAT_TO_CURRENT_FIELD,
		currentStatValue,
		statPointsSpent,
		GAME_TYPE_POOL,
		statPenalty,
		healthCondition
	} from '$lib/utils/character';
	import InlineNumber from '$lib/components/InlineNumber.svelte';

	// Three values per stat, and they mean different things:
	//   Maximum   — the chargen/normal value the point-buy budget validates against.
	//   Current   — player-owned live state, dropped by drains that aren't criticals.
	//   Effective — computed: Current after the Wound Threshold, Death State and any
	//               critical wound. Never typed, and only shown when it differs.
	let {
		statistics,
		derivedStats,
		criticalWounds = [],
		perks = [],
		editable = true
	}: {
		statistics: Statistics;
		derivedStats: DerivedStats;
		criticalWounds?: CriticalWound[];
		perks?: RacialPerk[];
		editable?: boolean;
	} = $props();

	const condition = $derived(healthCondition(derivedStats));
	const penalties = $derived(
		STAT_TABLE_ORDER.map((stat) =>
			statPenalty(statistics, derivedStats, criticalWounds, perks, stat)
		)
	);
	const anyImpaired = $derived(penalties.some((p) => p.impaired));

	const anyDrained = $derived(
		STAT_TABLE_ORDER.some(
			(stat) => currentStatValue(statistics, stat) < statistics[STAT_TO_STATISTICS_FIELD[stat]]
		)
	);

	/**
	 * Mirrors the server's `syncCurrentToRaisedMax`: an undamaged Current rides along
	 * with a change to Maximum, so building a character never means typing every number
	 * twice. The server already does this on save — doing it here too means the column
	 * is right *while* you build, instead of looking stale until the next round trip.
	 *
	 * A damaged Current (below the old Maximum) is left alone: that's a real drain, and
	 * raising the ceiling shouldn't heal it.
	 */
	function setMaximum(stat: WitcherStat, next: number | null | undefined) {
		const maxField = STAT_TO_STATISTICS_FIELD[stat];
		const curField = STAT_TO_CURRENT_FIELD[stat];
		const previousMax = statistics[maxField];
		const current = statistics[curField];
		statistics[maxField] = next as number;
		if (typeof next === 'number' && (current == null || current >= previousMax)) {
			statistics[curField] = next;
		}
	}

	/**
	 * Clears stat drain — the thing Current exists to track. Deliberately does NOT
	 * touch critical wounds or the health conditions: those reduce the stat without
	 * ever writing to Current, so a reset that appeared to clear them would be lying.
	 *
	 * Writes the max rather than unsetting the field. Both display identically, but an
	 * explicit number keeps `syncCurrentToRaisedMax` reading the stat as undamaged, and
	 * avoids sending a null the backend types as a primitive int.
	 */
	function resetCurrentToMaximum() {
		for (const stat of STAT_TABLE_ORDER) {
			statistics[STAT_TO_CURRENT_FIELD[stat]] = statistics[STAT_TO_STATISTICS_FIELD[stat]];
		}
	}

	/** Spells out which parts produced the number, so a reduced stat is never unexplained. */
	function penaltyTitle(p: (typeof penalties)[number]): string {
		const parts = [
			p.perkModifier
				? `Base ${p.base} (perks ${p.perkModifier > 0 ? '+' : '−'}${Math.abs(p.perkModifier)})`
				: `Base ${p.base}`
		];
		if (p.multiplierPenalty > 0) {
			// Named as a fraction: compounded multipliers produce values like 1/16 that
			// are far more recognisable than the −9 they happen to work out to.
			parts.push(`wounds ×${fractionLabel(p.multiplier)} −${p.multiplierPenalty}`);
		}
		if (p.conditionPenalty > 0) {
			parts.push(
				`${p.condition === 'DEATH_STATE' ? 'Death State' : 'Wound Threshold'} −${p.conditionPenalty}`
			);
		}
		if (p.flatPenalty > 0) parts.push(`wound penalties −${p.flatPenalty}`);
		return `${parts.join(', ')} = ${p.effective}`;
	}

	/** 0.0625 → "1/16". Multipliers are only ever products of halves and quarters. */
	function fractionLabel(multiplier: number): string {
		return multiplier > 0 && multiplier < 1 ? `1/${Math.round(1 / multiplier)}` : '1';
	}

	const spent = $derived(statPointsSpent(statistics));
	const pool = $derived(GAME_TYPE_POOL[statistics.gameType as GameType] ?? 0);
	// validateStatBudget subtracts a baseline of 1 per stat before comparing to the pool.
	const overBudget = $derived(spent - STAT_TABLE_ORDER.length > pool);
</script>

<div class="attr-table" class:impaired={anyImpaired}>
	{#if condition !== 'NONE'}
		<!-- Named rather than just coloured: the two conditions have different rules
		     (Death State replaces the halving instead of stacking with it) and the
		     player needs to know which one is producing the numbers below. -->
		<p class="condition-banner" class:death={condition === 'DEATH_STATE'}>
			{#if condition === 'DEATH_STATE'}
				<strong>Death State</strong> — at 0 HP or below, every stat drops to a third. Replaces the Wound
				Threshold halving.
			{:else}
				<strong>Below Wound Threshold</strong> — REF, DEX, INT and WILL are halved. BODY and SPD are not.
			{/if}
		</p>
	{/if}

	<div class="attr-table-head" class:with-effective={anyImpaired}>
		<span></span>
		<span class="attr-col-label">Maximum</span>
		<span class="attr-col-label">Current</span>
		{#if anyImpaired}<span class="attr-col-label">Effective</span>{/if}
	</div>

	{#each STAT_TABLE_ORDER as stat, i}
		{@const maxField = STAT_TO_STATISTICS_FIELD[stat]}
		{@const curField = STAT_TO_CURRENT_FIELD[stat]}
		{@const current = currentStatValue(statistics, stat)}
		{@const penalty = penalties[i]}
		<div
			class="attr-row"
			class:with-effective={anyImpaired}
			class:drained={current < statistics[maxField]}
		>
			<span class="attr-row-label">{STAT_ABBREV[stat]}</span>
			<InlineNumber
				bind:value={() => statistics[maxField], (v) => setMaximum(stat, v)}
				min={1}
				label="{STAT_ABBREV[stat]} maximum"
				viewClass="attr-value"
				editClass="attr-input"
				{editable}
			/>
			<!-- Current is left unset until the stat is actually drained, so the max
			     stands in for it — clearing the input puts it back to unset. -->
			<InlineNumber
				bind:value={statistics[curField]}
				fallback={statistics[maxField]}
				min={0}
				label="{STAT_ABBREV[stat]} current"
				viewClass="attr-value current"
				editClass="attr-input current"
				{editable}
			/>
			{#if anyImpaired}
				<span
					class="attr-value effective"
					class:reduced={penalty.effective < penalty.purchased}
					class:raised={penalty.effective > penalty.purchased}
					title={penalty.impaired ? penaltyTitle(penalty) : 'Nothing is modifying this statistic.'}
				>
					{penalty.effective}
				</span>
			{/if}
		</div>
	{/each}

	<div class="attr-total" class:with-effective={anyImpaired} class:over={overBudget}>
		<span class="attr-row-label">Stat Total</span>
		<span class="attr-total-value">{spent}</span>
		<span class="attr-total-pool">{pool + STAT_TABLE_ORDER.length} max</span>
		{#if anyImpaired}<span></span>{/if}
	</div>
	{#if overBudget}
		<p class="attr-warning">
			Over the {statistics.gameType.toLowerCase()} point pool — the server will reject this on save.
		</p>
	{/if}

	{#if editable}
		<button
			type="button"
			class="reset-current-btn"
			onclick={resetCurrentToMaximum}
			disabled={!anyDrained}
			title={anyDrained
				? 'Restores every drained statistic. Critical wounds are unaffected.'
				: 'No statistic is drained.'}
		>
			Reset Current to Maximum
		</button>
	{/if}
</div>
