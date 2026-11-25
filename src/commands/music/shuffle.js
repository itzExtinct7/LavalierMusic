import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle all upcoming tracks in the queue"),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
    });
    if (!ok) return;

    if (player.queue.tracks.length < 2) {
      return interaction.reply({
        content: "Need at least 2 upcoming tracks in the queue to shuffle.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await player.queue.shuffle();
    return interaction.reply(`🔀 Shuffled **${player.queue.tracks.length}** upcoming tracks.`);
  },
};
