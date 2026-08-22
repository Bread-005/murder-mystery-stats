const REMOVED_ROLE_NAMES = ["Evil Tracker", "Investigator", "Pirate", "Witch Helper", "Lawyer"];

/**
 * Map excluded from role stats by default (no map filter set), since it is used for automated
 * testing games rather than real player games.
 */
const IGNORED_MAP_NAME_WHEN_UNFILTERED = "AIMap";

/**
 * Maps every role's in-game display name to its team/type, mirroring the grouping comments in
 * the game server's `RoleName` enum. "Sidekick" is its own type (a Murderer sub-team), not merged
 * into "Murderer".
 */
const ROLE_NAME_TO_ROLE_TYPE = {
    "Accelerator": "Innocent",
    "Alchemist": "Innocent",
    "Atheist": "Innocent",
    "Bodyguard": "Innocent",
    "Deputy": "Innocent",
    "Detective": "Innocent",
    "Doctor": "Innocent",
    "Dreamer": "Innocent",
    "Empath": "Innocent",
    "Engineer": "Innocent",
    "Exorcist": "Innocent",
    "Fool": "Innocent",
    "Game Guesser": "Innocent",
    "Grave Robber": "Innocent",
    "Heretic": "Innocent",
    "Hippie": "Innocent",
    "Hunter": "Innocent",
    "Huntsman": "Innocent",
    "Innocent": "Innocent",
    "Mayor": "Innocent",
    "Medic": "Innocent",
    "Medium": "Innocent",
    "Moneylender": "Innocent",
    "Nice Guesser": "Innocent",
    "Officer": "Innocent",
    "Philosopher": "Innocent",
    "Poppy Grower": "Innocent",
    "Portalmaker": "Innocent",
    "Recycler": "Innocent",
    "Revealer": "Innocent",
    "Security": "Innocent",
    "Seer": "Innocent",
    "Sheriff": "Innocent",
    "Shifter": "Innocent",
    "Snake Charmer": "Innocent",
    "Spy": "Innocent",
    "Swapper": "Innocent",
    "Tea Lady": "Innocent",
    "Teacher": "Innocent",
    "Teleporter": "Innocent",
    "Time Master": "Innocent",
    "Tracker": "Innocent",
    "Trapper": "Innocent",
    "Vanisher": "Innocent",
    "Village Idiot": "Innocent",
    "Wizard": "Innocent",
    "Baron": "Murderer",
    "Cleaner": "Murderer",
    "Copycat": "Murderer",
    "Fanzazz": "Murderer",
    "Jnak": "Murderer",
    "Lunatic": "Murderer",
    "Murderer": "Murderer",
    "Ninja": "Murderer",
    "Pit-Hag": "Murderer",
    "Recruiter": "Murderer",
    "Silencer": "Murderer",
    "Stunner": "Murderer",
    "Trickster": "Murderer",
    "Virilus": "Murderer",
    "Warlock": "Murderer",
    "Watcher": "Murderer",
    "Witch": "Murderer",
    "Zeitghast": "Murderer",
    "Boomdandy": "Sidekick",
    "Exposer": "Sidekick",
    "Mastermind": "Sidekick",
    "Sidekick": "Sidekick",
    "Arsonist": "Neutral",
    "Blob": "Neutral",
    "Bounty Hunter": "Neutral",
    "Executioner": "Neutral",
    "Frog": "Neutral",
    "Jackal": "Neutral",
    "Jester": "Neutral",
    "Neutral Guesser": "Neutral",
    "Neutral Killer": "Neutral",
    "Pelican": "Neutral",
    "Speedrunner": "Neutral",
    "Survivor": "Neutral",
    "Vulture": "Neutral"
};

const ROLE_TYPES = ["Innocent", "Murderer", "Neutral", "Sidekick"];

const ROLE_TYPE_TO_DEFAULT_COLOR = {
    "Innocent": "#55FF55",
    "Murderer": "#FF5555",
    "Sidekick": "#FF5555"
};

