<script lang="ts">
	import { theme, updateTheme, DEFAULT_THEME, PRESETS, PRESET_KEYS, THEME_LABELS, type ThemeColors } from '$lib/stores/theme.svelte';

	const keys = $derived(Object.keys(THEME_LABELS) as (keyof ThemeColors)[]);

	let draft = $state<ThemeColors>({ ...theme });
	let fileInput: HTMLInputElement;
	let importError = $state<string | null>(null);

	function updateDraft(partial: Partial<ThemeColors>) {
		Object.assign(draft, partial);
	}

	function loadPreset(key: string) {
		const p = PRESETS[key];
		if (p) {
			Object.assign(draft, p.colors);
		}
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
		a.download = 'mnm-theme.json';
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
				const required = keys as string[];
				for (const key of required) {
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

<div class="theme-wrap" style="--preview-ink: {draft.ink}; --preview-accent: {draft.accent}; --preview-border: {draft.border}; --preview-newsprint: {draft.newsprint}; --preview-danger: {draft.danger}; --preview-highlight: {draft.highlight}; --preview-primary: {draft.primary}; --preview-secondary: {draft.secondary}; --preview-panel-bg: {draft.panelBg}; --preview-success: {draft.success};">
	<div class="preset-section">
		<span class="section-label">Preset Themes</span>
		<div class="preset-grid">
			{#each PRESET_KEYS as key}
				<button onclick={() => loadPreset(key)} class="preset-btn">
					<div class="preset-swatches">
						<span class="swatch-dot" style="background: {PRESETS[key].colors.danger};"></span>
						<span class="swatch-dot" style="background: {PRESETS[key].colors.highlight};"></span>
						<span class="swatch-dot" style="background: {PRESETS[key].colors.primary};"></span>
						<span class="swatch-dot" style="background: {PRESETS[key].colors.newsprint};"></span>
					</div>
					<span class="preset-label">{PRESETS[key].label}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="preview-section">
		<span class="section-label">Live Preview</span>
		<div class="preview-grid">
			<div class="preview-panel" style="border-color: {draft.border}; box-shadow: 3px 3px 0 {draft.border};">
				<div class="preview-header" style="background: {draft.primary}; border-bottom-color: {draft.border};">
					★ Identity
				</div>
				<div class="preview-body" style="background: {draft.panelBg}; color: {draft.ink};">
					<span class="preview-title" style="color: {draft.accent}; text-shadow: 1px 1px 0 rgba(0,0,0,0.4);">Captain Nova</span>
					<div class="preview-stats">
						<span class="preview-stat" style="color: {draft.danger};">STR 12</span>
						<span class="preview-stat" style="color: {draft.primary};">AGL 10</span>
						<span class="preview-stat" style="color: {draft.success};">FGT 8</span>
					</div>
					<div class="preview-badges">
						<span class="preview-badge" style="border-color: {draft.primary}; color: {draft.primary}; background: {draft.panelBg};">PL 10</span>
						<span class="preview-badge" style="border-color: {draft.danger}; color: {draft.danger}; background: {draft.panelBg};">Hero</span>
					</div>
				</div>
			</div>

			<div class="preview-panel" style="border-color: {draft.border}; box-shadow: 3px 3px 0 {draft.border};">
				<div class="preview-header" style="background: {draft.danger}; border-bottom-color: {draft.border};">
					★ Combat
				</div>
				<div class="preview-body" style="background: {draft.panelBg}; color: {draft.ink};">
					<div class="preview-stat-row">
						<span class="preview-stat-label">Initiative</span>
						<span class="preview-stat-value" style="border-color: {draft.danger}; color: {draft.danger};">+6</span>
					</div>
					<div class="preview-stat-row">
						<span class="preview-stat-label">Melee</span>
						<span class="preview-stat-value" style="border-color: {draft.danger}; color: {draft.danger};">+8</span>
					</div>
					<div class="preview-stat-row">
						<span class="preview-stat-label">Ranged</span>
						<span class="preview-stat-value" style="border-color: {draft.primary}; color: {draft.primary};">+10</span>
					</div>
					<div class="preview-stat-row">
						<span class="preview-stat-label">Damage DC</span>
						<span class="preview-stat-value" style="border-color: {draft.primary}; color: {draft.primary};">23</span>
					</div>
				</div>
			</div>

			<div class="preview-panel" style="border-color: {draft.border}; box-shadow: 3px 3px 0 {draft.border};">
				<div class="preview-header" style="background: {draft.primary}; border-bottom-color: {draft.border};">
					★ Powers
				</div>
				<div class="preview-body" style="background: {draft.panelBg}; color: {draft.ink};">
					<div class="preview-power-row">
						<span class="preview-power-name" style="color: {draft.accent}; text-shadow: 1px 1px 0 rgba(0,0,0,0.4);">Plasma Blast</span>
						<span class="preview-badge" style="border-color: {draft.primary}; color: {draft.primary}; background: {draft.panelBg};">24 PP</span>
					</div>
					<p class="preview-desc" style="color: {draft.ink}; opacity: 0.75;">Ranged Damage 8, Accurate</p>
					<div class="preview-power-row">
						<span class="preview-power-name" style="color: {draft.accent}; text-shadow: 1px 1px 0 rgba(0,0,0,0.4);">Force Field</span>
						<span class="preview-badge" style="border-color: {draft.success}; color: {draft.success}; background: {draft.panelBg};">15 PP</span>
					</div>
					<p class="preview-desc" style="color: {draft.ink}; opacity: 0.75;">Protection 6, Impervious</p>
					<div class="preview-power-row">
						<span class="preview-power-name" style="color: {draft.accent}; text-shadow: 1px 1px 0 rgba(0,0,0,0.4);">Flight</span>
						<span class="preview-badge" style="border-color: {draft.primary}; color: {draft.primary}; background: {draft.panelBg};">12 PP</span>
					</div>
					<p class="preview-desc" style="color: {draft.ink}; opacity: 0.75;">Flight 6 (250 MPH)</p>
				</div>
			</div>
		</div>
	</div>

	<span class="section-label">Custom Colors</span>
	<div class="color-grid">
		{#each keys as key}
			<div class="color-field">
				<label for="theme-{key}" class="color-label">{THEME_LABELS[key]}</label>
				<div class="color-input-row">
					<input
						id="theme-{key}"
						type="color"
						value={draft[key]}
						oninput={(e) => updateDraft({ [key]: (e.target as HTMLInputElement).value })}
						class="color-picker"
					/>
					<input
						type="text"
						value={draft[key]}
						oninput={(e) => updateDraft({ [key]: (e.target as HTMLInputElement).value })}
						class="color-hex"
					/>
					<div class="color-swatch" style="background: {draft[key]}; border-color: {draft.ink};"></div>
				</div>
			</div>
		{/each}
	</div>

	<div class="theme-actions">
		<button onclick={saveDraft} class="save-btn">Save Theme</button>
		<button onclick={cancelDraft} class="action-btn">Cancel</button>
		<button onclick={resetDraft} class="action-btn">Reset to Default</button>
		<button onclick={exportDraft} class="action-btn">Export</button>
		<button onclick={() => fileInput.click()} class="action-btn">Import</button>
		<input
			type="file"
			accept=".json"
			onchange={handleImport}
			bind:this={fileInput}
			class="file-input"
		/>
	</div>
	{#if importError}
		<div class="import-error">{importError}</div>
	{/if}
</div>

