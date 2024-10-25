import { GetClipsQueryParams, Clip } from "../types/twitchTypes";
import { getClips } from "./twitch";

describe('getClips', () => {
    const queryParams: GetClipsQueryParams = {
        game_id: '511224',
        started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        first: 3
    };

    it('returns a promise', () => {
        const result = getClips(queryParams)
        expect(result).toBeInstanceOf(Promise);
    });

    it('the promise resolves', async () => {
        const data = await getClips(queryParams);
        expect(data).resolves;
    });
});