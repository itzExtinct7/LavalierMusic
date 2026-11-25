import { SlashCommandBuilder } from "discord.js";
import { buildControlButtons, buildNowPlayingEmbed } from "../../utils/formatters.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Display the currently playing track and interactive controls"),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
      requireTrack: true,
    });
    if (!ok) return;

    return interaction.reply({
      embeds: [buildNowPlayingEmbed(player, player.queue.current)],
      components: buildControlButtons(player),
    });
  },
};
