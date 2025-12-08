const USER_KEY = 'app:currentUser';
const GAME_KEY = 'app:currentGame';

// helpers: stringify/parse seguros
function getJSON(key, fallback = null) {
  const res = localStorage.getItem(key);
  if (res === null) return fallback;
  try {
    return JSON.parse(res);
  } catch (err) {
    console.warn('Failed to parse localStorage value for', key, err);
    return fallback;
  }
}

function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('localStorage.setItem failed', err);
    return false;
  }
}

// User API
export function saveUser(user) {
  if (!user || !user.id) throw new Error('saveUser: user must have id');
  setJSON(USER_KEY, user);
  return user;
}
export function getUser() {
  return getJSON(USER_KEY, null);
}
export function getUserId() {
  return getUser()?.id ?? null;
}
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// Game API
export function saveGame(game) {
  if (!game || !game.id) throw new Error('saveGame: game must have id');
  setJSON(GAME_KEY, game);
  return game;
}
export function getGame() {
  return getJSON(GAME_KEY, null);
}
export function getGameId() {
  return getGame()?.id ?? null;
}
export function clearGame() {
  localStorage.removeItem(GAME_KEY);
}

// Utilities
export function clearAllStorage() {
  clearUser();
  clearGame();
}

