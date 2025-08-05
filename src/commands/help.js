const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a nice help message with info about the bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🤖 Discord Summary Bot Help')
            .setDescription('A powerful Discord bot that summarizes messages using Google\'s Gemini API.')
            .addFields(
                { 
                    name: '📝 Main Summary Commands', 
                    value: '• `/summary` - Summarize a certain number of previous messages\n• `/unreadsummary` - Summarize all messages since your last message\n• `/fromtosummary` - Summarize messages between time periods',
                    inline: false 
                },
                { 
                    name: '⚙️ Settings Commands', 
                    value: '• `/listmodes` - List your custom summary modes\n• `/addmode` - Add a new summary mode\n• `/removemode` - Remove a summary mode\n• `/setapikey` - Set your Gemini API key\n• `/removeapikey` - Remove your API key\n• `/setlanguage` - Set summary language\n• `/setregion` - Set your timezone\n• `/setthread` - Toggle thread/inline output',
                    inline: false 
                },
                { 
                    name: '🛠️ Helper Commands', 
                    value: '• `/ping` - Check bot latency\n• `/help` - Show this help message\n• `/invite` - Get bot invite link\n• `/support` - Get support server link\n• `/vote` - Vote for the bot\n• `/update` - Check latest updates',
                    inline: false 
                },
                { 
                    name: '🔑 API Key Benefits', 
                    value: '• Unlimited message summaries\n• No rate limits\n• Your key stays private and secure\n• Use `/setapikey` to add your own key',
                    inline: false 
                },
                { 
                    name: '🌍 Language Support', 
                    value: '• Support for multiple languages\n• Use `/setlanguage` to change your preferred language\n• Summaries will be generated in your chosen language',
                    inline: false 
                },
                { 
                    name: '⏰ Time-based Summaries', 
                    value: '• Use `/setregion` to set your timezone\n• Time-based summaries will use your local time\n• Support for relative time inputs (e.g., "2 hours ago")',
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Discord Summary Bot - Powered by Google Gemini' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 