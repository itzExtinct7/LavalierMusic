import { SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Adjust the playback volume (1–150%)")
    .addIntegerOption((opt) =>
      opt
        .setName("level")
        .setDescription("Volume percentage (1 to 150)")
        .setMinValue(1)
        .setMaxValue(150)
        .setRequired(true)
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
    });
    if (!ok) return;

    const level = interaction.options.getInteger("level", true);
    await player.setVolume(level);
    return interaction.reply(`🔊 Volume set to **${level}%**.`);
  },
};
