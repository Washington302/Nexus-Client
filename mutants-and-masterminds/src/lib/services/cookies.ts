const PREFIX = 'mnm_';

export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${PREFIX}${name}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
	if (typeof document === 'undefined') return;
	const expires = new Date(Date.now() + days * 864e5).toUTCString();
	document.cookie = `${PREFIX}${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function removeCookie(name: string): void {
	if (typeof document === 'undefined') return;
	document.cookie = `${PREFIX}${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}
