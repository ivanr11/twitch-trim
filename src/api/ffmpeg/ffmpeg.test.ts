import { clearDirectories } from "./ffmpeg";
import fs from "fs";

jest.mock("fs");

describe("clearDirectories", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// Set global variables for the test
		global.localRawClipsPath = "raw-clips";
		global.localProcessedClipsPath = "processed-clips";
	});

	it("should remove the raw clips directory if it exists", () => {
		// Mock fs.existsSync to return true for the raw clips directory
		(fs.existsSync as jest.Mock).mockImplementation(
			(path) => path === `./${global.localRawClipsPath}`,
		);

		// Mock fs.rmSync to track calls
		(fs.rmSync as jest.Mock).mockImplementation(() => {});

		clearDirectories();

		// Check if fs.rmSync was called for the raw clips directory
		expect(fs.rmSync).toHaveBeenCalledWith(global.localRawClipsPath, {
			recursive: true,
		});
	});
});
