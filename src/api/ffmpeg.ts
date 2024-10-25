import fs from 'fs';
import { exec } from 'child_process';
import { Clip } from '../types/twitchTypes';

async function downloadClips(clips: Clip[]) {
    if (!process.env.LOCAL_RAW_CLIPS_PATH) {
        throw new Error("Unexpected error: Missing local raw clips path");
    }
    const localRawClipsPath = process.env.LOCAL_RAW_CLIPS_PATH;
    
    
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
}