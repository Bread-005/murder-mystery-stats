/**
 * Map excluded from "Most played roles" on the Overview tab, since it is used for automated
 * testing games rather than real player games.
 */
const IGNORED_MAP_NAME_FOR_ROLE_POPULARITY = "AIMap";

/**
 * Non-player mobs that the AIMap testing map stores as `Players` documents. Excluded from
 * "Top players by games played" since they are not real players.
 */
const AI_MAP_MOB_NAMES = new Set(["Zombie", "Skeleton", "Creeper", "Wither Skeleton"]);

/**
 * Computes headline totals shown at the top of the dashboard.
 * @param {Array<Object>} players Raw player documents.
 * @param {Array<Object>} games Raw game documents.
 * @returns {{totalGamesPlayed: number, uniquePlayers: number, totalKills: number, totalDeaths: number}}
 */
function computeOverviewStats(players, games) {
    const totalGamesPlayed = games.length;
    const uniquePlayers = players.length;
    const totalKills = players.reduce((sum, player) => sum + (player.kills || 0), 0);
    const totalDeaths = players.reduce((sum, player) => sum + (player.deaths || 0), 0);
    return {totalGamesPlayed, uniquePlayers, totalKills, totalDeaths};
}

/**
 * Returns the players with the most games played, descending.
 * @param {Array<Object>} players Raw player documents.
 * @param {number} limit Maximum number of players to return.
 * @returns {Array<Object>}
 */
function computeTopPlayersByGamesPlayed(players, limit) {
    return [...players]
        .filter((player) => (player.gamesPlayed || 0) > 0 && !AI_MAP_MOB_NAMES.has(player.name))
        .sort((firstPlayer, secondPlayer) => (secondPlayer.gamesPlayed || 0) - (firstPlayer.gamesPlayed || 0))
        .slice(0, limit);
}

/**
 * Counts how often each role was played across all games.
 * @param {Array<Object>} games Raw game documents.
 * @returns {Array<{roleName: string, gamesPlayed: number}>} Roles sorted by popularity, descending.
 */
function computeRolePopularity(games) {
    const roleNameToGamesPlayed = new Map();
    for (const game of games) {
        if (game.map === IGNORED_MAP_NAME_FOR_ROLE_POPULARITY) {
            continue;
        }
        for (const gamePlayer of game.players || []) {
            for (const roleName of gamePlayer.roles || []) {
                roleNameToGamesPlayed.set(roleName, (roleNameToGamesPlayed.get(roleName) || 0) + 1);
            }
        }
    }
    return [...roleNameToGamesPlayed.entries()]
        .map(([roleName, gamesPlayed]) => ({roleName, gamesPlayed}))
        .sort((firstRole, secondRole) => secondRole.gamesPlayed - firstRole.gamesPlayed);
}

/**
 * Counts how often each map was played across all games.
 * @param {Array<Object>} games Raw game documents.
 * @returns {Array<{mapName: string, gamesPlayed: number}>} Maps sorted by popularity, descending.
 */
function computeMapPopularity(games) {
    const mapNameToGamesPlayed = new Map();
    for (const game of games) {
        const mapName = game.map || "Unknown";
        mapNameToGamesPlayed.set(mapName, (mapNameToGamesPlayed.get(mapName) || 0) + 1);
    }
    return [...mapNameToGamesPlayed.entries()]
        .map(([mapName, gamesPlayed]) => ({mapName, gamesPlayed}))
        .sort((firstMap, secondMap) => secondMap.gamesPlayed - firstMap.gamesPlayed);
}

export {computeOverviewStats, computeTopPlayersByGamesPlayed, computeRolePopularity, computeMapPopularity};
