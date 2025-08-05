# Discord Summary Bot

A powerful Discord bot that summarizes messages using Google's Gemini API. Features include message summarization, user settings, and multiple summary modes.

## Features

### Main Summary Commands
- `/summary` - Summarize a certain number of previous messages
- `/unreadsummary` - Summarize all messages since your last sent message in a channel
- `/fromtosummary` - Summarize messages between a certain time period

### Settings Commands
- `/listmodes` - Lists all the modes you have currently
- `/addmode` - Adds a mode to your mode list
- `/removemode` - Remove a mode from your mode list
- `/setapikey` - Set your own OpenAI API key for unlimited usage
- `/removeapikey` - Remove your OpenAI API key from being used
- `/setlanguage` - Set your language for summaries
- `/setregion` - Set your region for time-based summaries
- `/setthread` - Set whether summaries are outputted in threads or inline

### Helper Commands
- `/ping` - Check your ping with the server
- `/help` - Get help information about the bot
- `/invite` - Get an invite link for the bot
- `/support` - Get a link to the support server
- `/vote` - Vote for the bot on top.gg
- `/update` - Check the latest updates

## Setup

### Prerequisites
- Node.js 16.9.0 or higher
- A Discord bot token
- Gemini API key (optional - users can set their own)

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd discord-summary-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

4. Fill in your Discord bot token and Gemini API key in the `.env` file.

5. Run the bot:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Adding the Bot to Your Server

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token and add it to your `.env` file
5. Go to "OAuth2" > "URL Generator"
6. Select the following scopes:
   - `bot`
   - `applications.commands`
7. Select the following bot permissions:
   - Send Messages
   - Use Slash Commands
   - Read Message History
   - Create Public Threads
   - Send Messages in Threads
   - Embed Links
   - Attach Files
8. Use the generated URL to invite the bot to your server

## Usage

Once the bot is running and added to your server, you can use any of the slash commands listed above. The bot will automatically register all commands when it starts up.

## Configuration

The bot uses SQLite to store user settings and preferences. The database file will be created automatically when the bot starts.

## Support

For support, join our Discord server or create an issue on GitHub. 