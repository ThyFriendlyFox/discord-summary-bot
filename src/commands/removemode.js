const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemode')
        .setDescription('Remove a mode from your mode list')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the mode to remove')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const modeName = interaction.options.getString('name');
            const db = new Database();

            // Check if mode exists for this user
            const userModes = await db.getUserModes(interaction.user.id);
            const existingMode = userModes.find(m => m.mode_name.toLowerCase() === modeName.toLowerCase());

            if (!existingMode) {
                return interaction.reply({
                    content: `❌ Mode "${modeName}" not found. Use \`/listmodes\` to see your available modes.`,
                    ephemeral: true
                });
            }

            // Remove the mode
            const removedCount = await db.removeUserMode(interaction.user.id, modeName);

            if (removedCount > 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF6B6B)
                    .setTitle('🗑️ Mode Removed Successfully')
                    .setDescription(`Mode "${modeName}" has been removed from your list.`)
                    .addFields(
                        { name: 'Removed Mode', value: modeName, inline: true },
                        { name: 'Remaining Modes', value: (userModes.length - 1).toString(), inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: `Removed by ${interaction.user.username}` });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({
                    content: `❌ Failed to remove mode "${modeName}". Please try again.`,
                    ephemeral: true
                });
            }

            db.close();
        } catch (error) {
            console.error('Remove mode command error:', error);
            await interaction.reply({
                content: `❌ Error removing mode: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 