const STORAGE_KEY = 'gb_theme';

export interface ThemeColors {
	background: string;
	foreground: string;
	gold: string;
	goldBright: string;
	goldDim: string;
	surface: string;
	surfaceElevated: string;
	border: string;
	destructive: string;
	success: string;
}

export const DEFAULT_THEME: ThemeColors = {
	background: '#17181c',
	foreground: '#ece7dc',
	gold: '#c9a24d',
	goldBright: '#e0bd6e',
	goldDim: '#8a713d',
	surface: '#2c2e35',
	surfaceElevated: '#383a43',
	border: '#544a34',
	destructive: '#c1443a',
	success: '#4f9e82',
};

export const PRESETS: Record<string, { label: string; colors: ThemeColors }> = {
	'godbound-dusk': {
		label: 'Godbound Dusk (Default)',
		colors: { ...DEFAULT_THEME },
	},
	'blood-moon': {
		label: 'Blood Moon',
		colors: {
			background: '#160c0c',
			foreground: '#f0e2df',
			gold: '#c14b3f',
			goldBright: '#e06b5c',
			goldDim: '#833530',
			surface: '#2a1817',
			surfaceElevated: '#391f1d',
			border: '#5a2b26',
			destructive: '#e0413a',
			success: '#4f9e82',
		},
	},
	'verdant-grove': {
		label: 'Verdant Grove',
		colors: {
			background: '#10160f',
			foreground: '#e6ecdf',
			gold: '#8fae53',
			goldBright: '#aecb75',
			goldDim: '#5f7a38',
			surface: '#1e2a1c',
			surfaceElevated: '#28381f',
			border: '#3f5230',
			destructive: '#c1443a',
			success: '#6bb27a',
		},
	},
	'starlit-void': {
		label: 'Starlit Void',
		colors: {
			background: '#0f1120',
			foreground: '#e4e2f4',
			gold: '#8b7fd6',
			goldBright: '#ab9ff2',
			goldDim: '#5c528f',
			surface: '#1c1e35',
			surfaceElevated: '#272a48',
			border: '#3b3868',
			destructive: '#c1443a',
			success: '#4f9e82',
		},
	},
};

export const PRESET_KEYS = Object.keys(PRESETS);

export const THEME_LABELS: Record<keyof ThemeColors, string> = {
	background: 'Page Background',
	foreground: 'Body Text',
	gold: 'Primary Accent',
	goldBright: 'Bright Accent (Highlights)',
	goldDim: 'Dim Accent (Secondary Labels)',
	surface: 'Card / Panel Background',
	surfaceElevated: 'Input / Elevated Background',
	border: 'Borders & Dividers',
	destructive: 'Danger & Errors',
	success: 'Success & Positive',
};

function loadTheme(): ThemeColors {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_THEME };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return { ...DEFAULT_THEME, ...JSON.parse(saved) };
	} catch {
		/* ignore */
	}
	return { ...DEFAULT_THEME };
}

function saveTheme(t: ThemeColors): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export function applyThemeToDom(t: ThemeColors): void {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.style.setProperty('--background', t.background);
	root.style.setProperty('--foreground', t.foreground);
	root.style.setProperty('--gold', t.gold);
	root.style.setProperty('--gold-bright', t.goldBright);
	root.style.setProperty('--gold-dim', t.goldDim);
	root.style.setProperty('--primary', t.gold);
	root.style.setProperty('--surface', t.surface);
	root.style.setProperty('--surface-elevated', t.surfaceElevated);
	root.style.setProperty('--border', t.border);
	root.style.setProperty('--destructive', t.destructive);
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
	if (preset) updateTheme({ ...preset.colors });
}

applyThemeToDom(theme);
