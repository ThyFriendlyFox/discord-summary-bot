const OpenAI = require('openai');

class OpenAICompatProvider {
  constructor({ apiKey, model, baseURL } = {}) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY || 'nokey', baseURL: baseURL || process.env.ASSISTANT_BASE_URL });
    this.modelName = model || process.env.ASSISTANT_MODEL || 'llama3.1:latest';
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

module.exports = { OpenAICompatProvider };


