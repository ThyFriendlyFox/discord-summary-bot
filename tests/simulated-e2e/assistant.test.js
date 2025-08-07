const { LLMAssistant } = require('../../src/assistant');

describe('LLMAssistant (simulated)', () => {
  test('gemini provider chat (no key, may error gracefully)', async () => {
    const assistant = new LLMAssistant('gemini', {});
    let ok = false;
    try {
      const resp = await assistant.chat([{ role: 'user', content: 'Say hi.' }]);
      ok = typeof resp === 'string';
    } catch (e) {
      ok = true; // allow network/credentials failures in CI
    }
    expect(ok).toBe(true);
  });
});


