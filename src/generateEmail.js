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

Your task is to create a compelling, natural-sounding subject line for an email targeted at potential leads based on the service they are interested in.

Interested Service(s): ${services.join(', ')}

Before generating the subject line:

1. Carefully review the provided service names for spelling mistakes, grammar issues, vague wording, or typos.
2. Correct the spelling and rewrite them into proper, clear IT service names.
3. If vague or unclear terms are used, interpret them and map them to the most likely intended IT service. Examples:
   - "websit devlopment" -> "Website Development"
   - "seo servies" -> "SEO Services"
   - "app bulding" -> "App Development"
   - "hosting help" -> "Web Hosting Support"
4. If unrelated or non-IT service terms are provided, politely ignore them or map to relevant IT service where applicable.

When creating the subject line, you must:
- Make it catchy, engaging, and sound like it was written by a real person.
- Ensure it is professional yet personal — avoid robotic, spammy, or overly salesy language.
- Spark curiosity, highlight value, or make the reader feel understood.
- Keep it clear, brief, and easy to read.
- Use the corrected and clarified service name(s) naturally in the subject line if appropriate.

Important:
- Only generate the subject line.
- Do not include greetings, body content, or any explanations.
- Make sure the subject line feels warm, genuine, and increases the likelihood of the email being opened.

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
  const prompt = `You are an expert email copywriter for Triad Flair, an IT services company.

Your task is to write a professional, engaging, and personalized email body using the following details:

Name: ${name}
Interested Service(s): ${services.join(', ')}

Before drafting the email:

1. Carefully review the provided service names for any spelling mistakes, grammar issues, vague words, slang, or typos.
2. Correct the spelling and rewrite them as proper, standard IT service terms.
3. If vague or unclear terms are used, interpret and map them to the most likely intended IT service. Examples:
   - "websit devlopment" -> "Website Development"
   - "seo servies" -> "SEO Services"
   - "help with website" -> "Website Development and Support"
   - "app making" -> "App Development"
4. If unrelated or non-IT service terms are provided, politely ignore or rephrase them to stay relevant to Triad Flair's IT services.
5. Format the corrected service names professionally for use in the email body.

When writing the email, you must:
- Start by greeting the user by their name.
- Thank them sincerely for showing interest in the service(s).
- Briefly introduce Triad Flair and its strong expertise in IT services.
- Highlight how Triad Flair can specifically assist the user with their corrected and clarified interested service(s).
- End with a polite call to action, inviting them to schedule a call or discuss their needs further.
- Include a friendly closing with regards, followed by "Triad Flair" and, on the next line, the website URL: https://www.triadflair.com/

Important:
- Only generate the email body (no subject line, no explanations).
- Use a professional, friendly, natural, and humanized tone.
- Avoid sounding robotic or generic.

`;

  const res = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt
  });

  return res.text.trim();
}
