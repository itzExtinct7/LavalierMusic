import { SlashCommandBuilder } from "discord.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track or jump ahead in the queue")
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Number of tracks to skip (default: 1)")
        .setMinValue(1)
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
      requireTrack: true,
    });
    if (!ok) return;

    const amount = interaction.options.getInteger("amount") || 1;
    const currentTitle = player.queue.current.info.title;

    if (player.queue.tracks.length === 0) {
      await player.stopPlaying(true, false);
      return interaction.reply(`⏭️ Skipped **${currentTitle}**. Queue is now empty.`);
    }

    if (amount > 1) {
      const skipCount = Math.min(amount, player.queue.tracks.length);
      await player.skip(skipCount);
      return interaction.reply(`⏭️ Skipped **${skipCount}** tracks.`);
    }

    await player.skip();
    return interaction.reply(`⏭️ Skipped **${currentTitle}**.`);
  },
};
