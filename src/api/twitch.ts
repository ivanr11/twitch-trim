const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Fetch clips and put them in raw clips folder
export async function getClips() {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/clips`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '',
                'Client-id': ''
            },
            params: {
                game_id: '516575',
                started_at: '2024-09-19T20:17:14.578Z',
                first: '4'
            }
        });

        const clips = response.data.data;
        console.log(clips);

        const localRawClipsPath = './raw-clips';
        // Make raw clips directory (if it doesn't alr exist), download clip and store in folder.
        if(!fs.existsSync(localRawClipsPath)) {
            fs.mkdirSync(localRawClipsPath, { recursive: true });
            console.log(`Path created at: ${localRawClipsPath}`);
        }

        for (const clip of clips) {
            // Get clip url and create file path inside localrawclips folder
            const clipUrl = clip.thumbnail_url.replace('-preview-480x272.jpg', '.mp4');
            const filePath = path.resolve(localRawClipsPath, `${clip.id}.mp4`);

            console.log(`Downloading clip: ${clipUrl} to ${filePath}`);

            // fetch the clip and stream it into a file
            const clipResponse = await axios.get(clipUrl, {
                responseType: 'stream',
            })

            // if (clipResponse.statusText !== 'OK') {
            //     throw new Error (`Failed to download clip: ${clipResponse.statusText}`);
            // }

            // Create a writeable stream to the clip filepath in localrawclips
            const writeStream = fs.createWriteStream(filePath);
            // Actually download the file to the stream
            await clipResponse.data.pipe(writeStream);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching clips:', error.message);
        } else {
            console.error('Error fetching clips:', error);
        }
    }
}

getClips();