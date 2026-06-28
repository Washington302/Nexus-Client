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
					&#9733; Identity
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
					&#9733; Combat
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
					&#9733; Powers
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

<style>
	.theme-wrap {
		font-family: 'Nunito', sans-serif;
	}

	.section-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 8px;
		display: block;
	}

	.preset-section {
		margin-bottom: 20px;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.preset-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 10px 8px;
		background: var(--panel-bg);
		border: 2.5px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		cursor: pointer;
		transition: transform 0.1s;
	}
	.preset-btn:hover { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--border); }

	.preset-swatches {
		display: flex;
		gap: 4px;
	}

	.swatch-dot {
		width: 14px;
		height: 14px;
		border: 1.5px solid var(--border);
	}

	.preset-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.preview-section {
		margin-bottom: 20px;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 10px;
	}

	.preview-panel {
		border: 2.5px solid;
		overflow: hidden;
	}

	.preview-header {
		font-family: 'Bangers', cursive;
		font-size: 15px;
		letter-spacing: 0.04em;
		color: white;
		text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
		padding: 5px 8px;
		border-bottom: 2.5px solid;
	}

	.preview-body {
		padding: 8px;
	}

	.preview-title {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.03em;
		display: block;
		margin-bottom: 6px;
	}

	.preview-stats {
		display: flex;
		gap: 10px;
		margin-bottom: 6px;
	}

	.preview-stat {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.preview-badges {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.preview-badge {
		display: inline-block;
		border: 2px solid;
		border-radius: 20px;
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		padding: 1px 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.preview-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 12px;
		margin-bottom: 6px;
		line-height: 1.4;
	}

	.preview-stat-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.preview-stat-label {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.preview-stat-value {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		border: 2px solid;
		padding: 1px 8px;
		box-shadow: 2px 2px 0 var(--preview-border);
		line-height: 1.2;
	}

	.preview-power-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1px;
	}

	.preview-power-name {
		font-family: 'Bangers', cursive;
		font-size: 14px;
		letter-spacing: 0.03em;
	}

	.color-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 6px;
		margin-bottom: 16px;
	}

	.color-field {
		display: grid;
		grid-template-columns: 140px 1fr;
		align-items: center;
		gap: 10px;
	}

	.color-label {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.color-input-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.color-picker {
		width: 36px;
		height: 36px;
		border: 2.5px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		padding: 2px;
		cursor: pointer;
		background: none;
	}
	.color-picker::-webkit-color-swatch-wrapper { padding: 0; }
	.color-picker::-webkit-color-swatch { border: none; border-radius: 0; }

	.color-hex {
		flex: 1;
		border: none;
		border-bottom: 2.5px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		padding: 4px 2px;
		background: transparent;
		color: var(--ink);
		outline: none;
		text-transform: uppercase;
	}

	.color-swatch {
		width: 36px;
		height: 36px;
		border: 2.5px solid;
		box-shadow: 2px 2px 0 var(--border);
		flex-shrink: 0;
	}

	.theme-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.save-btn {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--panel-bg);
		background: var(--primary);
		border: 2.5px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		padding: 6px 18px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition: transform 0.1s;
	}
	.save-btn:hover { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--border); }

	.action-btn {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--danger);
		background: none;
		border: 2.5px solid var(--danger);
		box-shadow: 2px 2px 0 var(--border);
		padding: 6px 14px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition: transform 0.1s;
	}
	.action-btn:hover { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--border); }

	.file-input { display: none; }

	.import-error {
		margin-top: 8px;
		padding: 8px 10px;
		background: #ffdad6;
		border: 2px solid var(--danger);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--danger);
	}
</style>
