<script lang="ts">
	import {
		theme,
		updateTheme,
		DEFAULT_THEME,
		PRESETS,
		PRESET_KEYS,
		THEME_LABELS,
		type ThemeColors
	} from '$lib/stores/theme.svelte';

	const keys = Object.keys(THEME_LABELS) as (keyof ThemeColors)[];

	let draft = $state<ThemeColors>({ ...theme });
	let fileInput: HTMLInputElement;
	let importError = $state<string | null>(null);

	function updateDraft(partial: Partial<ThemeColors>) {
		Object.assign(draft, partial);
	}

	function loadPreset(key: string) {
		const p = PRESETS[key];
		if (p) Object.assign(draft, p.colors);
	}

	function saveDraft() {
		updateTheme({ ...draft });
	}

	function cancelDraft() {
		Object.assign(draft, theme);
	}

	function resetDraft() {
		Object.assign(draft, DEFAULT_THEME);
	}

	function exportDraft() {
		const data = JSON.stringify(draft, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'mythras-theme.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImport(e: Event) {
		importError = null;
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string);
				for (const key of keys) {
					if (typeof data[key] !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(data[key])) {
						throw new Error(`Invalid or missing "${key}" in theme file`);
					}
				}
				updateDraft(data as Partial<ThemeColors>);
			} catch (err) {
				importError = (err as Error).message;
			}
		};
		reader.readAsText(file);
		input.value = '';
	}
</script>

<div>
	<span class="theme-section-label">Preset Themes</span>
	<div class="theme-preset-grid">
		{#each PRESET_KEYS as key}
			<button onclick={() => loadPreset(key)} class="theme-preset-btn">
				<div class="theme-preset-swatches">
					<span class="theme-swatch-dot" style="background: {PRESETS[key].colors.primary};"></span>
					<span class="theme-swatch-dot" style="background: {PRESETS[key].colors.secondaryContainer};"></span>
					<span class="theme-swatch-dot" style="background: {PRESETS[key].colors.tertiary};"></span>
					<span class="theme-swatch-dot" style="background: {PRESETS[key].colors.surface};"></span>
				</div>
				<span class="theme-preset-label">{PRESETS[key].label}</span>
			</button>
		{/each}
	</div>

	<span class="theme-section-label">Live Preview</span>
	<div
		class="theme-preview-panel"
		style="background: {draft.surfaceContainerLowest}; border-color: {draft.outlineVariant};"
	>
		<div class="theme-preview-header" style="background: {draft.primary}; color: {draft.onPrimary};">
			Identity
		</div>
		<div class="theme-preview-body" style="color: {draft.onSurface};">
			<div class="theme-preview-name">Kaelen of Meeros</div>
			<div class="theme-preview-stat-row">
				<span>Athletics</span>
				<span class="theme-preview-stat-value" style="color: {draft.primary};">48%</span>
			</div>
			<div class="theme-preview-stat-row">
				<span>Sling &amp; Stone</span>
				<span
					class="theme-preview-pill"
					style="background: {draft.secondaryContainer}; color: {draft.onSecondaryContainer};"
					>42%</span
				>
			</div>
			<div class="theme-preview-stat-row">
				<span>Magic Points</span>
				<span class="theme-preview-stat-value" style="color: {draft.tertiary};">10 / 10</span>
			</div>
		</div>
	</div>

	<span class="theme-section-label">Custom Colors</span>
	<div class="theme-color-grid">
		{#each keys as key}
			<div class="theme-color-field">
				<label for="theme-{key}" class="field-label" style="margin:0;">{THEME_LABELS[key]}</label>
				<div class="theme-color-input-row">
					<input
						id="theme-{key}"
						type="color"
						value={draft[key]}
						oninput={(e) => updateDraft({ [key]: (e.target as HTMLInputElement).value })}
						class="theme-color-picker"
					/>
					<input
						type="text"
						value={draft[key]}
						oninput={(e) => updateDraft({ [key]: (e.target as HTMLInputElement).value })}
						class="theme-color-hex"
					/>
					<div class="theme-color-swatch" style="background: {draft[key]};"></div>
				</div>
			</div>
		{/each}
	</div>

	<div class="theme-actions">
		<button onclick={saveDraft} class="comic-btn">Save Theme</button>
		<button onclick={cancelDraft} class="comic-btn secondary">Cancel</button>
		<button onclick={resetDraft} class="comic-btn secondary">Reset to Default</button>
		<button onclick={exportDraft} class="comic-btn secondary">Export</button>
		<button onclick={() => fileInput.click()} class="comic-btn secondary">Import</button>
		<input
			type="file"
			accept=".json"
			onchange={handleImport}
			bind:this={fileInput}
			class="theme-file-input"
		/>
	</div>
	{#if importError}
		<div class="theme-import-error">{importError}</div>
	{/if}
</div>
