const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { LLMAssistant } = require('../assistant');
const Database = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assistant')
    .setDescription('Chat with an AI assistant')
    .addStringOption(opt =>
      opt.setName('prompt').setDescription('Your message to the assistant').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('provider')
        .setDescription('Which provider to use')
        .addChoices(
          { name: 'Gemini', value: 'gemini' },
          { name: 'OpenAI', value: 'openai' },
          { name: 'Anthropic', value: 'anthropic' },
          { name: 'Ollama (OpenAI-compatible)', value: 'ollama' },
          { name: 'LM Studio (OpenAI-compatible)', value: 'lmstudio' }
        )
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('model').setDescription('Model name to use').setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const db = new Database();
    try {
      const prompt = interaction.options.getString('prompt');
      const requestedProvider = interaction.options.getString('provider');
      const requestedModel = interaction.options.getString('model');

      const userSettings = await db.getUserSettings(interaction.user.id);
      const provider = (requestedProvider || userSettings.assistant_provider || process.env.ASSISTANT_PROVIDER || 'gemini');
      const model = (requestedModel || userSettings.assistant_model || process.env.ASSISTANT_MODEL || undefined);

      // Prefer user's own Gemini key when using Gemini
      const opts = { model };
      if (provider === 'gemini' && userSettings.gemini_api_key) {
        opts.apiKey = userSettings.gemini_api_key;
      }

      const assistant = new LLMAssistant(provider, opts);
      const messages = [
        { role: 'system', content: 'You are a helpful assistant for a Discord bot project.' },
        { role: 'user', content: prompt }
      ];
      const response = await assistant.chat(messages);

      const embed = new EmbedBuilder()
        .setColor(0x8A2BE2)
        .setTitle('🤖 Assistant')
        .addFields(
          { name: 'Provider', value: provider, inline: true },
          { name: 'Model', value: model || 'default', inline: true }
        )
        .setDescription(response)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      if (userSettings.thread_mode) {
        const thread = await interaction.channel.threads.create({
          name: `Assistant - ${new Date().toLocaleDateString()}`,
          autoArchiveDuration: 60,
          reason: 'Assistant thread'
        });
        await thread.send({ embeds: [embed] });
        await interaction.editReply({ content: `✅ Assistant response in thread: ${thread}` });
      } else {
        await interaction.editReply({ embeds: [embed] });
      }

      // Persist chosen provider/model for convenience
      await db.updateUserSettings(interaction.user.id, { ...userSettings, assistant_provider: provider, assistant_model: model });
    } catch (error) {
      console.error('Assistant command error:', error);
      await interaction.editReply({ content: `❌ Error: ${error.message}` });
    } finally {
      db.close();
    }
  }
};