// Neutral roles each set a custom java.awt.Color in the game server's Role.java, so they can't be
// derived from the role type the way Innocent/Murderer/Sidekick colors can.
const NEUTRAL_ROLE_NAME_TO_COLOR = {
    "Arsonist": "#D57B13",
    "Blob": "#29CD05",
    "Bounty Hunter": "#4C2B0A",
    "Executioner": "#0564D0",
    "Frog": "#46524F",
    "Jackal": "#0C67A3",
    "Jester": "#FF55FF",
    "Neutral Guesser": "#045A11",
    "Neutral Killer": "#037878",
    "Pelican": "#11520C",
    "Speedrunner": "#9BDBA1",
    "Survivor": "#15EA92",
    "Vulture": "#635C10"
};

const ROLE_NAME_TO_COLOR = Object.fromEntries(
    Object.entries(ROLE_NAME_TO_ROLE_TYPE).map(([roleName, roleType]) => [
        roleName,
        NEUTRAL_ROLE_NAME_TO_COLOR[roleName] || ROLE_TYPE_TO_DEFAULT_COLOR[roleType]
    ])
);

/**
 * Computes per-role win rate and total times played, both recomputed live from recorded games
 * (since config.yml isn't exposed by the API), into a single merged row per role. Only the first
 * entry of each game player's `roles` array counts, since that is the role they were actually
 * assigned for that game.
 * @param {Array<Object>} games Raw game documents.
 * @param {number} [minimumPlayerCount] Only count games whose lobby had at least this many players.
 * @param {number} [maximumPlayerCount] Only count games whose lobby had at most this many players.
 * @param {string} [minimumDateKey] Only count games played on or after this date, as a "YYYY-MM-DD" key.
 * @param {string} [maximumDateKey] Only count games played on or before this date, as a "YYYY-MM-DD" key.
 * @param {string} [playerNamePrefix] Only count games with a player whose name starts with this text
 * (case-insensitive).
 * @returns {Array<{roleName: string, roleType: string|undefined, wins: number, gamesPlayed: number, winRate: number, totalTimesPlayed: number}>}
 */
function computeRoleStats(
    games,
    minimumPlayerCount,
    maximumPlayerCount,
    minimumDateKey,
    maximumDateKey,
    playerNamePrefix,
    mapNamePrefix
) {
    const roleNameToWins = new Map();
    const roleNameToGamesPlayed = new Map();
    const normalizedPlayerNamePrefix = playerNamePrefix ? playerNamePrefix.trim().toLowerCase() : undefined;
    const normalizedMapNamePrefix = mapNamePrefix ? mapNamePrefix.trim().toLowerCase() : undefined;

    const filteredGames = games.filter((game) => {
        const playerCount = (game.players || []).length;
        if (minimumPlayerCount !== undefined && playerCount < minimumPlayerCount) {
            return false;
        }
        if (maximumPlayerCount !== undefined && playerCount > maximumPlayerCount) {
            return false;
        }
        if (minimumDateKey !== undefined || maximumDateKey !== undefined) {
            const parsedDate = parseGameDate(game.time);
            if (!parsedDate) {
                return false;
            }
            if (minimumDateKey !== undefined && parsedDate.dayKey < minimumDateKey) {
                return false;
            }
            if (maximumDateKey !== undefined && parsedDate.dayKey > maximumDateKey) {
                return false;
            }
        }
        if (normalizedPlayerNamePrefix) {
            const hasMatchingPlayer = (game.players || []).some((gamePlayer) =>
                (gamePlayer.name || "").toLowerCase().startsWith(normalizedPlayerNamePrefix)
            );
            if (!hasMatchingPlayer) {
                return false;
            }
        }
        if (normalizedMapNamePrefix) {
            if (!(game.map || "").toLowerCase().startsWith(normalizedMapNamePrefix)) {
                return false;
            }
        } else if (game.map === IGNORED_MAP_NAME_WHEN_UNFILTERED) {
            return false;
        }
        return true;
    });

    for (const game of filteredGames) {
        for (const gamePlayer of game.players || []) {
            const roleName = (gamePlayer.roles || [])[0];
            if (!roleName) {
                continue;
            }
            const playerWonThisGame = Boolean(game.wonTeam && gamePlayer.team && game.wonTeam.includes(gamePlayer.team));
            roleNameToGamesPlayed.set(roleName, (roleNameToGamesPlayed.get(roleName) || 0) + 1);
            if (playerWonThisGame) {
                roleNameToWins.set(roleName, (roleNameToWins.get(roleName) || 0) + 1);
            }
        }
    }

    return [...roleNameToGamesPlayed.keys()].map((roleName) => {
        const gamesPlayed = roleNameToGamesPlayed.get(roleName) || 0;
        const wins = roleNameToWins.get(roleName) || 0;
        return {
            roleName,
            roleType: ROLE_NAME_TO_ROLE_TYPE[roleName],
            wins,
            gamesPlayed,
            winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
            totalTimesPlayed: gamesPlayed
        };
    });
}

