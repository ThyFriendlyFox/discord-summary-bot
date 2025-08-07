const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GeminiService = require('../services/gemini');
const Database = require('../utils/database');
const { fetchMessagesPaginated } = require('../utils/fetchMessages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unreadsummary')
        .setDescription('Summarize all messages since your last sent message in this channel')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Summary mode to use (optional)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const mode = interaction.options.getString('mode');
            const db = new Database();
            const geminiService = new GeminiService();

            // Get user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Get user's last message in this channel
            const lastMessageData = await db.getUserLastMessage(interaction.user.id, interaction.channel.id);
            
            if (!lastMessageData) {
                return interaction.editReply({
                    content: '❌ No previous message found for you in this channel. Send a message first, then use this command to summarize messages since then.',
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

            // Fetch messages since the last message with pagination
            const messageArray = await fetchMessagesPaginated(
                interaction.channel,
                2000,
                { afterId: lastMessageData.message_id }
            );

            if (messageArray.length === 0) {
                return interaction.editReply({
                    content: '❌ No new messages found since your last message in this channel.',
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
                .setTitle('📝 Unread Summary')
                .setDescription(summary)
                .addFields(
                    { name: 'Messages Summarized', value: messageArray.length.toString(), inline: true },
                    { name: 'Channel', value: interaction.channel.name, inline: true },
                    { name: 'Language', value: userSettings.language || 'English', inline: true },
                    { name: 'Since', value: new Date(lastMessageData.timestamp).toLocaleString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username}` });

            if (mode) {
                embed.addFields({ name: 'Mode Used', value: mode, inline: true });
            }

            // Send summary based on user preference
            if (userSettings.thread_mode) {
                const thread = await interaction.channel.threads.create({
                    name: `Unread Summary - ${new Date().toLocaleDateString()}`,
                    autoArchiveDuration: 60,
                    reason: 'Unread summary thread created by bot'
                });

                await thread.send({ embeds: [embed] });
                await interaction.editReply({
                    content: `✅ Unread summary created in thread: ${thread}`,
                    ephemeral: true
                });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }

            db.close();
        } catch (error) {
            console.error('Unread summary command error:', error);
            await interaction.editReply({
                content: `❌ Error generating unread summary: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 