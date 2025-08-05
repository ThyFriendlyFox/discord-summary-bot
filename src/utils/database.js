const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, '../../data/bot.db'));
        this.init();
    }

    init() {
        this.db.serialize(() => {
            // Users table for storing user settings
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    gemini_api_key TEXT,
                    language TEXT DEFAULT 'en',
                    region TEXT DEFAULT 'UTC',
                    thread_mode BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // User modes table for storing user's summary modes
            this.db.run(`
                CREATE TABLE IF NOT EXISTS user_modes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    mode_name TEXT,
                    mode_description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            `);

            // Message tracking for unread summaries
            this.db.run(`
                CREATE TABLE IF NOT EXISTS user_last_messages (
                    user_id TEXT,
                    channel_id TEXT,
                    message_id TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, channel_id)
                )
            `);
        });
    }

    // User settings methods
    async getUserSettings(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {
                        user_id: userId,
                        gemini_api_key: null,
                        language: 'en',
                        region: 'UTC',
                        thread_mode: false
                    });
                }
            );
        });
    }

    async updateUserSettings(userId, settings) {
        return new Promise((resolve, reject) => {
            const { gemini_api_key, language, region, thread_mode } = settings;
            this.db.run(
                `INSERT OR REPLACE INTO users (user_id, gemini_api_key, language, region, thread_mode, updated_at)
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, gemini_api_key, language, region, thread_mode ? 1 : 0],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    // User modes methods
    async getUserModes(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM user_modes WHERE user_id = ? ORDER BY created_at DESC',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }

    async addUserMode(userId, modeName, modeDescription) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO user_modes (user_id, mode_name, mode_description) VALUES (?, ?, ?)',
                [userId, modeName, modeDescription],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async removeUserMode(userId, modeName) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM user_modes WHERE user_id = ? AND mode_name = ?',
                [userId, modeName],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    // Message tracking methods
    async updateUserLastMessage(userId, channelId, messageId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT OR REPLACE INTO user_last_messages (user_id, channel_id, message_id, timestamp)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, channelId, messageId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async getUserLastMessage(userId, channelId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM user_last_messages WHERE user_id = ? AND channel_id = ?',
                [userId, channelId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database; 