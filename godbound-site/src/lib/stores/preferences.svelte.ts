import { applyThemeToDom, theme } from './theme.svelte';

const STORAGE_KEY = 'gb_preferences';

export type TypographyScale = 14 | 16 | 18 | 20;

export interface Preferences {
	compactMode: boolean;
	typographyScale: TypographyScale;
	highContrastText: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
	compactMode: false,
	typographyScale: 16,
	highContrastText: false,
};

export const TYPOGRAPHY_SCALE_OPTIONS: { value: TypographyScale; label: string }[] = [
	{ value: 14, label: 'Compact (14px)' },
	{ value: 16, label: 'Standard (16px)' },
	{ value: 18, label: 'Scholarly (18px)' },
	{ value: 20, label: 'Grand (20px)' },
];

function loadPreferences(): Preferences {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFERENCES };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
	} catch {
		/* ignore */
	}
	return { ...DEFAULT_PREFERENCES };
}

function savePreferences(p: Preferences): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function applyPreferencesToDom(p: Preferences): void {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.style.setProperty('--base-font-size', `${p.typographyScale}px`);
	root.style.setProperty('--ui-density-padding', p.compactMode ? '12px' : '20px');
	root.style.setProperty('--ui-density-gap', p.compactMode ? '10px' : '16px');
	root.classList.toggle('gb-high-contrast', p.highContrastText);
	if (p.highContrastText) {
		root.style.setProperty('--foreground', '#ffffff');
		root.style.setProperty('--muted-foreground', '#c7c7c7');
	} else {
		root.style.removeProperty('--muted-foreground');
		applyThemeToDom(theme);
	}
}

export const preferences = $state(loadPreferences());

export function updatePreferences(partial: Partial<Preferences>): void {
	Object.assign(preferences, partial);
	savePreferences(preferences);
	applyPreferencesToDom(preferences);
}

export function resetPreferences(): void {
	updatePreferences({ ...DEFAULT_PREFERENCES });
}

applyPreferencesToDom(preferences);
