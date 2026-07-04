<script lang="ts">
	import PillBadge from './PillBadge.svelte';

	let { power }: { power: any } = $props();
</script>

<div class="power-row">
	<div class="power-header">
		<span class="power-name">{power.name}</span>
		{#if power.array}<span class="array-badge">ARRAY</span>{/if}
		<PillBadge text="{power.totalPowerCost} PP" color="primary" />
	</div>
	{#if power.description}
		<div class="power-desc-text">{power.description}</div>
	{/if}
	{#if power.descriptors?.length}
		<div class="power-desc">{power.descriptors.join(', ')}</div>
	{/if}
	{#if power._deviceType}
		<div class="device-badge">{power._deviceType === 'EASILY_REMOVABLE' ? 'Easily Removable' : 'Removable'}</div>
		{#each power._embeddedPowers as ep}
			<div class="embedded-power-display">
				<div class="ep-header">
					<span class="power-name">{ep.name}</span>
					{#if ep.array}<span class="array-badge">ARRAY</span>{/if}
					<span class="effect-detail"><strong>{ep.totalPowerCost} PP</strong></span>
				</div>
				{#if ep.array}
					<div class="array-slot active-slot">Active Slot</div>
				{/if}
				{#each ep.effects as effect}
					<div class="effect-line">
						<span class="effect-name">{effect.effectName}</span>
						{#if effect.summon}<span class="summon-badge">Summon</span>{/if}
						<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
						{#if effect.modifiers?.length}
							<div class="modifier-line">
								{#each effect.modifiers as mod}
									<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.flat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
				{#if ep.array && ep.alternateEffects?.length}
					<div class="alt-effects-divider">Alternate Effects</div>
					{#each ep.alternateEffects as alt}
						<div class="alt-effect-block">
							<div class="alt-header">
								<span class="alt-name">{alt.name}</span>
								<span class="alt-meta">{alt.arrayType === 'DYNAMIC' ? 'Dynamic' : 'Alternate'} &middot; <strong>{alt.effects.reduce((s: number, e: any) => s + (e.calculatedCost ?? 0), 0)} PP</strong></span>
							</div>
							{#if alt.description}<div class="alt-desc">{alt.description}</div>{/if}
							{#each alt.effects as effect}
								<div class="effect-line">
									<span class="effect-name">{effect.effectName}</span>
									<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
									{#if effect.modifiers?.length}
										<div class="modifier-line">
											{#each effect.modifiers as mod}
												<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.flat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
		{/each}
	{:else}
		{#if power.array}
			<div class="array-slot active-slot">Active Slot</div>
		{/if}
		{#each power.effects as effect}
			<div class="effect-line">
				<span class="effect-name">{effect.effectName}</span>
				{#if effect.summon}<span class="summon-badge">Summon</span>{/if}
				<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
				{#if effect.modifiers?.length}
					<div class="modifier-line">
						{#each effect.modifiers as mod}
							<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.flat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
						{/each}
					</div>
				{/if}
				{#if effect.summon && effect.summonExtension}
					<div class="summon-block">
						<div class="summon-info">Summon Rank {effect.summonExtension.summonRank} &middot; {effect.summonExtension.minionPpBudget} PP Minion</div>
						{#if effect.summonExtension.minionStatBlock}
							{@const sb = effect.summonExtension.minionStatBlock}
							<div class="minion-statblock">
								<div class="minion-stat-name">{sb.name}</div>
								<div class="minion-stat-row"><span class="minion-stat-lbl">STR</span><span class="minion-stat-val">{sb.abilities.strengthFinalValue}</span><span class="minion-stat-lbl">STA</span><span class="minion-stat-val">{sb.abilities.staminaFinalValue}</span><span class="minion-stat-lbl">AGL</span><span class="minion-stat-val">{sb.abilities.agilityFinalValue}</span><span class="minion-stat-lbl">DEX</span><span class="minion-stat-val">{sb.abilities.dexterityFinalValue}</span><span class="minion-stat-lbl">FGT</span><span class="minion-stat-val">{sb.abilities.fightingFinalValue}</span><span class="minion-stat-lbl">INT</span><span class="minion-stat-val">{sb.abilities.intellectFinalValue}</span><span class="minion-stat-lbl">AWE</span><span class="minion-stat-val">{sb.abilities.awarenessFinalValue}</span><span class="minion-stat-lbl">PRE</span><span class="minion-stat-val">{sb.abilities.presenceFinalValue}</span></div>
								<div class="minion-stat-row"><span class="minion-stat-lbl">Dodge</span><span class="minion-stat-val">{sb.defenses.dodgeFinalValue}</span><span class="minion-stat-lbl">Parry</span><span class="minion-stat-val">{sb.defenses.parryFinalValue}</span><span class="minion-stat-lbl">Fort</span><span class="minion-stat-val">{sb.defenses.fortitudeFinalValue}</span><span class="minion-stat-lbl">Tough</span><span class="minion-stat-val">{sb.defenses.toughnessFinalValue}</span><span class="minion-stat-lbl">Will</span><span class="minion-stat-val">{sb.defenses.willFinalValue}</span></div>
								{#if sb.skills?.length}
									<div class="minion-stat-row"><span class="minion-stat-lbl">Skills</span><span class="minion-stat-skills">{sb.skills.map((s: any) => s.skillName + (s.ranks ? ' ' + s.ranks : '')).join(', ')}</span></div>
								{/if}
								{#if sb.advantages?.length}
									<div class="minion-stat-row"><span class="minion-stat-lbl">Adv</span><span class="minion-stat-skills">{sb.advantages.map((a: any) => a.name + (a.ranks > 1 ? ' ' + a.ranks : '')).join(', ')}</span></div>
								{/if}
								{#if sb.powers?.length}
									<div class="minion-stat-row"><span class="minion-stat-lbl">Powers</span><span class="minion-stat-skills">{sb.powers.map((p: any) => p.name).join(', ')}</span></div>
								{/if}
								<div class="minion-combat-state">
									<span class="minion-combat-lbl">DMG</span>
									<span class="minion-combat-val">{sb.combatState?.damage ?? 0}</span>
									<span class="minion-combat-lbl">Penalty</span>
									<span class="minion-combat-val">-{sb.combatState?.accumulatedToughnessPenalty ?? 0}</span>
									{#if sb.combatState?.staggered}<span class="minion-combat-tag">Staggered</span>{/if}
									{#if (sb.combatState?.dying ?? 0) > 0}<span class="minion-combat-tag death">Dying {sb.combatState.dying}/3</span>{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
		{#if power.array && power.alternateEffects?.length}
			<div class="alt-effects-divider">Alternate Effects</div>
			{#each power.alternateEffects as alt}
				<div class="alt-effect-block">
					<div class="alt-header">
						<span class="alt-name">{alt.name}</span>
						<span class="alt-meta">{alt.arrayType === 'DYNAMIC' ? 'Dynamic' : 'Alternate'} &middot; <strong>{alt.effects.reduce((s: number, e: any) => s + (e.calculatedCost ?? 0), 0)} PP</strong></span>
					</div>
					{#if alt.description}<div class="alt-desc">{alt.description}</div>{/if}
					{#each alt.effects as effect}
						<div class="effect-line">
							<span class="effect-name">{effect.effectName}</span>
							<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
							{#if effect.modifiers?.length}
								<div class="modifier-line">
									{#each effect.modifiers as mod}
										<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.flat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	{/if}
</div>

