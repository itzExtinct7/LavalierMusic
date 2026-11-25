import { MessageFlags } from "discord.js";

/**
 * Ensures the user is in a voice channel and (if a player exists) in the same VC as the bot.
 * Returns { ok: boolean, voiceChannel, player }.
 */
export async function validateVoiceState(interaction, { requirePlayer = false, requireTrack = false } = {}) {
  const voiceChannel = interaction.member?.voice?.channel;
  if (!voiceChannel) {
    await interaction.reply({
      content: "You need to be in a voice channel to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return { ok: false };
  }

  const player = interaction.client.lavalink.getPlayer(interaction.guildId);

  if (requirePlayer && !player) {
    await interaction.reply({
      content: "There is no active music player in this server.",
      flags: MessageFlags.Ephemeral,
    });
    return { ok: false };
  }

  if (player && player.voiceChannelId && player.voiceChannelId !== voiceChannel.id) {
    await interaction.reply({
      content: `You must be in <#${player.voiceChannelId}> to control the music player.`,
      flags: MessageFlags.Ephemeral,
    });
    return { ok: false };
  }

  if (requireTrack && (!player || !player.queue.current)) {
    await interaction.reply({
      content: "Nothing is currently playing.",
      flags: MessageFlags.Ephemeral,
    });
    return { ok: false };
  }

  return { ok: true, voiceChannel, player };
}
