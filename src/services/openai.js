const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async summarizeMessages(messages, userSettings = {}, customApiKey = null) {
        try {
            const apiKey = customApiKey || process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('No OpenAI API key available');
            }

            // Create a temporary OpenAI instance with the user's API key if provided
            const openaiInstance = customApiKey ? new OpenAI({ apiKey: customApiKey }) : this.openai;

            // Prepare messages for summarization
            const messageText = messages.map(msg => {
                const timestamp = new Date(msg.createdTimestamp).toLocaleString();
                return `[${timestamp}] ${msg.author.username}: ${msg.content}`;
            }).join('\n');

            // Determine language for summary
            const language = userSettings.language || 'en';
            const languagePrompt = language !== 'en' ? `Please provide the summary in ${language}.` : '';

            const prompt = `Please provide a comprehensive summary of the following Discord messages. 
            Focus on the main topics, key points, and important discussions. 
            Organize the summary in a clear and structured way.
            ${languagePrompt}
            
            Messages:
            ${messageText}
            
            Summary:`;

            const response = await openaiInstance.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that summarizes Discord conversations in a clear and organized manner.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Failed to summarize messages: ${error.message}`);
        }
    }

    async summarizeWithMode(messages, mode, userSettings = {}, customApiKey = null) {
        try {
            const apiKey = customApiKey || process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('No OpenAI API key available');
            }

            const openaiInstance = customApiKey ? new OpenAI({ apiKey: customApiKey }) : this.openai;

            const messageText = messages.map(msg => {
                const timestamp = new Date(msg.createdTimestamp).toLocaleString();
                return `[${timestamp}] ${msg.author.username}: ${msg.content}`;
            }).join('\n');

            const language = userSettings.language || 'en';
            const languagePrompt = language !== 'en' ? `Please provide the summary in ${language}.` : '';

            const prompt = `Please provide a summary of the following Discord messages using the specified mode: "${mode}".
            ${languagePrompt}
            
            Messages:
            ${messageText}
            
            Summary (${mode} mode):`;

            const response = await openaiInstance.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that summarizes Discord conversations. When a specific mode is requested, adapt your summary style accordingly.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Failed to summarize messages with mode: ${error.message}`);
        }
    }
}

module.exports = OpenAIService; 