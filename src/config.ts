import dotenv from "dotenv";

dotenv.config();

export type Config = {
	ACCESS_TOKEN?: string;
	CLIENT_ID?: string;
	LOCAL_RAW_CLIPS_PATH?: string;
	LOCAL_PROCESSED_CLIPS_PATH?: string;
};

const config: Config = {
	ACCESS_TOKEN: process.env.ACCESS_TOKEN,
	CLIENT_ID: process.env.CLIENT_ID,
	LOCAL_RAW_CLIPS_PATH: process.env.LOCAL_RAW_CLIPS_PATH,
	LOCAL_PROCESSED_CLIPS_PATH: process.env.LOCAL_PROCESSED_CLIPS_PATH,
};

export default config;
