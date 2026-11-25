import { SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set the repeat mode for playback")
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("Repeat mode")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Current Track", value: "track" },
          { name: "Entire Queue", value: "queue" }
        )
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
    });
    if (!ok) return;

    const mode = interaction.options.getString("mode", true);
    await player.setRepeatMode(mode);

    const labels = {
      off: "Loop disabled.",
      track: "🔂 Looping the **current track**.",
      queue: "🔁 Looping the **entire queue**.",
    };
    return interaction.reply(labels[mode]);
  },
};
