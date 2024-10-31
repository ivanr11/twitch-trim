import { GetClipsQueryParams } from "../../types/twitchTypes";
import { getClips, getClient } from "./twitch";

// Mock getClient
jest.mock("./twitch", () => ({
	...jest.requireActual("./twitch"),
	getClient: jest.fn(),
}));

describe("getClips()", () => {
	const queryParams: GetClipsQueryParams = {
		game_id: "33214",
		started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		first: 3,
	};

	const badGameId: GetClipsQueryParams = {
		game_id: "0",
		started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		first: 3,
	};

	// Setup mock for getClient's get method
	const mockGet = jest.fn().mockResolvedValue({
		data: { data: [] },
		status: 200,
	});

	beforeEach(() => {
		(getClient as jest.Mock).mockReturnValue({ get: mockGet });
	});

	it("returns a promise (while pending)", () => {
		expect(getClips(queryParams)).toBeInstanceOf(Promise);
	});

	it("returns an array when resolved", async () => {
		await expect(getClips(queryParams)).resolves.toBeInstanceOf(Array);
	});

	it("resolves (request successful)", async () => {
		await expect(getClips(queryParams)).resolves.not.toThrow();
	});

	it("rejects (bad request -- invalid game_id)", async () => {
		await expect(getClips(badGameId)).rejects.toThrow();
	});

	it("calls the appropriate URL endpoint '/clips'", async () => {
		// Uses the mock client setup in beforeEach, which includes mocked 'get' method
		await getClips(queryParams);

		// Verify that get was called with the correct endpoint and parameters
		expect(mockGet).toHaveBeenCalledWith("/clips", {
			params: queryParams,
		});
	});
});
