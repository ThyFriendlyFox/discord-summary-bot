const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setthread')
        .setDescription('Set whether or not you want your summaries to be outputted in a thread format or a inline messages format')
        .addBooleanOption(option =>
            option.setName('thread_mode')
                .setDescription('True for thread format, false for inline messages')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const threadMode = interaction.options.getBoolean('thread_mode');
            const db = new Database();

            // Get current user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Update settings with new thread mode
            await db.updateUserSettings(interaction.user.id, {
                ...userSettings,
                thread_mode: threadMode
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📝 Output Format Updated')
                .setDescription(`Your summaries will now be outputted in **${threadMode ? 'thread' : 'inline'}** format.`)
                .addFields(
                    { name: 'Current Setting', value: threadMode ? 'Thread Mode' : 'Inline Mode', inline: true },
                    { name: 'Thread Mode', value: '• Creates a new thread for each summary\n• Keeps summaries organized\n• Better for long discussions', inline: false },
                    { name: 'Inline Mode', value: '• Sends summary directly in the channel\n• Quick and simple\n• Good for short summaries', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Set by ${interaction.user.username}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            db.close();
        } catch (error) {
            console.error('Set thread command error:', error);
            await interaction.reply({
                content: `❌ Error setting thread mode: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 