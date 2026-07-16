const STORAGE_KEY = 'witcher_theme';

export interface ThemeColors {
	surface: string;
	onSurface: string;
	primary: string;
	onPrimary: string;
	secondaryContainer: string;
	onSecondaryContainer: string;
	surfaceContainerLowest: string;
	outlineVariant: string;
	error: string;
	tertiary: string;
}

export const DEFAULT_THEME: ThemeColors = {
	surface: '#131313',
	onSurface: '#e5e2e1',
	primary: '#f6e1cd',
	onPrimary: '#3a2e21',
	secondaryContainer: '#474746',
	onSecondaryContainer: '#b6b5b4',
	surfaceContainerLowest: '#0e0e0e',
	outlineVariant: '#4d453e',
	error: '#ffb4ab',
	tertiary: '#d3e7f2'
};

export const PRESETS: Record<string, { label: string; colors: ThemeColors }> = {
	'grim-alchemical': {
		label: 'Grim Alchemical (Default)',
		colors: { ...DEFAULT_THEME }
	},
	'witcher-silver': {
		label: 'Witcher Silver',
		colors: {
			surface: '#1a1c1e',
			onSurface: '#e3e6e8',
			primary: '#c8d3d9',
			onPrimary: '#1a2226',
			secondaryContainer: '#3d4548',
			onSecondaryContainer: '#c2c9cb',
			surfaceContainerLowest: '#101112',
			outlineVariant: '#4a5054',
			error: '#ffb4ab',
			tertiary: '#a5c8e1'
		}
	},
	'toxic-green': {
		label: 'Toxicity Green',
		colors: {
			surface: '#101410',
			onSurface: '#e2e7e0',
			primary: '#b9e6a8',
			onPrimary: '#1f2e18',
			secondaryContainer: '#3c4a36',
			onSecondaryContainer: '#c7dcc0',
			surfaceContainerLowest: '#0b0d0b',
			outlineVariant: '#455040',
			error: '#ffb4ab',
			tertiary: '#cfe7d3'
		}
	},
	'igni-ember': {
		label: 'Igni Ember',
		colors: {
			surface: '#161110',
			onSurface: '#ece2df',
			primary: '#f0b090',
			onPrimary: '#3a1f10',
			secondaryContainer: '#4a3530',
			onSecondaryContainer: '#e0c3ba',
			surfaceContainerLowest: '#100c0b',
			outlineVariant: '#524039',
			error: '#ffb4ab',
			tertiary: '#e8c98a'
		}
	}
};

export const PRESET_KEYS = Object.keys(PRESETS);

export const THEME_LABELS: Record<keyof ThemeColors, string> = {
	surface: 'Page Background',
	onSurface: 'Body Text',
	primary: 'Primary UI (Headers, Vials)',
	onPrimary: 'Text on Primary',
	secondaryContainer: 'Iron Accent (Nav, Highlights)',
	onSecondaryContainer: 'Text on Iron Accent',
	surfaceContainerLowest: 'Card / Panel Background',
	outlineVariant: 'Borders & Dividers',
	error: 'Danger & Errors',
	tertiary: 'Sign / Magic Accent'
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
	root.style.setProperty('--surface', t.surface);
	root.style.setProperty('--surface-bright', t.surface);
	root.style.setProperty('--on-surface', t.onSurface);
	root.style.setProperty('--on-background', t.onSurface);
	root.style.setProperty('--background', t.surface);
	root.style.setProperty('--primary', t.primary);
	root.style.setProperty('--on-primary', t.onPrimary);
	root.style.setProperty('--secondary-container', t.secondaryContainer);
	root.style.setProperty('--on-secondary-container', t.onSecondaryContainer);
	root.style.setProperty('--surface-container-lowest', t.surfaceContainerLowest);
	root.style.setProperty('--outline-variant', t.outlineVariant);
	root.style.setProperty('--error', t.error);
	root.style.setProperty('--tertiary', t.tertiary);
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
