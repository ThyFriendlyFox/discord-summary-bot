const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setregion')
        .setDescription('Set your region such that you can use time-to-time summaries with your local time')
        .addStringOption(option =>
            option.setName('timezone')
                .setDescription('Your timezone (e.g., America/New_York, Europe/London, Asia/Tokyo)')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const timezone = interaction.options.getString('timezone');
            const db = new Database();

            // Validate timezone
            if (!moment.tz.zone(timezone)) {
                return interaction.reply({
                    content: '❌ Invalid timezone. Please use a valid timezone identifier (e.g., America/New_York, Europe/London, Asia/Tokyo).\n\nCommon timezones:\n• America/New_York\n• America/Los_Angeles\n• Europe/London\n• Europe/Paris\n• Asia/Tokyo\n• Australia/Sydney',
                    ephemeral: true
                });
            }

            // Get current user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Update settings with new timezone
            await db.updateUserSettings(interaction.user.id, {
                ...userSettings,
                region: timezone
            });

            // Get current time in the user's timezone
            const currentTime = moment.tz(timezone);
            const utcTime = moment.utc();

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🕐 Region Set Successfully')
                .setDescription(`Your timezone has been set to **${timezone}**.`)
                .addFields(
                    { name: 'Timezone', value: timezone, inline: true },
                    { name: 'Current Time', value: currentTime.format('YYYY-MM-DD HH:mm:ss'), inline: true },
                    { name: 'UTC Offset', value: currentTime.format('Z'), inline: true },
                    { name: 'Benefits', value: '• Time-based summaries will use your local time\n• Relative time inputs will be in your timezone\n• All timestamps will be displayed in your timezone', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Set by ${interaction.user.username}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            db.close();
        } catch (error) {
            console.error('Set region command error:', error);
            await interaction.reply({
                content: `❌ Error setting region: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 