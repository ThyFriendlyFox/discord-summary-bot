const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlanguage')
        .setDescription('Set your language that you want your summaries to be summarized in')
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Language code (e.g., en, es, fr, de, ja, zh)')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const language = interaction.options.getString('language').toLowerCase();
            const db = new Database();

            // Basic validation
            if (language.length < 2 || language.length > 5) {
                return interaction.reply({
                    content: '❌ Invalid language code. Use a 2-5 character language code (e.g., en, es, fr, de, ja, zh).',
                    ephemeral: true
                });
            }

            // Get current user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Update settings with new language
            await db.updateUserSettings(interaction.user.id, {
                ...userSettings,
                language: language
            });

            const languageNames = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
                'it': 'Italian',
                'pt': 'Portuguese',
                'ru': 'Russian',
                'ja': 'Japanese',
                'zh': 'Chinese',
                'ko': 'Korean',
                'ar': 'Arabic',
                'hi': 'Hindi',
                'nl': 'Dutch',
                'sv': 'Swedish',
                'no': 'Norwegian',
                'da': 'Danish',
                'fi': 'Finnish',
                'pl': 'Polish',
                'tr': 'Turkish',
                'he': 'Hebrew'
            };

            const languageName = languageNames[language] || language;

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🌍 Language Set Successfully')
                .setDescription(`Your summaries will now be generated in **${languageName}**.`)
                .addFields(
                    { name: 'Language Code', value: language, inline: true },
                    { name: 'Language Name', value: languageName, inline: true },
                    { name: 'Next Summary', value: 'Your next summary will be in this language!', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Set by ${interaction.user.username}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            db.close();
        } catch (error) {
            console.error('Set language command error:', error);
            await interaction.reply({
                content: `❌ Error setting language: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 