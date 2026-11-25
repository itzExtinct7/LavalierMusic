import "dotenv/config";

const requiredVars = ["DISCORD_TOKEN", "CLIENT_ID", "LAVALINK_HOST", "LAVALINK_PASSWORD"];
for (const key of requiredVars) {
  if (!process.env[key]) {
    console.warn(`[Config] Warning: Missing environment variable "${key}". Check your .env file.`);
  }
}

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN || "",
    clientId: process.env.CLIENT_ID || "",
    guildId: process.env.GUILD_ID || "",
  },
  lavalink: {
    id: "main-node",
    host: process.env.LAVALINK_HOST || "freelavalinkvinster.in",
    port: Number(process.env.LAVALINK_PORT || 433),
    authorization: process.env.LAVALINK_PASSWORD || "youshallnotpass",
    secure: process.env.LAVALINK_SECURE === "true",
    retryAmount: 5,
    retryDelay: 5000,
  },
  player: {
    defaultVolume: Math.min(150, Math.max(1, Number(process.env.DEFAULT_VOLUME || 80))),
    defaultSearchSource: process.env.DEFAULT_SEARCH_SOURCE || "ytsearch",
    emptyDisconnectMs: 60_000,
  },
  colors: {
    primary: 0x5865f2, // Discord Blurple
    success: 0x57f287,
    warning: 0xfee75c,
    error: 0xed4245,
  },
};
