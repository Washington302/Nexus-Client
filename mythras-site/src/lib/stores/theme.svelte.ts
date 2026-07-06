const STORAGE_KEY = 'mythras_theme';

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
	surface: '#fff8f7',
	onSurface: '#221919',
	primary: '#390009',
	onPrimary: '#ffffff',
	secondaryContainer: '#fed488',
	onSecondaryContainer: '#785a1a',
	surfaceContainerLowest: '#ffffff',
	outlineVariant: '#dac0c0',
	error: '#ba1a1a',
	tertiary: '#001c20'
};

export const PRESETS: Record<string, { label: string; colors: ThemeColors }> = {
	'mythic-burgundy': {
		label: 'Mythic Burgundy (Default)',
		colors: { ...DEFAULT_THEME }
	},
	'ashen-steel': {
		label: 'Ashen Steel',
		colors: {
			surface: '#f5f6f7',
			onSurface: '#1c1f22',
			primary: '#2b333a',
			onPrimary: '#ffffff',
			secondaryContainer: '#c9d2d8',
			onSecondaryContainer: '#31414c',
			surfaceContainerLowest: '#ffffff',
			outlineVariant: '#c7ccd1',
			error: '#ba1a1a',
			tertiary: '#3a4750'
		}
	},
	'verdant-grove': {
		label: 'Verdant Grove',
		colors: {
			surface: '#f6faf3',
			onSurface: '#1a2116',
			primary: '#1f3d14',
			onPrimary: '#ffffff',
			secondaryContainer: '#d7e6a8',
			onSecondaryContainer: '#3c4a1f',
			surfaceContainerLowest: '#ffffff',
			outlineVariant: '#c4d1b4',
			error: '#ba1a1a',
			tertiary: '#0f3d33'
		}
	},
	'twilight-sorcery': {
		label: 'Twilight Sorcery',
		colors: {
			surface: '#f8f6fb',
			onSurface: '#1e1a24',
			primary: '#2e1250',
			onPrimary: '#ffffff',
			secondaryContainer: '#dcc6f5',
			onSecondaryContainer: '#4a2d70',
			surfaceContainerLowest: '#ffffff',
			outlineVariant: '#cfc0dd',
			error: '#ba1a1a',
			tertiary: '#241b3d'
		}
	}
};

export const PRESET_KEYS = Object.keys(PRESETS);

export const THEME_LABELS: Record<keyof ThemeColors, string> = {
	surface: 'Page Background',
	onSurface: 'Body Text',
	primary: 'Primary UI (Headers, Buttons)',
	onPrimary: 'Text on Primary',
	secondaryContainer: 'Gold Accent (Skills, Highlights)',
	onSecondaryContainer: 'Text on Gold Accent',
	surfaceContainerLowest: 'Card / Panel Background',
	outlineVariant: 'Borders & Dividers',
	error: 'Danger & Errors',
	tertiary: 'Magic / Teal Accent'
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
