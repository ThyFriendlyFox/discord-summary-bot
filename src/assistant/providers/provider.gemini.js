const { GoogleGenAI } = require('@google/genai');

class GeminiProvider {
  constructor({ apiKey, model } = {}) {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.ai = key ? new GoogleGenAI({ apiKey: key }) : new GoogleGenAI({});
    this.modelName = model || process.env.ASSISTANT_MODEL || 'gemini-2.5-flash';
  }

  async chat(messages) {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const res = await this.ai.models.generateContent({ model: this.modelName, contents: text });
    return res.text;
  }
}

module.exports = { GeminiProvider };


