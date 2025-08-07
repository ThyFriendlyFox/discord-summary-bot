const { GeminiProvider } = require('./provider.gemini');
const { OpenAIProvider } = require('./provider.openai');
const { AnthropicProvider } = require('./provider.anthropic');
const { OpenAICompatProvider } = require('./provider.openai_compat');

function createProvider(name, opts = {}) {
  const provider = (name || '').toLowerCase();
  if (provider === 'gemini') return new GeminiProvider(opts);
  if (provider === 'openai') return new OpenAIProvider(opts);
  if (provider === 'anthropic') return new AnthropicProvider(opts);
  if (provider === 'ollama') return new OpenAICompatProvider({ baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1', ...opts });
  if (provider === 'lmstudio') return new OpenAICompatProvider({ baseURL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1', ...opts });
  if (provider === 'openai_compat') return new OpenAICompatProvider(opts);
  // default
  return new GeminiProvider(opts);
}

module.exports = { createProvider };


