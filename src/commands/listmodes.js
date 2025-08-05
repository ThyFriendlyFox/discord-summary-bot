const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listmodes')
        .setDescription('Lists all the modes you have currently'),

    async execute(interaction) {
        try {
            const db = new Database();
            const userModes = await db.getUserModes(interaction.user.id);

            if (userModes.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF6B6B)
                    .setTitle('📋 Your Summary Modes')
                    .setDescription('You don\'t have any custom modes yet.')
                    .addFields(
                        { name: 'How to add modes', value: 'Use `/addmode` to create your first summary mode!' }
                    )
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.username}` });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('📋 Your Summary Modes')
                    .setDescription(`You have ${userModes.length} custom mode(s):`)
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.username}` });

                userModes.forEach((mode, index) => {
                    embed.addFields({
                        name: `${index + 1}. ${mode.mode_name}`,
                        value: mode.mode_description || 'No description provided',
                        inline: false
                    });
                });

                embed.addFields({
                    name: 'How to use modes',
                    value: 'Add `mode: mode_name` to any summary command to use a specific mode!',
                    inline: false
                });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            db.close();
        } catch (error) {
            console.error('List modes command error:', error);
            await interaction.reply({
                content: `❌ Error listing modes: ${error.message}`,
                ephemeral: true
            });
        }
    },
}; 