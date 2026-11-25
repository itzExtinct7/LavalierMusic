# Advanced Discord Music Bot (Node.js + Lavalink v4)

A modular, production-ready Discord music bot built with **Discord.js v14** and **`lavalink-client`** for **Lavalink v4**, designed for YouTube tutorials and self-hosted servers.

## Features

- **Lavalink v4 Native**: Uses `lavalink-client` with session resuming, auto-skip, and **DAVE** (Discord Audio & Video End-to-End Encryption) compatibility when paired with Lavalink v4.2.0+.
- **YouTube Plugin Ready**: Pre-configured `lavalink/application.yml` with `dev.lavalink.youtube:youtube-plugin:1.18.2`.
- **Interactive Now Playing Controller**: Live progress bar, track artwork, and clickable buttons (**Pause/Resume**, **Skip**, **Stop**, **Loop**, **Shuffle**).
- **12 Slash Commands**: `/play`, `/pause`, `/skip`, `/stop`, `/queue`, `/nowplaying`, `/volume`, `/loop`, `/shuffle`, `/seek`, `/filter`, and `/remove`.
- **Real-Time Audio Filters**: Bass Boost, Nightcore, Vaporwave, 8D Audio, and Karaoke via Lavalink filters.
- **Docker Support**: Includes `docker-compose.yml` to spin up Lavalink v4 in one command.

## Project Structure

```text
discord-lavalink-music-bot/
├── docker-compose.yml
├── lavalink/
│   └── application.yml
├── src/
│   ├── commands/music/
│   │   ├── filter.js
│   │   ├── loop.js
│   │   ├── nowplaying.js
│   │   ├── pause.js
│   │   ├── play.js
│   │   ├── queue.js
│   │   ├── remove.js
│   │   ├── seek.js
│   │   ├── shuffle.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   └── volume.js
│   ├── handlers/
│   │   ├── buttonHandler.js
│   │   ├── commandHandler.js
│   │   └── lavalinkEvents.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── config.js
│   └── index.js
├── .env.example
└── package.json
```

## Setup Guide

### 1. Prerequisites
- **Node.js 18.18+** (Node.js 20+ recommended)
- **Docker** (recommended for Lavalink) **or Java 17+** with [Lavalink v4.2.0+](https://github.com/lavalink-devs/Lavalink/releases)
- A Discord Application & Bot Token from the [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Start Lavalink v4
Using Docker:
```bash
docker compose up -d
```
Or manually with Java:
1. Download `Lavalink.jar` (v4.2.0 or newer) into `lavalink/`.
2. Run inside `lavalink/`:
```bash
java -jar Lavalink.jar
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
- `DISCORD_TOKEN`: Your bot token
- `CLIENT_ID`: Your Discord application ID
- `GUILD_ID` *(optional)*: Your test server ID for instant slash-command registration while recording

### 4. Install Dependencies & Run
```bash
npm install
npm start
```

## Slash Commands

| Command | Description |
| :--- | :--- |
| `/play <query> [source]` | Play a song or playlist from YouTube, YouTube Music, or SoundCloud |
| `/pause` | Pause or resume the current track |
| `/skip [amount]` | Skip the current track or jump ahead |
| `/stop` | Stop playback, clear the queue, and disconnect |
| `/queue [page]` | View the paginated server queue |
| `/nowplaying` | Show the current track with live progress bar and buttons |
| `/volume <level>` | Adjust volume (1–150%) |
| `/loop <mode>` | Set repeat mode (`off`, `track`, `queue`) |
| `/shuffle` | Shuffle upcoming tracks in the queue |
| `/seek <time>` | Jump to a timestamp (e.g., `1:30` or `90`) |
| `/filter <preset>` | Apply audio filters (`off`, `bassboost`, `nightcore`, `vaporwave`, `8d`, `karaoke`) |
| `/remove <position>` | Remove a specific track from the queue |
