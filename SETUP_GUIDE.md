# Discord Summary Bot - Setup Guide

This guide will walk you through setting up and running your Discord Summary Bot.

## Prerequisites

- Node.js 16.9.0 or higher
- A Discord account
- A Gemini API key (optional - users can set their own)

## Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token (you'll need this later)
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
8. Copy the generated URL and invite the bot to your server

## Step 2: Get a Gemini API Key (Optional)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an account or sign in
3. Create a new API key
4. Copy the key

## Step 3: Setup the Bot

### Option A: Automatic Setup (Recommended)

Run the setup script:
```bash
npm run setup
```

This will guide you through the configuration process.

### Option B: Manual Setup

1. Copy the environment file:
```bash
cp env.example .env
```

2. Edit the `.env` file with your credentials:
```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token_here

# Gemini API Key (optional - users can set their own)
GEMINI_API_KEY=your_gemini_api_key_here

# Bot Configuration
BOT_CLIENT_ID=your_bot_client_id_here
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Bot

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

You should see output like:
```
✅ Logged in as YourBot#1234
🤖 Bot is ready! Serving 1 guilds
🔄 Registering slash commands...
✅ Successfully registered 15 slash commands
```

## Step 6: Test the Bot

1. In your Discord server, try the `/help` command
2. Test a simple summary with `/summary count:10`
3. Check bot status with `/ping`

## Available Commands

### Main Summary Commands
- `/summary` - Summarize a certain number of previous messages
- `/unreadsummary` - Summarize all messages since your last message
- `/fromtosummary` - Summarize messages between time periods

### Settings Commands
- `/listmodes` - List your custom summary modes
- `/addmode` - Add a new summary mode
- `/removemode` - Remove a summary mode
- `/setapikey` - Set your OpenAI API key
- `/removeapikey` - Remove your API key
- `/setlanguage` - Set summary language
- `/setregion` - Set your timezone
- `/setthread` - Toggle thread/inline output

### Helper Commands
- `/ping` - Check bot latency
- `/help` - Show help information
- `/invite` - Get bot invite link
- `/support` - Get support server link
- `/vote` - Vote for the bot
- `/update` - Check latest updates

## Troubleshooting

### Bot not responding to commands
- Make sure the bot has the correct permissions
- Check that slash commands are registered (should see "Successfully registered X slash commands")
- Verify the bot token is correct

### Gemini API errors
- Check your API key is valid
- Ensure you have sufficient credits in your Google AI account
- Users can set their own API keys with `/setapikey`

### Database errors
- The bot will automatically create the database file
- Make sure the `data` directory exists and is writable

### Permission errors
- Ensure the bot has all required permissions
- Check that the bot can read message history in the channel

## Security Notes

- Never share your bot token publicly
- The `.env` file is automatically ignored by git
- User API keys are stored securely in the database
- Each user's settings are isolated

## Deployment

For production deployment:

1. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/index.js --name "discord-summary-bot"
```

2. Or use Docker (create a Dockerfile):
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

## Support

If you encounter issues:
1. Check the console output for error messages
2. Use `/ping` to check bot status
3. Verify all environment variables are set correctly
4. Check the bot has proper permissions in your server

## Features

- **Message Summarization**: Summarize Discord messages using Google's Gemini API
- **Custom Modes**: Create your own summary styles
- **Multi-language Support**: Summaries in your preferred language
- **Timezone Support**: Time-based summaries in your local time
- **Personal API Keys**: Users can use their own OpenAI API keys
- **Thread/Inline Output**: Choose how summaries are displayed
- **Secure Storage**: User settings and API keys are stored securely

Enjoy using your Discord Summary Bot! 🎉 