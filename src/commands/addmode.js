const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmode')
        .setDescription('Adds a mode to your mode list')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the mode')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description of what this mode does')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const modeName = interaction.options.getString('name');
            const modeDescription = interaction.options.getString('description');
            const db = new Database();

            // Check if mode already exists for this user
            const userModes = await db.getUserModes(interaction.user.id);
            const existingMode = userModes.find(m => m.mode_name.toLowerCase() === modeName.toLowerCase());

            if (existingMode) {
                return interaction.reply({
                    content: `❌ Mode "${modeName}" already exists. Use a different name or remove the existing mode first with \`/removemode\`.`,
                    ephemeral: true
                });
            }

            // Add the new mode
            await db.addUserMode(interaction.user.id, modeName, modeDescription);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Mode Added Successfully')
                .setDescription(`Mode "${modeName}" has been added to your list.`)
                .addFields(
                    { name: 'Mode Name', value: modeName, inline: true },
                    { name: 'Description', value: modeDescription, inline: true },
                    { name: 'How to use', value: `Add \`mode: ${modeName}\` to any summary command!`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Added by ${interaction.user.username}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            db.close();
        } catch (error) {
            console.error('Add mode command error:', error);
            await interaction.reply({
                content: `❌ Error adding mode: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 