import util from "dotenv";

util.config();

export type Config = {
	ACCESS_TOKEN?: string;
	CLIENT_ID?: string;
	LOCAL_RAW_CLIPS_PATH?: string;
	LOCAL_PROCESSED_CLIPS_PATH?: string;
	OUTPUT_FILE_NAME?: string;
};

const config: Config = {
	ACCESS_TOKEN: process.env.ACCESS_TOKEN,
	CLIENT_ID: process.env.CLIENT_ID,
	LOCAL_RAW_CLIPS_PATH: process.env.LOCAL_RAW_CLIPS_PATH,
	LOCAL_PROCESSED_CLIPS_PATH: process.env.LOCAL_PROCESSED_CLIPS_PATH,
	OUTPUT_FILE_NAME: process.env.OUTPUT_FILE_NAME,
};

export default config;
