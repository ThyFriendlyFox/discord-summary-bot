const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setapikey')
        .setDescription('Set your own Gemini API key for unlimited usage')
        .addStringOption(option =>
            option.setName('api_key')
                .setDescription('Your Gemini API key')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const apiKey = interaction.options.getString('api_key');
            const db = new Database();

            // Basic validation
            if (apiKey.length < 10) {
                return interaction.reply({
                    content: '❌ API key seems too short. Please check your Gemini API key.',
                    ephemeral: true
                });
            }

            // Get current user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Update settings with new API key
            await db.updateUserSettings(interaction.user.id, {
                ...userSettings,
                gemini_api_key: apiKey
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔑 API Key Set Successfully')
                .setDescription('Your Gemini API key has been saved and will be used for all your summaries.')
                .addFields(
                    { name: 'Benefits', value: '• Unlimited message summaries\n• No rate limits\n• Your key stays private and secure', inline: false },
                    { name: 'Security', value: 'Your API key is encrypted and stored securely. Only you can access it.', inline: false },
                    { name: 'Usage', value: 'Your key will be used automatically for all summary commands.', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Set by ${interaction.user.username}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            db.close();
        } catch (error) {
            console.error('Set API key command error:', error);
            await interaction.reply({
                content: `❌ Error setting API key: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 