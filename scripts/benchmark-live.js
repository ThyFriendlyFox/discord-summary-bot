#!/usr/bin/env node
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Database = require('../src/utils/database');

// Commands
const summaryCmd = require('../src/commands/summary');
const assistantCmd = require('../src/commands/assistant');
const setLanguageCmd = require('../src/commands/setlanguage');
const setThreadCmd = require('../src/commands/setthread');

function nowMs() { return Date.now(); }

function createInteractionStub({ client, channel, user, options = {} }) {
  const state = { replied: false, deferred: false, lastMessageId: null };
  return {
    client,
    channel,
    user,
    replied: false,
    deferred: false,
    state,
    options: {
      getString: (name) => options[name] ?? null,
      getInteger: (name) => options[name] ?? null,
      getBoolean: (name) => options[name] ?? null,
    },
    isChatInputCommand: () => true,
    async deferReply() { state.deferred = true; this.deferred = true; },
    async reply(payload) {
      state.replied = true; this.replied = true;
      const msg = await channel.send(payload.content || { embeds: payload.embeds });
      state.lastMessageId = msg.id;
      return msg;
    },
    async editReply(payload) {
      const msg = await channel.send(payload.content || { embeds: payload.embeds });
      state.lastMessageId = msg.id;
      return msg;
    },
    async followUp(payload) { return this.editReply(payload); },
  };
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function findLatestBotEmbedInChannel(channel, botUserId, sinceMs, titleIncludes) {
  const msgs = await channel.messages.fetch({ limit: 50 });
  const arr = Array.from(msgs.values());
  arr.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
  return arr.find(m => m.author.id === botUserId && m.createdTimestamp >= sinceMs && m.embeds && m.embeds.length > 0 && (!titleIncludes || (m.embeds[0].title || '').includes(titleIncludes)));
}

async function findLatestThreadByBot(channel, botUserId, sinceMs, nameIncludes) {
  const active = await channel.threads.fetchActive();
  const threads = active.threads.map(t => t);
  threads.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
  return threads.find(t => t.ownerId === botUserId && t.createdTimestamp >= sinceMs && (!nameIncludes || (t.name || '').includes(nameIncludes)));
}

async function run() {
  const token = process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN_TEST;
  const guildId = process.env.TEST_GUILD_ID;
  const channelId = process.env.TEST_CHANNEL_ID;
  if (!token || !channelId) {
    console.error('Missing DISCORD_TOKEN/TEST_GUILD_ID/TEST_CHANNEL_ID envs');
    process.exit(1);
  }

  const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]});
  await client.login(token);
  await new Promise(resolve => client.once('ready', resolve));
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    console.error('Channel not found');
    process.exit(1);
  }
  const user = client.user;
  const db = new Database();
  const results = [];

  async function record(name, fn, validate) {
    const start = nowMs();
    let ok = false, error = null;
    try {
      await fn();
      if (validate) {
        await validate({ start });
      }
      ok = true;
    } catch (e) {
      ok = false; error = e.message || String(e);
    }
    const end = nowMs();
    const durationMs = end - start;
    results.push({ name, ok, durationMs, error });
  }

  // Seed messages for summary
  await record('seed-messages', async () => {
    for (let i = 0; i < 5; i++) {
      await channel.send(`[benchmark] message ${i+1}`);
      await wait(200);
    }
  });

  // Summary
  await record('command:summary', async () => {
    const interaction = createInteractionStub({ client, channel, user, options: { count: 5 } });
    await summaryCmd.execute(interaction);
    await wait(1500);
  }, async ({ start }) => {
    const msg = await findLatestBotEmbedInChannel(channel, client.user.id, start, 'Summary');
    if (!msg) throw new Error('No summary embed found in channel');
    const embed = msg.embeds[0];
    const fields = Object.fromEntries(embed.fields.map(f => [f.name, f.value]));
    if (!fields['Messages Summarized']) throw new Error('Missing Messages Summarized field');
  });
  });

  // Set language
  await record('command:setlanguage', async () => {
    const interaction = createInteractionStub({ client, channel, user, options: { language: 'en' } });
    await setLanguageCmd.execute(interaction);
  }, async ({ start }) => {
    const msg = await findLatestBotEmbedInChannel(channel, client.user.id, start, 'Language Set');
    if (!msg) throw new Error('No language set embed found');
  });

  // Set thread mode and run summary -> should create thread
  await record('command:setthread(true)', async () => {
    const interaction = createInteractionStub({ client, channel, user, options: { thread_mode: true } });
    await setThreadCmd.execute(interaction);
  }, async ({ start }) => {
    const msg = await findLatestBotEmbedInChannel(channel, client.user.id, start, 'Output Format Updated');
    if (!msg) throw new Error('No setthread embed found');
  });
  await record('command:summary(threaded)', async () => {
    const interaction = createInteractionStub({ client, channel, user, options: { count: 3 } });
    await summaryCmd.execute(interaction);
    await wait(1500);
  }, async ({ start }) => {
    const thread = await findLatestThreadByBot(channel, client.user.id, start, 'Summary');
    if (!thread) throw new Error('Summary thread not found');
    const msgs = await thread.messages.fetch({ limit: 5 });
    const mine = Array.from(msgs.values()).find(m => m.author.id === client.user.id && m.embeds && m.embeds.length > 0);
    if (!mine) throw new Error('No summary embed in thread');
  });

  // Assistant (if provider API key exists it should respond)
  await record('command:assistant', async () => {
    const interaction = createInteractionStub({ client, channel, user, options: { provider: process.env.ASSISTANT_PROVIDER || 'gemini', prompt: 'Say hello in one sentence.' } });
    await assistantCmd.execute(interaction);
    await wait(1500);
  }, async ({ start }) => {
    // assistant likely in thread since thread_mode true
    const thread = await findLatestThreadByBot(channel, client.user.id, start, 'Assistant');
    if (thread) {
      const msgs = await thread.messages.fetch({ limit: 5 });
      const mine = Array.from(msgs.values()).find(m => m.author.id === client.user.id && m.embeds && m.embeds.length > 0);
      if (!mine) throw new Error('No assistant embed in thread');
    } else {
      const msg = await findLatestBotEmbedInChannel(channel, client.user.id, start, 'Assistant');
      if (!msg) throw new Error('No assistant embed found');
    }
  });

  // Write report
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'benchmark.live.json'), JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));

  // Post summary in channel
  const okCount = results.filter(r => r.ok).length;
  const failCount = results.length - okCount;
  await channel.send(`Benchmark complete: ${okCount} passed, ${failCount} failed. See CI artifacts for details.`);

  db.close();
  client.destroy();
  if (failCount > 0) process.exit(1);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});


