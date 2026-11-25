import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { formatDuration, parseTimeToMs } from "../../utils/formatters.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Jump to a specific timestamp in the current track")
    .addStringOption((opt) =>
      opt
        .setName("time")
        .setDescription("Timestamp (e.g. 1:30, 02:15, or 90)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
      requireTrack: true,
    });
    if (!ok) return;

    const current = player.queue.current;
    if (!current.info.isSeekable) {
      return interaction.reply({
        content: "This track cannot be seeked (for example, a live stream).",
        flags: MessageFlags.Ephemeral,
      });
    }

    const timeInput = interaction.options.getString("time", true);
    const ms = parseTimeToMs(timeInput);

    if (ms === null || ms < 0 || ms > current.info.duration) {
      return interaction.reply({
        content: `Invalid timestamp. Enter a time between \`0:00\` and \`${formatDuration(current.info.duration)}\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await player.seek(ms);
    return interaction.reply(`⏩ Seeked to **${formatDuration(ms)}**.`);
  },
};
