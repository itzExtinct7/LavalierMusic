import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a specific track from the queue")
    .addIntegerOption((opt) =>
      opt
        .setName("position")
        .setDescription("Queue position to remove (1 = next track)")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
    });
    if (!ok) return;

    const position = interaction.options.getInteger("position", true);
    if (position > player.queue.tracks.length) {
      return interaction.reply({
        content: `Invalid position. The queue only has **${player.queue.tracks.length}** upcoming track(s).`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const removed = await player.queue.remove(position - 1);
    const title = removed?.info?.title || `Track #${position}`;
    return interaction.reply(`🗑️ Removed **${title}** from the queue.`);
  },
};
