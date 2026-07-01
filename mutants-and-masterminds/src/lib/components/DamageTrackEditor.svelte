<script lang="ts">
	let { damagePenaltyDisplay, staggered, incapacitated, dying, applyDamage, healDamage, incrementDying, resetCombatState }:
		{ damagePenaltyDisplay: string; staggered: boolean; incapacitated: boolean; dying: number; applyDamage: (n: number) => void; healDamage: (n: number) => void; incrementDying: () => void; resetCombatState: () => void } = $props();
</script>

<div class="damage-track">
	<span class="maneuver-hdr" style="font-size:13px;">Damage Track</span>
	<div class="damage-row">
		<span class="damage-lbl">Penalty</span>
		<span class="damage-val">{damagePenaltyDisplay}</span>
		<button class="dmg-btn" onclick={() => applyDamage(1)}>+1</button>
		<button class="dmg-btn" onclick={() => applyDamage(2)}>+2</button>
		<button class="dmg-btn heal" onclick={() => healDamage(1)}>-1</button>
	</div>
	<div class="damage-row">
		<label class="dmg-check">
			<input type="checkbox" bind:checked={staggered} />
			<span class="dmg-lbl-cb">Staggered</span>
		</label>
		<label class="dmg-check">
			<input type="checkbox" bind:checked={incapacitated} />
			<span class="dmg-lbl-cb">Incapacitated</span>
		</label>
	</div>
	{#if incapacitated}
		<div class="dying-track">
			<span class="dying-lbl">Dying</span>
			<div class="dying-dots">
				{#each [1,2,3] as d}
					<button class="dying-dot" class:filled={dying >= d} onclick={incrementDying} disabled={dying >= d || dying >= 3}>
						{d}
					</button>
				{/each}
			</div>
			{#if dying >= 3}
				<span class="death-msg">{'\u2620'} Dead</span>
			{/if}
		</div>
	{/if}
	<button class="dmg-reset" onclick={resetCombatState}>Reset Damage</button>
</div>