/**
 * Sorts merged role stats by the given key and direction.
 * @param {Array<Object>} roleStatsList Rows from `computeRoleStats`.
 * @param {"winRate"|"totalTimesPlayed"|"roleName"} sortKey Field to sort by.
 * @param {"asc"|"desc"} sortDirection Sort direction.
 * @returns {Array<Object>} A new, sorted array.
 */
function sortRoleStats(roleStatsList, sortKey, sortDirection) {
    const sortedRoleStatsList = [...roleStatsList];
    if (sortKey === "roleName") {
        sortedRoleStatsList.sort((firstRole, secondRole) => firstRole.roleName.localeCompare(secondRole.roleName));
    } else {
        sortedRoleStatsList.sort((firstRole, secondRole) => firstRole[sortKey] - secondRole[sortKey]);
    }
    if (sortDirection === "desc") {
        sortedRoleStatsList.reverse();
    }
    return sortedRoleStatsList;
}

/**
 * Filters merged role stats down to roles with at least the given number of recorded games played.
 * @param {Array<Object>} roleStatsList Rows from `computeRoleStats`.
 * @param {number} minimumGamesPlayed Minimum `gamesPlayed` required to be included.
 * @returns {Array<Object>} A new, filtered array.
 */
function filterRoleStatsByMinimumGamesPlayed(roleStatsList, minimumGamesPlayed) {
    return roleStatsList.filter((role) => role.gamesPlayed >= minimumGamesPlayed);
}

/**
 * Filters merged role stats down to the given role types. An empty selection means "no type
 * restriction" and returns every role, which is how the Roles tab shows all roles by default.
 * @param {Array<Object>} roleStatsList Rows from `computeRoleStats`.
 * @param {Array<string>} selectedRoleTypes Role types to keep, e.g. `["Innocent", "Neutral"]`.
 * @returns {Array<Object>} A new, filtered array.
 */
function filterRoleStatsByRoleTypes(roleStatsList, selectedRoleTypes) {
    if (selectedRoleTypes.length === 0) {
        return roleStatsList;
    }
    return roleStatsList.filter((role) => selectedRoleTypes.includes(role.roleType));
}

/**
 * Filters merged role stats down to roles whose name contains the given search text, case-insensitively.
 * An empty search text means "no restriction" and returns every role.
 * @param {Array<Object>} roleStatsList Rows from `computeRoleStats`.
 * @param {string} searchText Text to search for within each role's name.
 * @returns {Array<Object>} A new, filtered array.
 */
function filterRoleStatsByNameSearch(roleStatsList, searchText) {
    const normalizedSearchText = searchText.trim().toLowerCase();
    if (normalizedSearchText === "") {
        return roleStatsList;
    }
    return roleStatsList.filter((role) => role.roleName.toLowerCase().includes(normalizedSearchText));
}

/**
 * Computes average game duration and game counts broken down by lobby size, plus an overall row.
 * @param {Array<Object>} games Raw game documents.
 * @returns {Array<{lobbySize: string, gamesPlayed: number, averageDurationSeconds: number}>}
 */
