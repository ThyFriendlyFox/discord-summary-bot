const { createProvider } = require('./providers');

class LLMAssistant {
  constructor(providerName, options = {}) {
    this.providerName = providerName;
    this.provider = createProvider(providerName, options);
  }

  async chat(messages, options = {}) {
    return this.provider.chat(messages, options);
  }

  async summarize(text, options = {}) {
    const messages = [{ role: 'user', content: `Summarize the following:\n\n${text}` }];
    return this.chat(messages, options);
  }

  async health() {
    if (typeof this.provider.health === 'function') return this.provider.health();
    return { ok: true };
  }
}

module.exports = { LLMAssistant };


