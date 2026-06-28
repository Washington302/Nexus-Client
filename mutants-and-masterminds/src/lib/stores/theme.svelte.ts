const STORAGE_KEY = 'mnm_theme';

export interface ThemeColors {
	ink: string;
	accent: string;
	border: string;
	newsprint: string;
	danger: string;
	highlight: string;
	primary: string;
	secondary: string;
	panelBg: string;
	success: string;
}

export const DEFAULT_THEME: ThemeColors = {
	ink: '#111111',
	accent: '#777777',
	border: '#111111',
	newsprint: '#FAF6E9',
	danger: '#CC2222',
	highlight: '#FFD700',
	primary: '#1A3A8F',
	secondary: '#2A52C9',
	panelBg: '#FFFFFF',
	success: '#1A6B1A',
};

export const PRESETS: Record<string, { label: string; colors: ThemeColors }> = {
	'superman-light': {
		label: 'Superman (Light)',
		colors: {
			ink: '#0D1B2A',
			accent: '#555555',
			border: '#0D1B2A',
			newsprint: '#E8F0FE',
			danger: '#E63946',
			highlight: '#FFD700',
			primary: '#1D428A',
			secondary: '#3A6BD4',
			panelBg: '#FFFFFF',
			success: '#2D6A4F',
		},
	},
	'superman-dark': {
		label: 'Superman (Dark)',
		colors: {
			ink: '#E8F0FE',
			accent: '#8899BB',
			border: '#4A6FA5',
			newsprint: '#0D1B2A',
			danger: '#FF4444',
			highlight: '#FFD700',
			primary: '#3A6BD4',
			secondary: '#6B9DFF',
			panelBg: '#1B2A4A',
			success: '#52B788',
		},
	},
	'batman-light': {
		label: 'Batman (Light)',
		colors: {
			ink: '#1A1A2E',
			accent: '#555555',
			border: '#1A1A2E',
			newsprint: '#F5F0E1',
			danger: '#8B0000',
			highlight: '#C9A84C',
			primary: '#2C3E50',
			secondary: '#4A6274',
			panelBg: '#FFFFFF',
			success: '#2E7D32',
		},
	},
	'batman-dark': {
		label: 'Batman (Dark)',
		colors: {
			ink: '#E0E0E0',
			accent: '#999999',
			border: '#555555',
			newsprint: '#0D0D0D',
			danger: '#CC0000',
			highlight: '#C9A84C',
			primary: '#1A1A2E',
			secondary: '#3D3D5C',
			panelBg: '#1C1C1C',
			success: '#4CAF50',
		},
	},
};

export const PRESET_KEYS = Object.keys(PRESETS);

function loadTheme(): ThemeColors {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_THEME };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return { ...DEFAULT_THEME, ...JSON.parse(saved) };
	} catch { /* ignore */ }
	return { ...DEFAULT_THEME };
}

function saveTheme(t: ThemeColors): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export function applyThemeToDom(t: ThemeColors): void {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.style.setProperty('--ink', t.ink);
	root.style.setProperty('--accent', t.accent);
	root.style.setProperty('--border', t.border);
	root.style.setProperty('--newsprint', t.newsprint);
	root.style.setProperty('--danger', t.danger);
	root.style.setProperty('--highlight', t.highlight);
	root.style.setProperty('--primary', t.primary);
	root.style.setProperty('--secondary', t.secondary);
	root.style.setProperty('--panel-bg', t.panelBg);
	root.style.setProperty('--success', t.success);
}

export const theme = $state(loadTheme());

export function previewTheme(t: ThemeColors): void {
	applyThemeToDom(t);
}

export function updateTheme(partial: Partial<ThemeColors>): void {
	Object.assign(theme, partial);
	saveTheme(theme);
	applyThemeToDom(theme);
}

export function resetTheme(): void {
	updateTheme({ ...DEFAULT_THEME });
}

export function applyPreset(key: string): void {
	const preset = PRESETS[key];
	if (preset) {
		updateTheme({ ...preset.colors });
	}
}

applyThemeToDom(theme);

export const THEME_LABELS: Record<keyof ThemeColors, string> = {
	ink: 'Body Text',
	accent: 'Accent Text (Labels, Hints)',
	border: 'Borders & Shadows',
	newsprint: 'Page Background',
	danger: 'Danger & Errors',
	highlight: 'Highlights & Stars',
	primary: 'Primary UI (Buttons, Headers)',
	secondary: 'Secondary UI (Light Accents)',
	panelBg: 'Card / Panel Background',
	success: 'Success & Positive',
};
