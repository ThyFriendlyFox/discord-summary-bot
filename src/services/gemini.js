const { GoogleGenAI } = require('@google/genai');

class GeminiService {
    constructor() {
        this.ai = new GoogleGenAI({});
    }

    async summarizeMessages(messages, userSettings = {}, customApiKey = null) {
        try {
            // Create a temporary client with custom API key if provided
            const ai = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : this.ai;

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

            const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to summarize messages: ${error.message}`);
        }
    }

    async summarizeWithMode(messages, mode, userSettings = {}, customApiKey = null) {
        try {
            // Create a temporary client with custom API key if provided
            const ai = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : this.ai;

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

            const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to summarize messages with mode: ${error.message}`);
        }
    }
}

module.exports = GeminiService; 