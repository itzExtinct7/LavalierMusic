import { SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback, clear the queue, and disconnect from voice"),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
    });
    if (!ok) return;

    await player.destroy("Stopped by user");
    return interaction.reply("⏹️ Stopped playback, cleared the queue, and disconnected.");
  },
};
