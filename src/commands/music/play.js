import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { config } from "../../config.js";
import { formatDuration } from "../../utils/formatters.js";
import { validateVoiceState } from "../../utils/validators.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist from YouTube, YouTube Music, or SoundCloud")
    .addStringOption((opt) =>
      opt
        .setName("query")
        .setDescription("Song name or URL (YouTube, SoundCloud, etc.)")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("source")
        .setDescription("Search platform (ignored if a direct URL is provided)")
        .addChoices(
          { name: "YouTube", value: "ytsearch" },
          { name: "YouTube Music", value: "ytmsearch" },
          { name: "SoundCloud", value: "scsearch" }
        )
    ),

  async execute(interaction) {
    const { ok, voiceChannel } = await validateVoiceState(interaction);
    if (!ok) return;

    await interaction.deferReply();

    const query = interaction.options.getString("query", true);
    const source = interaction.options.getString("source") || config.player.defaultSearchSource;

    const player =
      interaction.client.lavalink.getPlayer(interaction.guildId) ||
      interaction.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: voiceChannel.id,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: config.player.defaultVolume,
      });

    if (!player.connected) {
      await player.connect();
    }

    const res = await player.search({ query, source }, interaction.user);

    if (!res || !res.tracks?.length) {
      return interaction.editReply("No results found for that query.");
    }

    if (res.loadType === "playlist") {
      await player.queue.add(res.tracks);

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle("Playlist Added to Queue")
        .setDescription(
          `Added **${res.tracks.length}** tracks from **${res.playlist?.name || "Playlist"}**`
        );

      if (!player.playing && !player.paused) {
        await player.play();
      }
      return interaction.editReply({ embeds: [embed] });
    }

    const track = res.tracks[0];
    await player.queue.add(track);

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle("Added to Queue")
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .addFields(
        { name: "Duration", value: formatDuration(track.info.duration), inline: true },
        { name: "Position", value: `#${player.queue.tracks.length}`, inline: true }
      );

    if (track.info.artworkUrl) {
      embed.setThumbnail(track.info.artworkUrl);
    }

    if (!player.playing && !player.paused) {
      await player.play();
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
