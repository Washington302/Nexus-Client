<script lang="ts">
	import type { DerivedStats } from '$lib/services/api';
	import InlineNumber from '$lib/components/InlineNumber.svelte';

	// The `max*` values are server-derived and read-only here. The `current*` pools are
	// live-play state the player edits constantly (damage, spent Vigor, Stun loss), so
	// they are click-to-edit rather than being buried behind an edit modal.
	// The server clamps current down to max on save; HP is allowed to go negative.
	let { derivedStats, editable = true }: { derivedStats: DerivedStats; editable?: boolean } =
		$props();

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
</script>

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
					label="Current health"
					editClass="vial-input"
					{editable}
				/>
				<span class="vial-max">/ {derivedStats.maxHealthPoints}</span>
			</span>
		</div>
		<div class="vial-bar">
			<div
				class="vial-fill hp"
				style="width: {pct(derivedStats.currentHealthPoints, derivedStats.maxHealthPoints)}%"
			></div>
			{#if derivedStats.woundThreshold > 0 && derivedStats.maxHealthPoints > 0}
				<div
					class="wound-marker"
					style="left: {pct(derivedStats.woundThreshold, derivedStats.maxHealthPoints)}%"
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
					label="Current stamina"
					editClass="vial-input"
					{editable}
				/>
				<span class="vial-max">/ {derivedStats.maxStamina}</span>
			</span>
		</div>
		<div class="vial-bar">
			<div
				class="vial-fill stamina"
				style="width: {pct(derivedStats.currentStamina, derivedStats.maxStamina)}%"
			></div>
		</div>
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
					label="Current stun"
					editClass="vial-input"
					{editable}
				/>
				<span class="vial-max">/ {derivedStats.maxStun}</span>
			</span>
		</div>
		<div class="vial-bar">
			<div
				class="vial-fill stun"
				style="width: {pct(derivedStats.currentStun, derivedStats.maxStun)}%"
			></div>
		</div>
	</div>
</section>
