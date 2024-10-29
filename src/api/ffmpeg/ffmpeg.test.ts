import {
	clearDirectories,
	setupDirectories,
	downloadClips,
	processClips,
	concatenateClips,
} from "./ffmpeg";
import fs from "fs";
import { execSync } from "child_process";
import { Clip } from "../../types/twitchTypes";
// import config from "../../config";

jest.mock("fs");
jest.mock("child_process");

describe("clearDirectories", () => {
	const mockFsExistsSync = fs.existsSync as jest.Mock;
	const mockFsRmSync = fs.rmSync as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should remove the raw clips directory if it exists", () => {
		mockFsExistsSync.mockReturnValueOnce(true); // raw clips path exists
		clearDirectories();
		expect(mockFsRmSync).toHaveBeenCalledWith(expect.any(String), {
			recursive: true,
		});
	});

	it("should remove the processed clips directory if it exists", () => {
		mockFsExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(true); // processed clips path exists
		clearDirectories();
		expect(mockFsRmSync).toHaveBeenCalledWith(expect.any(String), {
			recursive: true,
		});
	});
});

describe("setupDirectories", () => {
	const mockEnsureDirectoryExistence = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should clear directories and ensure necessary directories exist", () => {
		setupDirectories();
		expect(mockEnsureDirectoryExistence).toHaveBeenCalledTimes(2);
		expect(mockEnsureDirectoryExistence).toHaveBeenNthCalledWith(
			1,
			expect.any(String),
		);
		expect(mockEnsureDirectoryExistence).toHaveBeenNthCalledWith(
			2,
			expect.any(String),
		);
	});
});

describe("downloadClips", () => {
	const mockExecSync = execSync as jest.Mock;

	const clips: Clip[] = [
		{
			id: "AssiduousHandsomeBobaCoolCat-8OMb6tm6AuFXdO8x",
			url: "https://clips.twitch.tv/AssiduousHandsomeBobaCoolCat-8OMb6tm6AuFXdO8x",
			embed_url:
				"https://clips.twitch.tv/embed?clip=AssiduousHandsomeBobaCoolCat-8OMb6tm6AuFXdO8x",
			broadcaster_id: "233300375",
			broadcaster_name: "Clix",
			creator_id: "210984211",
			creator_name: "NotMarkX",
			video_id: "2266884638",
			game_id: "33214",
			language: "en",
			title: "????",
			view_count: 207883,
			created_at: "2024-10-03T23:28:19Z",
			thumbnail_url:
				"https://static-cdn.jtvnw.net/twitch-clips-thumbnails-prod/AssiduousHandsomeBobaCoolCat-8OMb6tm6AuFXdO8x/42540528-ffa7-4b9c-9182-f44ded6cecb0/preview-480x272.jpg",
			duration: 5.1,
			vod_offset: 6817,
			is_featured: true,
		},
		{
			id: "KitschyDepressedTaroSoBayed-TWBPTEN8tTbfpp8T",
			url: "https://clips.twitch.tv/KitschyDepressedTaroSoBayed-TWBPTEN8tTbfpp8T",
			embed_url:
				"https://clips.twitch.tv/embed?clip=KitschyDepressedTaroSoBayed-TWBPTEN8tTbfpp8T",
			broadcaster_id: "37455669",
			broadcaster_name: "ConnorEatsPants",
			creator_id: "19678017",
			creator_name: "Ikuorai",
			video_id: "2267749289",
			game_id: "33214",
			language: "en",
			title: "how to diffuse an argument with George Santos",
			view_count: 71955,
			created_at: "2024-10-05T00:28:47Z",
			thumbnail_url:
				"https://static-cdn.jtvnw.net/twitch-clips-thumbnails-prod/KitschyDepressedTaroSoBayed-TWBPTEN8tTbfpp8T/2991376c-ff16-47bf-a373-088891a36caa/preview-480x272.jpg",
			duration: 29.1,
			vod_offset: 5731,
			is_featured: true,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should download each clip using execSync with the correct command", () => {
		downloadClips(clips);

		// Ensure execSync is called with correct parameters for each clip
		expect(mockExecSync).toHaveBeenCalledTimes(clips.length);
		clips.forEach((clip) => {
			expect(mockExecSync).toHaveBeenCalledWith(
				expect.stringContaining(`${clip.id}.mp4`),
				expect.stringContaining(clip.url),
			);
		});
	});
});

describe("processClips", () => {
	const mockExecSync = execSync as jest.Mock;
	const mockFsReaddirSync = fs.readdirSync as jest.Mock;
	const localRawClipsPath = "./mock/raw";
	const localProcessedClipsPath = "./mock/processed";

	beforeEach(() => {
		jest.clearAllMocks();
		mockFsReaddirSync.mockReturnValue(["clip1.mp4", "clip2.mp4"]);
	});

	it("should process each clip file in the directory using execSync", () => {
		processClips();
		expect(mockExecSync).toHaveBeenCalledTimes(2);
		expect(mockExecSync).toHaveBeenCalledWith(
			expect.stringContaining(`${localRawClipsPath}/clip1.mp4`),
			expect.stringContaining(`${localProcessedClipsPath}/clip1.mp4`),
		);
		expect(mockExecSync).toHaveBeenCalledWith(
			expect.stringContaining(`${localRawClipsPath}/clip2.mp4`),
			expect.stringContaining(`${localProcessedClipsPath}/clip2.mp4`),
		);
	});
});

describe("concatenateClips", () => {
	const mockExecSync = execSync as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should create a filelist.txt and concatenate clips using execSync", () => {
		concatenateClips();
		expect(mockExecSync).toHaveBeenCalledTimes(2);
		expect(mockExecSync).toHaveBeenCalledWith(
			expect.stringContaining("filelist.txt"),
		);
		expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(".mp4"));
	});
});
