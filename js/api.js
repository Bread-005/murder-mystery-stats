const API_BASE_URL = "https://hobby-projects-api.onrender.com";

/**
 * Fetches all persisted Chaosmurder player records from the backend.
 * @returns {Promise<Array<Object>>} Raw player documents as stored in MongoDB.
 */
async function fetchPlayers() {
    const response = await fetch(`${API_BASE_URL}/chaosmurder/players`);
    if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.status}`);
    }
    return response.json();
}

/**
 * Fetches all persisted Chaosmurder game records from the backend.
 * @returns {Promise<Array<Object>>} Raw game documents as stored in MongoDB.
 */
async function fetchGames() {
    const response = await fetch(`${API_BASE_URL}/chaosmurder/games`);
    if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`);
    }
    return response.json();
}

export {fetchPlayers, fetchGames};
