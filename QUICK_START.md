# 🚀 Quick Start Guide

## Get Your Discord Summary Bot Running in 5 Minutes!

### 1. Setup (Choose One)

**Option A: Automatic Setup (Recommended)**
```bash
npm run setup
```
Follow the prompts to enter your Discord bot token and OpenAI API key.

**Option B: Manual Setup**
```bash
cp env.example .env
```
Then edit `.env` with your credentials.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Bot
```bash
npm start
```

### 4. Invite to Your Server
Use `/invite` in Discord or create an invite link with these permissions:
- Send Messages
- Use Slash Commands  
- Read Message History
- Create Public Threads
- Send Messages in Threads
- Embed Links
- Attach Files

### 5. Test It!
Try these commands in your Discord server:
- `/help` - See all commands
- `/ping` - Check bot status
- `/summary count:10` - Summarize 10 messages

## 🎯 What You Get

✅ **15 Slash Commands** - All the features you requested  
✅ **Message Summarization** - Using Google's Gemini API  
✅ **Custom Modes** - Create your own summary styles  
✅ **Multi-language Support** - Summaries in any language  
✅ **Timezone Support** - Local time for time-based summaries  
✅ **Personal API Keys** - Users can use their own OpenAI keys  
✅ **Thread/Inline Output** - Choose how summaries appear  
✅ **Secure Storage** - User settings stored safely  

## 📋 All Commands

### Main Summary Commands
- `/summary` - Summarize previous messages
- `/unreadsummary` - Summarize since your last message  
- `/fromtosummary` - Summarize between time periods

### Settings Commands
- `/listmodes` - List your custom modes
- `/addmode` - Add a new summary mode
- `/removemode` - Remove a mode
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

## 🔧 Need Help?

- Check the console output for errors
- Use `/ping` to verify bot is online
- See `SETUP_GUIDE.md` for detailed instructions
- Check `README.md` for full documentation

## 🎉 You're Ready!

Your Discord Summary Bot is now running with all the features you requested. Users can start summarizing messages immediately!

---

**Next Steps:**
1. Test the bot in your server
2. Customize settings with the commands
3. Add the bot to more servers
4. Enjoy powerful message summarization! 🚀 