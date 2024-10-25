import axios from 'axios';
import dotenv from 'dotenv';
import { GetClipsQueryParams, Clip } from '../types/twitchTypes';

dotenv.config();

export async function getClips(queryParams: GetClipsQueryParams): Promise<Clip[]> {
    const baseUrl = 'https://api.twitch.tv/helix';
    const instance = axios.create({
        baseURL: baseUrl,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.ACCESS_TOKEN,
            'Client-id': process.env.CLIENT_ID,
        }
    });

    try {
        const response = await instance.get('/clips', {
            params: {
                ...queryParams
            }
        });

        const clips: Clip[] = response.data.data;

        if (response.status >= 200 && response.status < 300) {
            console.log('Request successful:', response.data);
        }

        return clips;
    } catch (error) {
        throw new Error(`Error fetching clips: ${error}`);
    }
}