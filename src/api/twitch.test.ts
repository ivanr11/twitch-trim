import { GetClipsQueryParams } from "../types/twitchTypes";
import { getClips } from "./twitch";

describe('getClips()', () => {
    const queryParams: GetClipsQueryParams = {
        game_id: '33214',
        started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        first: 3,
    }

    const badGameId: GetClipsQueryParams = {
        game_id: '0',
        started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        first: 3,
    }

    it('returns a promise (while pending)', () => {
        expect(getClips(queryParams)).toBeInstanceOf(Promise);
    });

    it('returns an array when resolved', async () => {
        await expect(getClips(queryParams)).resolves.toBeInstanceOf(Array);
    })

    it('resolves (request successful)', async () => {
        await expect(getClips(queryParams)).resolves.not.toThrow();
    });

    it('rejects (bad request -- invalid game_id)', async () => {
        await expect(getClips(badGameId)).rejects.toThrow();
    });
});