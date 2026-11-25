import { SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Apply a real-time Lavalink audio filter preset")
    .addStringOption((opt) =>
      opt
        .setName("preset")
        .setDescription("Audio filter preset to apply")
        .setRequired(true)
        .addChoices(
          { name: "Reset / Off", value: "off" },
          { name: "Bass Boost", value: "bassboost" },
          { name: "Nightcore", value: "nightcore" },
          { name: "Vaporwave", value: "vaporwave" },
          { name: "8D Audio", value: "8d" },
          { name: "Karaoke", value: "karaoke" }
        )
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
      requireTrack: true,
    });
    if (!ok) return;

    const preset = interaction.options.getString("preset", true);
    await player.filterManager.resetFilters();

    switch (preset) {
      case "off":
        return interaction.reply("🎛️ Cleared all audio filters.");

      case "bassboost":
        await player.filterManager.setEQ([
          { band: 0, gain: 0.25 },
          { band: 1, gain: 0.2 },
          { band: 2, gain: 0.15 },
          { band: 3, gain: 0.08 },
        ]);
        return interaction.reply("🎛️ Applied **Bass Boost** filter.");

      case "nightcore":
        await player.filterManager.toggleNightcore();
        return interaction.reply("🎛️ Applied **Nightcore** filter.");

      case "vaporwave":
        await player.filterManager.toggleVaporwave();
        return interaction.reply("🎛️ Applied **Vaporwave** filter.");

      case "8d":
        await player.filterManager.toggleRotation(0.2);
        return interaction.reply("🎛️ Applied **8D Audio** filter.");

      case "karaoke":
        await player.filterManager.toggleKaraoke();
        return interaction.reply("🎛️ Applied **Karaoke** filter.");

      default:
        return interaction.reply("🎛️ Cleared all audio filters.");
    }
  },
};
