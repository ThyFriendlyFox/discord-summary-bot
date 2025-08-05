const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Check the latest big update to the bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🆕 Latest Update - v1.0.0')
            .setDescription('Here are the latest features and improvements:')
            .addFields(
                { 
                    name: '✨ New Features', 
                    value: '• **Custom Summary Modes** - Create your own summary styles\n• **Multi-language Support** - Summaries in your preferred language\n• **Timezone Support** - Time-based summaries in your local time\n• **Thread/Inline Output** - Choose how summaries are displayed\n• **Personal API Keys** - Use your own OpenAI API key for unlimited usage',
                    inline: false 
                },
                { 
                    name: '🔧 Improvements', 
                    value: '• **Better Error Handling** - More informative error messages\n• **Enhanced Security** - Secure storage of user API keys\n• **Performance Optimizations** - Faster response times\n• **Better UI** - Improved embed designs and formatting',
                    inline: false 
                },
                { 
                    name: '🐛 Bug Fixes', 
                    value: '• Fixed message fetching issues\n• Resolved timezone parsing problems\n• Fixed thread creation errors\n• Improved command validation',
                    inline: false 
                },
                { 
                    name: '📋 Coming Soon', 
                    value: '• **Batch Summaries** - Summarize multiple channels at once\n• **Scheduled Summaries** - Automatic periodic summaries\n• **Export Features** - Export summaries to various formats\n• **Advanced Analytics** - Detailed usage statistics',
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Discord Summary Bot - Always improving!' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 