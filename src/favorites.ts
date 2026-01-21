const FAVORITE_TEAM_KEY = 'favoriteTeamAbbr';

export function getFavoriteTeam(): string | null {
  try {
    return localStorage.getItem(FAVORITE_TEAM_KEY);
  } catch {
    return null;
  }
}

export function setFavoriteTeam(abbreviation: string): void {
  try {
    localStorage.setItem(FAVORITE_TEAM_KEY, abbreviation);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorite-team-changed', { detail: abbreviation }));
    }
  } catch {
    // ignore
  }
}

export function clearFavoriteTeam(): void {
  try {
    localStorage.removeItem(FAVORITE_TEAM_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorite-team-changed', { detail: null }));
    }
  } catch {
    // ignore
  }
}

export function isFavorite(abbreviation: string | null | undefined): boolean {
  const fav = getFavoriteTeam();
  const abbr = (abbreviation || '').toString().toUpperCase();
  return !!fav && fav.toUpperCase() === abbr;
}

export { FAVORITE_TEAM_KEY };
