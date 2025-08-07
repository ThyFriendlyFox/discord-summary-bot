const Anthropic = require('@anthropic-ai/sdk');

class AnthropicProvider {
  constructor({ apiKey, model } = {}) {
    this.client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
    this.modelName = model || process.env.ASSISTANT_MODEL || 'claude-3-5-sonnet-latest';
  }

  async chat(messages) {
    const content = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 1000,
      temperature: 0.7,
      messages
    });
    // Anthropic returns content array; concatenate text
    const parts = content.content || [];
    return parts.map(p => p.text).join('\n');
  }
}

module.exports = { AnthropicProvider };


