import axios from 'axios';
import fs from 'fs';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import config from '../../config.json'

dotenv.config();

// Fetch clips, download and store in 'raw-clips' folder
export async function getClips() {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/clips`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.ACCESS_TOKEN,
                'Client-id': process.env.CLIENT_ID,
            },
            params: {
                game_id: config.twitch.game_id,
                started_at: config.twitch.start_date,
                first: config.twitch.clip_limit,
            },
        });

        const clips = response.data.data;

        const localRawClipsPath = './raw-clips';
        
        // Make raw clips directory (if it doesn't already exist)
        if (!fs.existsSync(localRawClipsPath)) {
            fs.mkdirSync(localRawClipsPath, { recursive: true });
            console.log(`Path created at: ${localRawClipsPath}`);
        }

        // Download each clip
        for (const clip of clips) {
            exec(`streamlink --output ${localRawClipsPath}/${clip.id}.mp4 ${clip.url} best`)
            .on('error', (error) => {
                console.error('Exec error:', error);
            })
            .on('close', () => {
                console.log(`Downloaded clip ${clip.id} to ${localRawClipsPath}/${clip.id}`)
            });
        }
    } catch (error) {
        console.error('Error fetching clips:', error);
    }
}