import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";
import { buildControlButtons, buildNowPlayingEmbed } from "../utils/formatters.js";

/**
 * Registers Lavalink node and player lifecycle event listeners.
 */
export function registerLavalinkEvents(client) {
  const { lavalink } = client;

  // --- Node Manager Events ---
  lavalink.nodeManager.on("connect", (node) => {
    console.log(`[Lavalink] Node "${node.id}" connected.`);
  });

  lavalink.nodeManager.on("disconnect", (node, reason) => {
    console.warn(`[Lavalink] Node "${node.id}" disconnected:`, reason);
  });

  lavalink.nodeManager.on("error", (node, error) => {
    console.error(`[Lavalink] Node "${node.id}" error:`, error.message);
  });

  lavalink.nodeManager.on("resumed", (node, payload, players) => {
    console.log(`[Lavalink] Node "${node.id}" resumed session (${players?.length || 0} players).`);
  });

  // --- Player Events ---
  lavalink.on("trackStart", async (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;

    try {
      const msg = await channel.send({
        embeds: [buildNowPlayingEmbed(player, track)],
        components: buildControlButtons(player),
      });
      player.set("nowPlayingMessageId", msg.id);
    } catch (err) {
      console.error("[Lavalink] Failed to send Now Playing message:", err.message);
    }
  });

  lavalink.on("trackEnd", async (player) => {
    await cleanupNowPlayingMessage(client, player);
  });

  lavalink.on("queueEnd", async (player) => {
    await cleanupNowPlayingMessage(client, player);

    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setDescription("Queue finished. Add more songs with `/play`, or I will leave shortly.");
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  });

  lavalink.on("trackError", async (player, track, payload) => {
    console.error(`[Lavalink] Track error for "${track?.info?.title}":`, payload);
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      channel.send(`Failed to play **${track?.info?.title || "track"}**. Skipping...`).catch(() => {});
    }
  });

  lavalink.on("trackStuck", async (player, track) => {
    console.warn(`[Lavalink] Track stuck: "${track?.info?.title}". Skipping...`);
    if (player.queue.tracks.length > 0) {
      await player.skip().catch(() => {});
    }
  });

  lavalink.on("playerDestroy", async (player, reason) => {
    await cleanupNowPlayingMessage(client, player);
    console.log(`[Lavalink] Player destroyed in guild ${player.guildId} (reason: ${reason}).`);
  });
}

async function cleanupNowPlayingMessage(client, player) {
  const messageId = player.get("nowPlayingMessageId");
  if (!messageId || !player.textChannelId) return;

  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel) return;

  const msg = await channel.messages.fetch(messageId).catch(() => null);
  if (msg) {
    await msg.edit({ components: [] }).catch(() => {});
  }
  player.set("nowPlayingMessageId", null);
}
