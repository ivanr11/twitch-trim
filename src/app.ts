// import express from 'express';
import { getClips } from "./api/twitch";
import { createVideo } from "./api/ffmpeg";
import { GetClipsQueryParams } from "./types/twitchTypes";

const queryParams: GetClipsQueryParams = {
	game_id: "33214",
	started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
	first: 2,
};

async function test() {
	const clips = await getClips(queryParams);
	createVideo(clips);
}

test();

// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//     res.send('Hello world');
// })

// app.listen(port, () => {
//     console.log(`App listening on port ${port}`)
// })
