import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { config } from "../config.js";

/**
 * Format milliseconds into MM:SS or HH:MM:SS.
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0 || !Number.isFinite(ms)) return "LIVE";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Parse a timestamp string like "1:30", "01:02:03", or "90" into milliseconds.
 */
export function parseTimeToMs(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const parts = trimmed.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return null;

  if (parts.length === 2) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }
  if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  return null;
}

/**
 * Create a visual playback progress bar.
 */
export function createProgressBar(current, total, length = 14) {
  if (!total || total <= 0) return "🔴 **LIVE**";
  const ratio = Math.min(1, Math.max(0, current / total));
  const index = Math.round(ratio * (length - 1));
  const bar = Array.from({ length }, (_, i) => (i === index ? "🔘" : "▬")).join("");
  return `${formatDuration(current)} ${bar} ${formatDuration(total)}`;
}

/**
 * Build the Now Playing embed for a track.
 */
export function buildNowPlayingEmbed(player, track) {
  const info = track.info;
  const position = player.position || 0;
  const duration = info.duration || 0;
  const requester = track.requester ? `<@${track.requester.id}>` : "Unknown";
  const loopLabel = player.repeatMode === "off" ? "Off" : player.repeatMode === "track" ? "Track" : "Queue";

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: player.paused ? "Paused" : "Now Playing" })
    .setTitle(info.title || "Unknown Track")
    .setURL(info.uri || null)
    .setDescription(createProgressBar(position, duration))
    .addFields(
      { name: "Artist / Channel", value: info.author || "Unknown", inline: true },
      { name: "Requested By", value: requester, inline: true },
      { name: "Volume / Loop", value: `${player.volume}% • ${loopLabel}`, inline: true }
    )
    .setFooter({ text: `Queue: ${player.queue.tracks.length} upcoming track(s)` });

  if (info.artworkUrl) {
    embed.setThumbnail(info.artworkUrl);
  }

  return embed;
}

/**
 * Build interactive music control buttons for the Now Playing message.
 */
export function buildControlButtons(player) {
  const pauseLabel = player.paused ? "Resume" : "Pause";
  const pauseEmoji = player.paused ? "▶️" : "⏸️";
  const loopEmoji = player.repeatMode === "track" ? "🔂" : "🔁";
  const loopStyle = player.repeatMode === "off" ? ButtonStyle.Secondary : ButtonStyle.Success;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("music_pause")
      .setLabel(pauseLabel)
      .setEmoji(pauseEmoji)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("music_skip")
      .setLabel("Skip")
      .setEmoji("⏭️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_stop")
      .setLabel("Stop")
      .setEmoji("⏹️")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("music_loop")
      .setLabel(`Loop: ${player.repeatMode}`)
      .setEmoji(loopEmoji)
      .setStyle(loopStyle),
    new ButtonBuilder()
      .setCustomId("music_shuffle")
      .setLabel("Shuffle")
      .setEmoji("🔀")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}
