const STORAGE_KEY = 'gb_game_rules';

export interface GameRules {
	autoCalculateSavingThrows: boolean;
	trackEffortAutomatically: boolean;
	enableDominionReminders: boolean;
}

export const DEFAULT_GAME_RULES: GameRules = {
	autoCalculateSavingThrows: true,
	trackEffortAutomatically: false,
	enableDominionReminders: true,
};

function loadGameRules(): GameRules {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_GAME_RULES };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return { ...DEFAULT_GAME_RULES, ...JSON.parse(saved) };
	} catch {
		/* ignore */
	}
	return { ...DEFAULT_GAME_RULES };
}

function saveGameRules(r: GameRules): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

export const gameRules = $state(loadGameRules());

export function updateGameRules(partial: Partial<GameRules>): void {
	Object.assign(gameRules, partial);
	saveGameRules(gameRules);
}
