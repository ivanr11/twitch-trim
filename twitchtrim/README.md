# TwitchTrim

A web application that gathers the most popular Twitch clips based on category and merges them into a single video with the option of uploading the compiled video to YouTube.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) and npm installed
- [FFmpeg](https://ffmpeg.org/) installed (for video processing)
- [Streamlink](https://streamlink.github.io/) installed (for clip downloading)
- Twitch and YouTube API credentials

### Setup

1. **Clone the repository:**

```bash
git clone https://github.com/ivanr11/twitch-trim.git
cd twitch-trim/twitchtrim
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables in a** `.env` **file:**

```
TWITCH_ACCESS_TOKEN=
TWITCH_CLIENT_ID=

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URL=
```

4. **Build the project**

```bash
npm run build
```

5. **Run the application**

```bash
npm run start
```
