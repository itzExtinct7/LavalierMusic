import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { config } from "../../config.js";
import { formatDuration } from "../../utils/formatters.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the current playback queue")
    .addIntegerOption((opt) =>
      opt
        .setName("page")
        .setDescription("Queue page number")
        .setMinValue(1)
    ),

  async execute(interaction) {
    const { ok, player } = await validateVoiceState(interaction, {
      requirePlayer: true,
      requireTrack: true,
    });
    if (!ok) return;

    const tracks = player.queue.tracks;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(tracks.length / pageSize));
    const page = Math.min(interaction.options.getInteger("page") || 1, totalPages);

    const start = (page - 1) * pageSize;
    const pageTracks = tracks.slice(start, start + pageSize);

    const current = player.queue.current;
    const totalMs =
      (current.info.duration || 0) +
      tracks.reduce((acc, t) => acc + (t.info.duration || 0), 0);

    const upcomingList =
      pageTracks.length > 0
        ? pageTracks
            .map(
              (t, idx) =>
                `**${start + idx + 1}.** [${t.info.title}](${t.info.uri}) \`[${formatDuration(t.info.duration)}]\``
            )
            .join("\n")
        : "_No upcoming tracks in the queue._";

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle("Server Music Queue")
      .addFields({
        name: "Now Playing",
        value: `[${current.info.title}](${current.info.uri}) \`[${formatDuration(current.info.duration)}]\``,
      })
      .setDescription(`**Up Next:**\n${upcomingList}`)
      .setFooter({
        text: `Page ${page}/${totalPages} • ${tracks.length} queued • Total: ${formatDuration(totalMs)} • Loop: ${player.repeatMode}`,
      });

    return interaction.reply({ embeds: [embed] });
  },
};
