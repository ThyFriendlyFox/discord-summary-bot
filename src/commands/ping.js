const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check your ping with our server'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🏓 Pong!')
            .setDescription('Here are the current latency statistics:')
            .addFields(
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                { name: 'Status', value: apiLatency < 100 ? '🟢 Excellent' : apiLatency < 200 ? '🟡 Good' : '🔴 Poor', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}` });

        await interaction.editReply({ embeds: [embed] });
    },
}; 