function computeAverageTimeByLobbySize(games) {
    const lobbySizeToDurations = new Map();
    for (const game of games) {
        const lobbySize = (game.players || []).length;
        if (lobbySize === 0) {
            continue;
        }
        if (!lobbySizeToDurations.has(lobbySize)) {
            lobbySizeToDurations.set(lobbySize, []);
        }
        lobbySizeToDurations.get(lobbySize).push(game.duration || 0);
    }

    const rows = [...lobbySizeToDurations.entries()]
        .map(([lobbySize, durations]) => ({
            lobbySize: `${lobbySize} players`,
            gamesPlayed: durations.length,
            averageDurationSeconds: durations.reduce((sum, duration) => sum + duration, 0) / durations.length
        }))
        .sort((firstRow, secondRow) => parseInt(firstRow.lobbySize) - parseInt(secondRow.lobbySize));

    const allDurations = [...lobbySizeToDurations.values()].flat();
    if (allDurations.length > 0) {
        rows.push({
            lobbySize: "All games",
            gamesPlayed: allDurations.length,
            averageDurationSeconds: allDurations.reduce((sum, duration) => sum + duration, 0) / allDurations.length
        });
    }

    return rows;
}

/**
 * Parses a game's ISO 8601 `time` field into a calendar day and month key.
 * @param {string} time Raw `time` field as written by the game server, e.g. "2024-02-22T18:00:00.000Z".
 * @returns {{dayKey: string, monthKey: string} | null} `null` if the field is missing or malformed.
 */
function parseGameDate(time) {
    if (!time) {
        return null;
    }
    const parsedDate = new Date(time);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }
    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getUTCDate()).padStart(2, "0");
    return {
        dayKey: `${year}-${month}-${day}`,
        monthKey: `${year}-${month}`
    };
}

/**
 * Counts games played per calendar day.
 * @param {Array<Object>} games Raw game documents.
 * @returns {Array<{dayLabel: string, gamesPlayed: number}>} Days sorted most recent first.
 */
function computeGamesPerDay(games) {
    const dayKeyToGamesPlayed = new Map();
    for (const game of games) {
        const parsedDate = parseGameDate(game.time);
        if (!parsedDate) {
            continue;
        }
        dayKeyToGamesPlayed.set(parsedDate.dayKey, (dayKeyToGamesPlayed.get(parsedDate.dayKey) || 0) + 1);
    }
    return [...dayKeyToGamesPlayed.entries()]
        .map(([dayLabel, gamesPlayed]) => ({dayLabel, gamesPlayed}))
        .sort((firstDay, secondDay) => secondDay.dayLabel.localeCompare(firstDay.dayLabel));
}

/**
 * Counts games played per calendar month.
 * @param {Array<Object>} games Raw game documents.
 * @returns {Array<{monthLabel: string, gamesPlayed: number}>} Months sorted most recent first.
 */
function computeGamesPerMonth(games) {
    const monthKeyToGamesPlayed = new Map();
    for (const game of games) {
        const parsedDate = parseGameDate(game.time);
        if (!parsedDate) {
            continue;
        }
        monthKeyToGamesPlayed.set(parsedDate.monthKey, (monthKeyToGamesPlayed.get(parsedDate.monthKey) || 0) + 1);
    }
    return [...monthKeyToGamesPlayed.entries()]
        .map(([monthLabel, gamesPlayed]) => ({monthLabel, gamesPlayed}))
        .sort((firstMonth, secondMonth) => secondMonth.monthLabel.localeCompare(firstMonth.monthLabel));
}

/**
 * Counts, for each legacy/removed role, how many players currently have it in `boughtRoles`.
 * @param {Array<Object>} players Raw player documents.
 * @returns {Array<{roleName: string, playersWhoBoughtIt: number}>}
 */
function computeRemovedRolesBoughtCounts(players) {
    return REMOVED_ROLE_NAMES
        .map((roleName) => ({
            roleName,
            playersWhoBoughtIt: players.filter((player) => (player.boughtRoles || []).includes(roleName)).length
        }))
        .sort((firstRole, secondRole) => secondRole.playersWhoBoughtIt - firstRole.playersWhoBoughtIt);
}

export {
    ROLE_TYPES,
    ROLE_NAME_TO_COLOR,
    computeRoleStats,
    sortRoleStats,
    filterRoleStatsByMinimumGamesPlayed,
    filterRoleStatsByRoleTypes,
    filterRoleStatsByNameSearch,
    computeAverageTimeByLobbySize,
    computeGamesPerDay,
    computeGamesPerMonth,
    computeRemovedRolesBoughtCounts
};
