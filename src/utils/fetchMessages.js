/**
 * Fetch messages from a Discord channel with pagination.
 * Supports fetching the last N messages, or messages after a given message ID.
 *
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {number} totalToFetch - Total messages to fetch (max practical ~2000)
 * @param {{ afterId?: string, beforeId?: string, filter?: (m: any) => boolean }} [options]
 * @returns {Promise<Array>}
 */
async function fetchMessagesPaginated(channel, totalToFetch, options = {}) {
  const pageSize = 100; // Discord API max per call
  const messagesCollected = [];
  let lastId = options.afterId ? options.afterId : undefined;
  let beforeId = options.beforeId ? options.beforeId : undefined;

  while (messagesCollected.length < totalToFetch) {
    const remaining = totalToFetch - messagesCollected.length;
    const limit = Math.min(pageSize, remaining);

    const fetchOptions = { limit };
    if (lastId) fetchOptions.after = lastId;
    if (!lastId && beforeId) fetchOptions.before = beforeId;

    const batch = await channel.messages.fetch(fetchOptions);
    const batchArray = Array.from(batch.values());

    if (batchArray.length === 0) {
      break;
    }

    // When using `after`, Discord returns oldest->newest order in the Map; normalize to chronological
    batchArray.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    for (const msg of batchArray) {
      if (options.filter && !options.filter(msg)) continue;
      messagesCollected.push(msg);
      if (messagesCollected.length >= totalToFetch) break;
    }

    // Prepare next cursor
    if (options.afterId || lastId) {
      lastId = batchArray[batchArray.length - 1].id;
    } else if (beforeId) {
      beforeId = batchArray[0].id;
    } else {
      // Default to walking backward in time if neither provided
      beforeId = batchArray[0].id;
    }
  }

  return messagesCollected;
}

module.exports = { fetchMessagesPaginated };


