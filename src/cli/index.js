#!/usr/bin/env node
require('dotenv').config();
const { prompt, Select, Input, Confirm } = require('enquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '../../');
const envPath = path.join(projectRoot, '.env');
const firstRunMarker = path.join(projectRoot, 'data/.first-run');

function banner() {
  console.clear();
  console.log(chalk.cyan(figlet.textSync('Summary Bot', { font: 'Slant' })));
  console.log(chalk.gray('Interactive CLI for Discord Summary Bot\n'));
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    const child = exec(cmd, { cwd: projectRoot, env: process.env, stdio: 'inherit' });
    child.stdout && child.stdout.pipe(process.stdout);
    child.stderr && child.stderr.pipe(process.stderr);
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`Command failed: ${cmd}`))));
  });
}

function getEnv() {
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const obj = {};
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) obj[m[1].trim()] = m[2];
  }
  return obj;
}

async function writeEnv(envObj) {
  const content = Object.entries(envObj)
    .map(([k, v]) => `${k}=${v ?? ''}`)
    .join('\n') + '\n';
  fs.writeFileSync(envPath, content);
}

async function ensureDeps() {
  const nodeModules = path.join(projectRoot, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    console.log(chalk.yellow('Installing dependencies...'));
    await run('npm install');
  }
}

async function actionSetup() {
  banner();
  console.log(chalk.white('Setup configuration'));
  const current = getEnv();
  const responses = await prompt([
    {
      type: 'input',
      name: 'DISCORD_TOKEN',
      message: 'Discord Bot Token',
      initial: current.DISCORD_TOKEN || ''
    },
    {
      type: 'input',
      name: 'GEMINI_API_KEY',
      message: 'Gemini API Key (optional)',
      initial: current.GEMINI_API_KEY || ''
    },
    {
      type: 'input',
      name: 'BOT_CLIENT_ID',
      message: 'Bot Client ID (optional)',
      initial: current.BOT_CLIENT_ID || ''
    }
  ]);
  const envObj = {
    DISCORD_TOKEN: responses.DISCORD_TOKEN,
    GEMINI_API_KEY: responses.GEMINI_API_KEY,
    BOT_CLIENT_ID: responses.BOT_CLIENT_ID
  };
  await writeEnv(envObj);
  console.log(chalk.green('\n.env saved.'));
}

async function actionValidate() {
  banner();
  console.log(chalk.white('Validate environment'));
  const env = getEnv();
  const issues = [];
  if (!env.DISCORD_TOKEN || env.DISCORD_TOKEN === 'your_discord_bot_token_here') issues.push('DISCORD_TOKEN missing');
  if (env.GEMINI_API_KEY === 'your_gemini_api_key_here') issues.push('GEMINI_API_KEY placeholder detected');
  if (issues.length === 0) console.log(chalk.green('All good!'));
  else issues.forEach(i => console.log(chalk.red('• ' + i)));
  await prompt({ type: 'confirm', name: 'ok', message: 'Back to menu?', initial: true });
}

async function actionStart() {
  banner();
  await ensureDeps();
  console.log(chalk.green('Starting bot... Press Ctrl+C to stop.'));
  await run('npm start');
}

async function actionDev() {
  banner();
  await ensureDeps();
  console.log(chalk.green('Starting bot in dev mode... Press Ctrl+C to stop.'));
  await run('npm run dev');
}

async function actionShowInvite() {
  banner();
  const env = getEnv();
  const clientId = env.BOT_CLIENT_ID || process.env.BOT_CLIENT_ID || '';
  if (!clientId) {
    console.log(chalk.yellow('BOT_CLIENT_ID not set. You can also get an invite link via /invite once the bot is running.'));
  } else {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=274877910016&scope=bot%20applications.commands`;
    console.log(chalk.cyan('Invite URL: '), url);
  }
  await prompt({ type: 'confirm', name: 'ok', message: 'Back to menu?', initial: true });
}

async function actionAssistantChat() {
  banner();
  await ensureDeps();
  const env = getEnv();
  const { Select, Input } = require('enquirer');
  const provider = await new Select({ name: 'provider', message: 'Provider', choices: ['gemini', 'openai', 'anthropic', 'ollama', 'lmstudio'], initial: env.ASSISTANT_PROVIDER || 'gemini' }).run();
  const model = await new Input({ name: 'model', message: 'Model (blank for default)', initial: env.ASSISTANT_MODEL || '' }).run();
  console.log(chalk.gray('Type messages. Ctrl+C to exit.'));
  const { LLMAssistant } = require('../assistant');
  const assistant = new LLMAssistant(provider, { model: model || undefined });
  // Simple REPL
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  async function ask() {
    rl.question(chalk.green('You: '), async (q) => {
      if (!q.trim()) return ask();
      const resp = await assistant.chat([{ role: 'user', content: q }]);
      console.log(chalk.cyan('\nAssistant: '), resp, '\n');
      ask();
    });
  }
  ask();
}

async function actionAssistantTutorial() {
  banner();
  console.log(chalk.white('Assistant Tutorial'));
  console.log('- Choose a provider (Gemini/OpenAI/Anthropic/local OpenAI-compatible)');
  console.log('- Provide a model name or use the default');
  console.log('- Chat interactively here or use /assistant in Discord');
  console.log('- You can save defaults in .env: ASSISTANT_PROVIDER, ASSISTANT_MODEL');
  await prompt({ type: 'confirm', name: 'ok', message: 'Back to menu?', initial: true });
}

async function mainMenu() {
  while (true) {
    banner();
    const menu = new Select({
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        { name: 'setup', message: 'Setup / Edit .env' },
        { name: 'validate', message: 'Validate config' },
        { name: 'start', message: 'Start bot' },
        { name: 'dev', message: 'Start bot (dev with auto-reload)' },
        { name: 'assistant', message: 'Assistant (interactive chat)' },
        { name: 'tutorial', message: 'Assistant tutorial' },
        { name: 'invite', message: 'Show invite URL' },
        { name: 'quit', message: 'Quit' }
      ]
    });
    const choice = await menu.run();
    if (choice === 'setup') await actionSetup();
    else if (choice === 'validate') await actionValidate();
    else if (choice === 'start') await actionStart();
    else if (choice === 'dev') await actionDev();
    else if (choice === 'assistant') await actionAssistantChat();
    else if (choice === 'tutorial') await actionAssistantTutorial();
    else if (choice === 'invite') await actionShowInvite();
    else if (choice === 'quit') return;
  }
}

// First run tutorial
async function start() {
  const dataDir = path.join(projectRoot, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(firstRunMarker)) {
    await actionAssistantTutorial();
    fs.writeFileSync(firstRunMarker, 'ok');
  }
  await mainMenu();
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});


