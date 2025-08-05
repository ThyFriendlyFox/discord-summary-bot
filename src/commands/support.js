const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get a link to the support server for the bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🆘 Support Server')
            .setDescription('Need help with the bot? Join our support server!')
            .addFields(
                { name: 'Support Server', value: '[Join our Discord server](https://discord.gg/your-support-server)', inline: false },
                { name: 'What you can get help with', value: '• Bot setup and configuration\n• Troubleshooting issues\n• Feature requests\n• Bug reports\n• General questions', inline: false },
                { name: 'Other Support Options', value: '• Check `/help` for command information\n• Use `/ping` to check bot status\n• Read the documentation in the support server', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Discord Summary Bot Support' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 