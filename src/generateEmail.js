// src/generateEmail.js
import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

/**
 * Generates a personalized email subject line using Gemini 1.5 Flash.
 * @param {{ services: string[] }} user
 * @returns {Promise<string>} The generated email subject line.
 */
export async function generateEmailSubject({ services }) {
  const ai = new GoogleGenAI({ apiKey: config.geminiKey });
  const prompt = `
You are an expert copywriter for Triad Flair, an IT services company.

Your task is to create a compelling, natural-sounding subject line for an email targeted at potential leads based on the service they are interested in:

Interested Service: ${services.join(', ')}

The subject line should:
- Be catchy, engaging, and feel written by a real person.
- Sound professional yet personal — avoiding anything too robotic or overly salesy.
- Spark curiosity, highlight value, or make the reader feel understood.
- Stay clear, brief, and easy to read.

Important:
Only generate the subject line.
Do not include greetings, body content, or any explanations.

Your goal: Create a subject line that feels warm, genuine, and increases the likelihood of the email being opened.
`;

  const res = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt
  });

  return res.text.trim();
}

/**
 * Generates a personalized email body using Gemini 1.5 Flash.
 * @param {{ name: string, services: string[] }} user
 * @returns {Promise<string>} The generated email body.
 */
export async function generateEmailBody({ name, services }) {
  const ai = new GoogleGenAI({ apiKey: config.geminiKey });
  const prompt = `
You are an expert email copywriter for Triad Flair, an IT services company.

Your task is to write a professional, engaging, and personalized email body using the following details:

Name: ${name}
Interested Service: ${services.join(', ')}

The email should:
- Start by greeting the user by their name.
- Thank them sincerely for showing interest in the service.
- Briefly introduce Triad Flair and its strong expertise in IT services.
- Highlight how Triad Flair can specifically assist the user with their interested service.
- End with a polite call to action, inviting them to schedule a call or discuss their needs further.
- Include a friendly closing with regards, followed by "Triad Flair" and, on the next line, the website URL: https://www.triadflair.com/

Important:
Only generate the email body (no subject line, no explanations).
Keep the tone professional, friendly, natural, and humanized — sounding like a real person, not robotic.
`;

  const res = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt
  });

  return res.text.trim();
}
