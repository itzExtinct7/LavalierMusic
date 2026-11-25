import { MessageFlags } from "discord.js";
import { buildControlButtons, buildNowPlayingEmbed } from "../utils/formatters.js";
import { validateVoiceState } from "../utils/validators.js";

/**
 * Handles interactive button clicks on the Now Playing controller.
 */
export async function handleMusicButton(interaction) {
  const { ok, player } = await validateVoiceState(interaction, {
    requirePlayer: true,
    requireTrack: true,
  });
  if (!ok) return;

  const currentTrack = player.queue.current;

  switch (interaction.customId) {
    case "music_pause": {
      if (player.paused) {
        await player.resume();
      } else {
        await player.pause();
      }
      await interaction.update({
        embeds: [buildNowPlayingEmbed(player, currentTrack)],
        components: buildControlButtons(player),
      });
      break;
    }

    case "music_skip": {
      if (player.queue.tracks.length === 0) {
        await player.stopPlaying(true, false);
        await interaction.reply({
          content: "Skipped the last track and cleared playback.",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await player.skip();
        await interaction.reply({
          content: `Skipped **${currentTrack.info.title}**.`,
          flags: MessageFlags.Ephemeral,
        });
      }
      break;
    }

    case "music_stop": {
      await player.destroy("Stopped via controller button");
      await interaction.reply({
        content: "Stopped playback, cleared the queue, and disconnected.",
        flags: MessageFlags.Ephemeral,
      });
      break;
    }

    case "music_loop": {
      const modes = ["off", "track", "queue"];
      const nextMode = modes[(modes.indexOf(player.repeatMode) + 1) % modes.length];
      await player.setRepeatMode(nextMode);
      await interaction.update({
        embeds: [buildNowPlayingEmbed(player, currentTrack)],
        components: buildControlButtons(player),
      });
      break;
    }

    case "music_shuffle": {
      if (player.queue.tracks.length < 2) {
        await interaction.reply({
          content: "Need at least 2 upcoming tracks in the queue to shuffle.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await player.queue.shuffle();
      await interaction.reply({
        content: `Shuffled **${player.queue.tracks.length}** upcoming tracks.`,
        flags: MessageFlags.Ephemeral,
      });
      break;
    }

    default:
      break;
  }
}
