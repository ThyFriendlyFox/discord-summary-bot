const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeapikey')
        .setDescription('Remove your OpenAI API key from being used'),

    async execute(interaction) {
        try {
            const db = new Database();

            // Get current user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            if (!userSettings.gemini_api_key) {
                return interaction.reply({
                    content: '❌ You don\'t have an API key set. Use `/setapikey` to add one.',
                    ephemeral: true
                });
            }

            // Update settings to remove API key
            await db.updateUserSettings(interaction.user.id, {
                ...userSettings,
                gemini_api_key: null
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('🗑️ API Key Removed Successfully')
                .setDescription('Your Gemini API key has been removed and will no longer be used.')
                .addFields(
                    { name: 'What this means', value: '• You\'ll use the bot\'s default API key\n• You\'ll be limited to 2000 messages per summary\n• Your summaries will use the bot\'s rate limits', inline: false },
                    { name: 'To restore', value: 'Use `/setapikey` to add your API key back anytime.', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Removed by ${interaction.user.username}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            db.close();
        } catch (error) {
            console.error('Remove API key command error:', error);
            await interaction.reply({
                content: `❌ Error removing API key: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 