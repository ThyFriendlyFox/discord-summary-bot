const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GeminiService = require('../services/gemini');
const Database = require('../utils/database');
const { fetchMessagesPaginated } = require('../utils/fetchMessages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summary')
        .setDescription('Summarize a certain number of previous messages')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of messages to summarize (max 2000 without API key)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(2000))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Summary mode to use (optional)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const count = interaction.options.getInteger('count');
            const mode = interaction.options.getString('mode');
            const db = new Database();
            const geminiService = new GeminiService();

            // Get user settings
            const userSettings = await db.getUserSettings(interaction.user.id);
            
            // Check if user has API key for unlimited usage
            const hasCustomApiKey = userSettings.gemini_api_key;
            const maxMessages = hasCustomApiKey ? 2000 : 2000; // Same limit for now, but can be adjusted

            if (count > maxMessages && !hasCustomApiKey) {
                return interaction.editReply({
                    content: `❌ You can only summarize up to ${maxMessages} messages without setting your own API key. Use \`/setapikey\` to set your Gemini API key for unlimited usage.`,
                    ephemeral: true
                });
            }

            // Fetch messages with pagination for reliability >100
            const messageArray = await fetchMessagesPaginated(interaction.channel, count);

            if (messageArray.length === 0) {
                return interaction.editReply({
                    content: '❌ No messages found to summarize.',
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
                .setTitle('📝 Message Summary')
                .setDescription(summary)
                .addFields(
                    { name: 'Messages Summarized', value: messageArray.length.toString(), inline: true },
                    { name: 'Channel', value: interaction.channel.name, inline: true },
                    { name: 'Language', value: userSettings.language || 'English', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username}` });

            if (mode) {
                embed.addFields({ name: 'Mode Used', value: mode, inline: true });
            }

            // Send summary based on user preference
            if (userSettings.thread_mode) {
                const thread = await interaction.channel.threads.create({
                    name: `Summary - ${new Date().toLocaleDateString()}`,
                    autoArchiveDuration: 60,
                    reason: 'Summary thread created by bot'
                });

                await thread.send({ embeds: [embed] });
                await interaction.editReply({
                    content: `✅ Summary created in thread: ${thread}`,
                    ephemeral: true
                });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }

            db.close();
        } catch (error) {
            console.error('Summary command error:', error);
            await interaction.editReply({
                content: `❌ Error generating summary: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 