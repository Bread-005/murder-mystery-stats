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
 * Maps each role's in-game display name to its ability description, copied from the game server's
 * `Role.java`. Cooldowns, durations and other `config.yml`-driven numbers aren't exposed by the API
 * (see the Quest Stats note in CLAUDE.md), so they're shown as bracketed placeholders (e.g.
 * "[cooldown]") instead of the actual in-game values. Roles with no special ability ("Innocent",
 * "Sidekick") are omitted.
 */
const ROLE_NAME_TO_ABILITY_TEXT = {
    "Murderer": "Kill all opposing players, to win",
    "Detective": "If you shoot an arrow you get a new one in [cooldown] seconds. For 5 emeralds you can investigate a corpse for information",
    "Hunter": "You may kill any non-Innocent with your sword. If you try to kill an Innocent, you die",
    "Hippie": "Everyone starts glowing for you",
    "Tracker": "Your compass points towards your nearest opposing player. If there is a Sidekick you learn their role & that it is 1 of 2 players",
    "Medium": "If a player dies, you learn information about that player. If you die everyone learns that the Murderer is 1 of 2 players",
    "Jester": "If a non-Murderer player kills you or tries to kill you, you win. You have a fake sword",
    "Recycler": "If you collect 7 emerald, you get an arrow. Once per game, you may choose another player: they receive 1 arrow",
    "Vanisher": "Every [cooldown] seconds, choose a player: you teleport to them & are invisible for [duration] seconds",
    "Stunner": "Every [cooldown] seconds, you may choose a player: they cannot move for [duration] seconds",
    "Cleaner": "If you kill someone with your sword or snowball their corpse will be invisible. You start knowing 1 in-play Innocent role",
    "Nice Guesser": "You start knowing 4 Murderer roles; the Murderer is 1 of them. You may choose a player & guess their role; if correct they die; if wrong you lose this ability",
    "Time Master": "Every [cooldown] seconds, in [duration] seconds, you may teleport everyone to their current location. If a player dies during that period, they are revived",
    "Grave Robber": "If an Innocent dies, you become their role & keep this ability",
    "Warlock": "You may click on a player to curse them. If that cursed player is standing in a [range] block radius to another player, you may kill the other player",
    "Deputy": "You start knowing 1 Innocent player & their role. When they die, you become their role",
    "Arsonist": "If you leftclick (hit) a player: they are doused, but if they hit you, they are no longer doused. If all other alive players are doused, you win",
    "Medic": "Once per game, choose a player (not yourself): they are safe from sword attacks",
    "Ninja": "You may click on a player to target them. You may later teleport to their location and kill them that way",
    "Dreamer": "You start knowing 2 Innocent, 1 Murderer and 1 Neutral role from all players each; 1 is their role",
    "Neutral Guesser": "If you guess every other alive player´s role, you win. If you guess wrong twice, you die",
    "Officer": "Every [cooldown] seconds, you may put someone in jail for [duration] seconds",
    "Swapper": "Every [cooldown] seconds, you may swap any two player´s positions",
    "Trickster": "You may mark a location. You may later teleport to that marked location which disappears afterwards. Every [cooldown] seconds, you may give all opposing players blindness for [duration] seconds",
    "Shifter": "Once per game, choose a player: if they are an Innocent you become their role & they become a not-in-play Innocent role. If they are not an Innocent you become a not-in-play Innocent role",
    "Doctor": "Once per game, click on a corpse to revive them, they join your team. If they are not an Innocent, they become a not-in-play Innocent. If you die & you haven´t used your ability, you are revived after 5 seconds",
    "Witch": "If you leftclick (hit) a player: they are cursed, but if they hit you, they are no longer cursed. If all other alive players are cursed, your team wins. You don´t have a sword",
    "Bodyguard": "Once per game, choose a player (not yourself): if they die, their killer teleports to you instead. Every [cooldown] seconds, you can place a 3x3 glass wall in front of you for [duration] seconds",
    "Revealer": "Once per game, choose a player: everyone learns their role",
    "Vulture": "Your compass points towards your nearest corpse. Every [cooldown] seconds, you may teleport to your nearest corpse. If you click on (player count - 2) corpses, you win",
    "Exposer": "Once per game, choose a player & guess their role: if correct they die",
    "Jackal": "If you shoot an arrow you get a new one in [cooldown] seconds. If you are the last alive player, you win. If just 2 players live, you have speed 1",
    "Teleporter": "Every [cooldown] seconds, you may choose a player to teleport them to a corner of the current map",
    "Speedrunner": "If you collect enough emeralds, you win. Every 5 emeralds you collect, you receive the speed effect +1. If you only need 10 more emeralds to win, you glow for everyone",
    "Wizard": "Every [cooldown] seconds, choose a player & a potion effect they get",
    "Bounty Hunter": "Everyone learns who your 2 targets are. If you kill all your targets, you win. If one of your targets dies by any other means you become an Innocent",
    "Spy": "The Murderers think you are a fellow Murderer. You may kill one player",
    "Copycat": "You have a not-in-play Innocent ability",
    "Seer": "You start knowing which roles are in play",
    "Survivor": "If you are alive when the game ends, you win. If Survivors are the only non-Murderer roles alive, you win. Every [cooldown] seconds you lose 1 emerald & if you don´t have any, you die. If you lose, you are a Survivor the next game. [Can be in play multiple times]",
    "Watcher": "You start knowing everyone´s role. [- Evil Guesser]",
    "Executioner": "You start knowing an Innocent player or Jester and their role. If that player gets shot by a non-murderer player, you win",
    "Portalmaker": "You may place 2 portals which players can use to teleport to the other one",
    "Neutral Killer": "If all other neutral players are dead and you have killed at least 1 of them, you win. If you try to kill a non-neutral player, you die",
    "Alchemist": "You have a not-in-play Murderer ability",
    "Blob": "You start knowing 1 player. If the player you know dies, you learn another alive player. Every [cooldown] seconds, you may activate your ability for [duration] seconds. If your known player dies during that time, you win",
    "Sheriff": "You start knowing an evil player. If the player you know dies, you learn another alive evil player. If you try to kill a non-evil player, you die. [1 Innocent is evil]",
    "Baron": "[All Innocents are Neutrals]",
    "Jnak": "All players know who you are. All players know that the Sidekick is 1 of 2 players. If you die while the Sidekick is alive, your team wins instead",
    "Lunatic": "You start knowing 1 Innocent player: they think they are the Murderer, but they are not. After [duration] seconds, they learn who they are",
    "Huntsman": "You start knowing which players are Neutrals. Every [cooldown] seconds, choose a neutral player: they become a not-in-play Innocent & join your team",
    "Snake Charmer": "Every [cooldown] seconds choose a player: a chosen Murderer swaps roles & teams with you & then becomes a not-in-play Innocent",
    "Atheist": "If all players agree, Innocents win (, but lose if you are not in play). If only 1 player lives, Innocents lose. Every [cooldown]-[duration] seconds a player dies. [All players are Innocents]",
    "Philosopher": "You start knowing 5 not-in-play Innocent roles. Once per game, choose one of them to become",
    "Virilus": "If you or an infected player is within 5 blocks to another player, they become infected, learn this & die in [cooldown] seconds. You only get a sword, when you get a compass",
    "Game Guesser": "You start knowing the players´ roles of a past game. If you (once) guess something specific, you get an arrow & most opposing players glow for you",
    "Pit-Hag": "Every [cooldown] seconds, choose a player & a role, they become",
    "Fanzazz": "If you kill a player, you join their team & if they are neutral, you gain their ability. If you die or the timer runs out, your team loses. If you are the last alive player, your team wins",
    "Recruiter": "Once per game, choose a player & a Murderer or Sidekick role: they become that role & are your Sidekick now. [No Sidekick]",
    "Village Idiot": "Every [cooldown] seconds, choose a player: you learn their team",
    "Security": "You start knowing the lowest winrate alive Innocent role: they cannot die due to other players",
    "Fool": "The 1st time you die, you don´t",
    "Moneylender": "Every [cooldown] seconds, choose a player: you join their team",
    "Teacher": "Every [cooldown] seconds choose a player: they teleport to you & both of you learn something",
    "Exorcist": "Every [cooldown] seconds, choose a player (not chosen yet): the murderer, if chosen loses their sword for [duration] seconds",
    "Zeitghast": "Your killcooldown is doubled. You can neither throw snowballs nor get arrows [+1 Sidekick]",
    "Heretic": "Whoever wins, loses & whoever loses, wins, even if you are dead. All good players start knowing you are in play",
    "Poppy Grower": "Players on the Murderer team do not know each other. If you click a poppy, everyone glows for you for 5 seconds, you get speed 2 for 3 seconds & you learn the distance between you and the murderer",
    "Boomdandy": "If you die, all but 2 players die",
    "Trapper": "You may place a limited number of invisible traps. If a player comes close to one, you learn their role & if they are not good, they are stunned for [duration] seconds",
    "Pelican": "If you click on a player, they teleport to a white box. If all other alive players are in there, you win. If you die, all players in the box teleport to the location they were eaten from",
    "Tea Lady": "Good players within [range] blocks to you cannot die due to sword attacks",
    "Engineer": "The Murderer cannot call Sabotages. You may vent & if you vent near a good player, they learn who you are. [- Technician]",
    "Mastermind": "If the Murderer dies, play for [duration] more seconds. If a player then dies, their team loses",
    "Mayor": "Your vote counts twice. After every meeting you see who voted for who",
    "Accelerator": "Every collected emerald reduces the timer by 1 second",
    "Silencer": "Players cannot write chat messages",
    "Empath": "Every second, you learn how many non-Innocents are within [range] blocks",
    "Frog": "If you are in water for [cooldown] seconds, you win. If a player hits you in there, you die. If you only need [duration] seconds to win, you glow for everyone"
};

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
    ROLE_NAME_TO_COLOR,
    ROLE_NAME_TO_ABILITY_TEXT,
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
