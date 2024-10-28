# TwitchTrim
A web application that gathers the most popular Twitch clips based on category or broadcaster and merges them into a single video with the option of uploading the compiled video to YouTube.

## Getting Started
### Prerequisites
* [Node.js](https://nodejs.org) and npm installed.
* [FFmpeg](https://ffmpeg.org/) installed (for video processing).
* [Streamlink](https://streamlink.github.io/) installed (for clip downloading).
* Twitch and YouTube API credentials

### Setup
1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/twitch-trim.git
cd twitch-trim
```
2. **Install dependencies:**
```bash
npm install
```
3. **Configure environment variables in a ```.env``` file:**
```
ACCESS_TOKEN=
CLIENT_ID=
LOCAL_RAW_CLIPS_PATH=
```
4. **Build the project**
```bash
npm run build
```
5. **Run the application**
```bash
npm run serve
```