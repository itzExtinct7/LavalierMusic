import { SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause or resume the current track"),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
      requireTrack: true,
    });
    if (!ok) return;

    if (player.paused) {
      await player.resume();
      return interaction.reply("▶️ Resumed playback.");
    }

    await player.pause();
    return interaction.reply("⏸️ Paused playback.");
  },
};
