const fs = require('fs');
const path = require('path');
const Database = require('../../src/utils/database');

describe('Database', () => {
  const dataDir = path.join(__dirname, '../../data');
  const dbPath = path.join(dataDir, 'bot.db');

  beforeAll(() => {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  });

  afterAll(() => {
    // keep db for other tests
  });

  test('creates tables and defaults', async () => {
    const db = new Database();
    const settings = await db.getUserSettings('test-user');
    expect(settings.language).toBe('en');
    expect(settings.thread_mode === 0 || settings.thread_mode === false || settings.thread_mode === 1 || settings.thread_mode === true).toBeTruthy();
    db.close();
  });
});


