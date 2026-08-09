<script lang="ts">
	import type { DerivedStats, CriticalWound, RacialPerk } from '$lib/services/api';
	import { effectiveDerived } from '$lib/utils/character';
	import InlineNumber from '$lib/components/InlineNumber.svelte';
	import Panel from '$lib/components/Panel.svelte';

	// The `max*` values are server-derived and read-only here. The `current*` pools are
	// live-play state the player edits constantly (damage, spent Vigor, Stun loss), so
	// they are click-to-edit rather than being buried behind an edit modal.
	// The server clamps current down to max on save; HP is allowed to go negative.
	let {
		derivedStats,
		criticalWounds = [],
		perks = [],
		editable = true
	}: {
		derivedStats: DerivedStats;
		criticalWounds?: CriticalWound[];
		perks?: RacialPerk[];
		editable?: boolean;
	} = $props();

	// Wounds and perks can target these maxima directly — Septic Shock quarters Stamina,
	// Heart Damage quarters it again. The server stores its own value untouched, so this
	// is a display-time resolution rather than a write.
	const maxHealthPoints = $derived(
		effectiveDerived(derivedStats.maxHealthPoints, criticalWounds, perks, 'HEALTH_POINTS')
	);
	const maxStamina = $derived(
		effectiveDerived(derivedStats.maxStamina, criticalWounds, perks, 'STAMINA')
	);
	const maxStun = $derived(effectiveDerived(derivedStats.maxStun, criticalWounds, perks, 'STUN'));

	// Recovery is a stat like any other derived value — a curse or a perk can target it
	// the same way one quarters Stamina — so it goes through the same resolution.
	const recovery = $derived(
		effectiveDerived(derivedStats.recovery, criticalWounds, perks, 'RECOVERY')
	);

	function pct(current: number, max: number): number {
		if (max <= 0) return 0;
		return Math.max(0, Math.min(100, (current / max) * 100));
	}

	// Below the wound threshold, crit penalties apply. The server exposes the number
	// but deliberately doesn't auto-apply the stat penalties, so this is a warning
	// marker only — the player applies the effect themselves.
	const wounded = $derived(
		derivedStats.woundThreshold > 0 &&
			derivedStats.currentHealthPoints < derivedStats.woundThreshold
	);

	/** "Catching your breath" — the Recovery action. Deliberately just Stamina: the
	 *  rules let it restore HP too, but that reading applies out of combat with no
	 *  stated cap on repetitions, which is really "rest," not this one action. */
	function recoverStamina() {
		const current = derivedStats.currentStamina || 0;
		derivedStats.currentStamina = Math.min(maxStamina, current + recovery);
	}
</script>

<Panel header="Vitals" color="plain">
	<section class="vitals-section">
		<div class="vial-row">
			<div class="vial-label-row">
				<span class="vial-label">
					Health
					{#if wounded}<span class="wound-flag" title="Below wound threshold — crit penalties apply"
							>Wounded</span
						>{/if}
				</span>
				<span class="vial-value" style="color: var(--error);">
					<InlineNumber
						bind:value={derivedStats.currentHealthPoints}
						max={maxHealthPoints}
						label="Current health"
						editClass="vial-input"
						{editable}
					/>
					<span class="vial-max">/ {maxHealthPoints}</span>
				</span>
			</div>
			<div class="vial-bar">
				<div
					class="vial-fill hp"
					style="width: {pct(derivedStats.currentHealthPoints, maxHealthPoints)}%"
				></div>
				{#if derivedStats.woundThreshold > 0 && derivedStats.maxHealthPoints > 0}
					<div
						class="wound-marker"
						style="left: {pct(derivedStats.woundThreshold, maxHealthPoints)}%"
						title="Wound threshold: {derivedStats.woundThreshold}"
					></div>
				{/if}
			</div>
		</div>

		<div class="vial-row">
			<div class="vial-label-row">
				<span class="vial-label">Stamina</span>
				<span class="vial-value" style="color: var(--tertiary);">
					<InlineNumber
						bind:value={derivedStats.currentStamina}
						min={0}
						max={maxStamina}
						label="Current stamina"
						editClass="vial-input"
						{editable}
					/>
					<span class="vial-max">/ {maxStamina}</span>
				</span>
			</div>
			<div class="vial-bar">
				<div
					class="vial-fill stamina"
					style="width: {pct(derivedStats.currentStamina, maxStamina)}%"
				></div>
			</div>
			{#if editable}
				<button
					type="button"
					class="ability-edit-btn"
					onclick={recoverStamina}
					disabled={derivedStats.currentStamina >= maxStamina}
					title="Catch your breath — regain Recovery ({recovery}) Stamina"
				>
					Recover (+{recovery})
				</button>
			{/if}
		</div>

		<!-- Vigor is deliberately absent. It is a threshold, not a pool — never spent and
	     recovered, with no recovery mechanic at all — so it lives on the Magic tab
	     alongside the effects that commit it, not among the depleting resources. -->

		<div class="vial-row">
			<div class="vial-label-row">
				<span class="vial-label">Stun</span>
				<span class="vial-value" style="color: var(--secondary);">
					<InlineNumber
						bind:value={derivedStats.currentStun}
						min={0}
						max={maxStun}
						label="Current stun"
						editClass="vial-input"
						{editable}
					/>
					<span class="vial-max">/ {maxStun}</span>
				</span>
			</div>
			<div class="vial-bar">
				<div class="vial-fill stun" style="width: {pct(derivedStats.currentStun, maxStun)}%"></div>
			</div>
		</div>
	</section>
</Panel>
