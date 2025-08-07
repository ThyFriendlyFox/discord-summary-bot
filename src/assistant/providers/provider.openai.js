const OpenAI = require('openai');

class OpenAIProvider {
  constructor({ apiKey, model, baseURL } = {}) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY, baseURL });
    this.modelName = model || process.env.ASSISTANT_MODEL || 'gpt-3.5-turbo';
  }

  async chat(messages) {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    return response.choices[0].message.content;
  }
}

module.exports = { OpenAIProvider };


