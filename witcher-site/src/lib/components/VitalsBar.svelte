<script lang="ts">
	import type { DerivedStats } from '$lib/services/api';

	let { derivedStats }: { derivedStats: DerivedStats } = $props();

	function pct(current: number, max: number): number {
		if (max <= 0) return 0;
		return Math.max(0, Math.min(100, (current / max) * 100));
	}

	const hp = $derived(derivedStats.currentHealthPoints ?? derivedStats.healthPoints);
	const stamina = $derived(derivedStats.currentStamina ?? derivedStats.stamina);
	const vigor = $derived(derivedStats.currentVigor ?? derivedStats.vigor);
</script>

<section class="vitals-section">
	<div class="vial-row">
		<div class="vial-label-row">
			<span class="vial-label">Health</span>
			<span class="vial-value" style="color: var(--error);">{hp} / {derivedStats.healthPoints}</span
			>
		</div>
		<div class="vial-bar">
			<div class="vial-fill hp" style="width: {pct(hp, derivedStats.healthPoints)}%"></div>
		</div>
	</div>

	<div class="vial-row">
		<div class="vial-label-row">
			<span class="vial-label">Stamina</span>
			<span class="vial-value" style="color: var(--tertiary);"
				>{stamina} / {derivedStats.stamina}</span
			>
		</div>
		<div class="vial-bar">
			<div class="vial-fill stamina" style="width: {pct(stamina, derivedStats.stamina)}%"></div>
		</div>
	</div>

	<div class="vial-row">
		<div class="vial-label-row">
			<span class="vial-label">Vigor</span>
			<span class="vial-value" style="color: var(--primary);">{vigor} / {derivedStats.vigor}</span>
		</div>
		<div class="vial-bar">
			<div class="vial-fill vigor" style="width: {pct(vigor, derivedStats.vigor)}%"></div>
		</div>
	</div>
</section>
