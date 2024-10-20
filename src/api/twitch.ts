// 24h 
const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
// 7d
const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
// 30d
const month = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();


// Fetch clips and put them in raw clips folder
export async function getClips() {
    try {
        const response = await fetch('https://api.twitch.tv/helix/clips?game_id=516575&started_at=2024-09-19T20:17:14.578Z&first=4');
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json;
        console.log(json);
    } catch (err) {
        console.error(err);
    }
}
