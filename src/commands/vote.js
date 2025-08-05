const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for the bot on top.gg!'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xFF6B6B)
            .setTitle('🗳️ Vote for Discord Summary Bot')
            .setDescription('Support us by voting for the bot on top.gg!')
            .addFields(
                { name: 'Vote Link', value: '[Vote on top.gg](https://top.gg/bot/your-bot-id)', inline: false },
                { name: 'Why Vote?', value: '• Help us reach more users\n• Get access to premium features\n• Support bot development\n• Get notified about updates', inline: false },
                { name: 'Voting Rewards', value: '• Early access to new features\n• Priority support\n• Custom bot features\n• Exclusive server perks', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Thank you for your support!' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 