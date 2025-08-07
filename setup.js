#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const args = new Set(process.argv.slice(2));
const NON_INTERACTIVE = args.has('--non-interactive') || args.has('-n');
const ASSUME_YES = args.has('--yes') || args.has('-y');

console.log('🤖 Discord Summary Bot Setup');
console.log('=============================\n');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    try {
        console.log('This setup will help you configure your Discord bot.\n');

        // Check if .env exists
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            if (!ASSUME_YES && !NON_INTERACTIVE) {
                const overwrite = await question('A .env file already exists. Do you want to overwrite it? (y/N): ');
                if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                    console.log('Setup cancelled.');
                    rl.close();
                    return;
                }
            }
        }

        // Get Discord Bot Token
        console.log('\n1. Discord Bot Configuration');
        console.log('============================');
        let botToken;
        let clientId;
        let geminiKey;

        if (NON_INTERACTIVE) {
            botToken = process.env.DISCORD_TOKEN;
            clientId = process.env.BOT_CLIENT_ID;
            geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
            if (!botToken || botToken === 'your_discord_bot_token_here') {
                console.log('❌ Missing DISCORD_TOKEN environment variable. Provide it and re-run with --non-interactive.');
                rl.close();
                return;
            }
        } else {
            botToken = await question('Enter your Discord Bot Token: ');
            if (!botToken || botToken === 'your_discord_bot_token_here') {
                console.log('❌ Invalid bot token. Please get your bot token from the Discord Developer Portal.');
                rl.close();
                return;
            }
            // Get Bot Client ID
            clientId = await question('Enter your Bot Client ID (optional, will be auto-detected if left empty): ');
            // Get Gemini API Key
            console.log('\n2. Gemini Configuration');
            console.log('======================');
            geminiKey = await question('Enter your Gemini API Key (optional, users can set their own): ');
            if (geminiKey && geminiKey.length < 10) {
                console.log('⚠️  Warning: Gemini API key seems too short. Please verify your key.');
            }
        }

        // Create .env file
        let envContent = `# Discord Bot Token
DISCORD_TOKEN=${botToken}

# Gemini API Key (optional - users can set their own)
GEMINI_API_KEY=${geminiKey || 'your_gemini_api_key_here'}

# Bot Configuration
BOT_CLIENT_ID=${clientId || 'your_bot_client_id_here'}
`;

        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ .env file created successfully!');

        // Create data directory
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ Data directory created');
        }

        console.log('\n📋 Next Steps:');
        console.log('==============');
        console.log('1. Install dependencies: npm install');
        console.log('2. Start the bot: npm start');
        console.log('3. Invite the bot to your server using the invite link');
        console.log('4. Use /help to see all available commands');
        
        console.log('\n🔗 Useful Links:');
        console.log('================');
        console.log('• Discord Developer Portal: https://discord.com/developers/applications');
        console.log('• Google AI Studio: https://aistudio.google.com/app/apikey');
        console.log('• Bot Documentation: Check the README.md file');

        console.log('\n🎉 Setup complete! Your bot is ready to use.');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

setup(); 