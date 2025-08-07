const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GeminiService = require('../services/gemini');
const Database = require('../utils/database');
const { fetchMessagesPaginated } = require('../utils/fetchMessages');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fromtosummary')
        .setDescription('Summarize messages between a certain time period')
        .addStringOption(option =>
            option.setName('start_time')
                .setDescription('Start time (YYYY-MM-DD HH:MM or relative like "2 hours ago")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('end_time')
                .setDescription('End time (YYYY-MM-DD HH:MM or relative like "1 hour ago")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Summary mode to use (optional)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const startTimeStr = interaction.options.getString('start_time');
            const endTimeStr = interaction.options.getString('end_time');
            const mode = interaction.options.getString('mode');
            const db = new Database();
            const geminiService = new GeminiService();

            // Get user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Parse times using user's timezone
            const userTimezone = userSettings.region || 'UTC';
            let startTime, endTime;

            try {
                // Try to parse as absolute time first
                if (startTimeStr.match(/^\d{4}-\d{2}-\d{2}/)) {
                    startTime = moment.tz(startTimeStr, userTimezone);
                } else {
                    // Parse as relative time
                    startTime = moment.tz(userTimezone).subtract(
                        moment.duration(startTimeStr.replace(' ago', ''))
                    );
                }

                if (endTimeStr.match(/^\d{4}-\d{2}-\d{2}/)) {
                    endTime = moment.tz(endTimeStr, userTimezone);
                } else {
                    endTime = moment.tz(userTimezone).subtract(
                        moment.duration(endTimeStr.replace(' ago', ''))
                    );
                }

                if (!startTime.isValid() || !endTime.isValid()) {
                    throw new Error('Invalid time format');
                }

                if (startTime.isAfter(endTime)) {
                    return interaction.editReply({
                        content: '❌ Start time must be before end time.',
                        ephemeral: true
                    });
                }
            } catch (error) {
                return interaction.editReply({
                    content: '❌ Invalid time format. Use YYYY-MM-DD HH:MM or relative time like "2 hours ago".',
                    ephemeral: true
                });
            }

            // Check if user has the specified mode
            if (mode) {
                const userModes = await db.getUserModes(interaction.user.id);
                const hasMode = userModes.some(m => m.mode_name.toLowerCase() === mode.toLowerCase());
                
                if (!hasMode) {
                    return interaction.editReply({
                        content: `❌ Mode "${mode}" not found. Use \`/listmodes\` to see your available modes or \`/addmode\` to add a new mode.`,
                        ephemeral: true
                    });
                }
            }

            // Fetch up to 2000 recent messages with pagination, then filter by time
            const fetched = await fetchMessagesPaginated(interaction.channel, 2000);
            const messageArray = fetched.filter(msg => {
                const msgTime = moment.tz(msg.createdTimestamp, userTimezone);
                return msgTime.isBetween(startTime, endTime, null, '[]'); // inclusive
            }).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            if (messageArray.length === 0) {
                return interaction.editReply({
                    content: `❌ No messages found between ${startTime.format('YYYY-MM-DD HH:mm')} and ${endTime.format('YYYY-MM-DD HH:mm')} in your timezone (${userTimezone}).`,
                    ephemeral: true
                });
            }

            // Check message limit for users without custom API key
            const hasCustomApiKey = userSettings.gemini_api_key;
            const maxMessages = hasCustomApiKey ? 2000 : 2000;

            if (messageArray.length > maxMessages && !hasCustomApiKey) {
                return interaction.editReply({
                    content: `❌ Too many messages to summarize (${messageArray.length}). You can only summarize up to ${maxMessages} messages without setting your own API key. Use \`/setapikey\` to set your Gemini API key for unlimited usage.`,
                    ephemeral: true
                });
            }

            // Generate summary
            let summary;
            if (mode) {
                summary = await geminiService.summarizeWithMode(
                    messageArray, 
                    mode, 
                    userSettings, 
                    userSettings.gemini_api_key
                );
            } else {
                summary = await geminiService.summarizeMessages(
                    messageArray, 
                    userSettings, 
                    userSettings.gemini_api_key
                );
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📝 Time Range Summary')
                .setDescription(summary)
                .addFields(
                    { name: 'Messages Summarized', value: messageArray.length.toString(), inline: true },
                    { name: 'Channel', value: interaction.channel.name, inline: true },
                    { name: 'Language', value: userSettings.language || 'English', inline: true },
                    { name: 'Start Time', value: startTime.format('YYYY-MM-DD HH:mm'), inline: true },
                    { name: 'End Time', value: endTime.format('YYYY-MM-DD HH:mm'), inline: true },
                    { name: 'Timezone', value: userTimezone, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username}` });

            if (mode) {
                embed.addFields({ name: 'Mode Used', value: mode, inline: true });
            }

            // Send summary based on user preference
            if (userSettings.thread_mode) {
                const thread = await interaction.channel.threads.create({
                    name: `Time Range Summary - ${startTime.format('MM-DD')}`,
                    autoArchiveDuration: 60,
                    reason: 'Time range summary thread created by bot'
                });

                await thread.send({ embeds: [embed] });
                await interaction.editReply({
                    content: `✅ Time range summary created in thread: ${thread}`,
                    ephemeral: true
                });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }

            db.close();
        } catch (error) {
            console.error('From-to summary command error:', error);
            await interaction.editReply({
                content: `❌ Error generating time range summary: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 