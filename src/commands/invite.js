const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get an invite link for the bot'),

    async execute(interaction) {
        const clientId = process.env.BOT_CLIENT_ID || interaction.client.user.id;
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=274877910016&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🔗 Invite Discord Summary Bot')
            .setDescription('Click the link below to invite the bot to your server!')
            .addFields(
                { name: 'Invite Link', value: `[Click here to invite the bot](${inviteUrl})`, inline: false },
                { name: 'Required Permissions', value: '• Send Messages\n• Use Slash Commands\n• Read Message History\n• Create Public Threads\n• Send Messages in Threads\n• Embed Links\n• Attach Files', inline: false },
                { name: 'Features', value: '• Message summarization\n• Custom summary modes\n• Multi-language support\n• Timezone support\n• Thread/inline output options', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Discord Summary Bot' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 