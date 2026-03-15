import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.1-8b-instant';

export const generateCompletion = async (prompt, systemPrompt = 'You are a senior software engineer analyzing and explaining a codebase.') => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 2000
    });
    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating completion with Groq:', error.message);
    if (error.message.includes('Rate limit reached') || error.status === 429) {
      return `**Rate Limit Exceeded**. Our AI provider (Groq) is currently rate-limiting requests. Please try again soon.`;
    }
    return `Error generating AI response: ${error.message}`;
  }
};

export const chatWithContext = async (query, context) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are an AI assistant helping a developer understand a GitHub repository. Use the provided context documents to answer the question. If the answer is not in the context, say you do not know based on the provided files.' 
        },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }
      ],
      model: MODEL,
      temperature: 0.5,
    });
    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in chatWithContext:', error.message);
    return 'Error generating chat response.';
  }
};
