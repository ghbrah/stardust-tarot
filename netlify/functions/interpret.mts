import type { Context, Config } from "@netlify/functions";
import OpenAI from "openai";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { question, cards } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are a mystical, empathetic, and wise Tarot Reader.
The seeker has asked the following question: "${question}".

You have drawn the following three cards for a Past, Present, Future spread:

1. PAST: ${cards.past.name} (${cards.past.orientation}). Keywords: ${cards.past.keywords.join(', ')}.
2. PRESENT: ${cards.present.name} (${cards.present.orientation}). Keywords: ${cards.present.keywords.join(', ')}.
3. FUTURE: ${cards.future.name} (${cards.future.orientation}). Keywords: ${cards.future.keywords.join(', ')}.

Please provide a coherent, fluid, and insightful interpretation of this spread.
Weave the meanings of the cards together into a narrative that directly addresses the seeker's question.
Do not just list the card meanings; explain how the past influences the present and leads to the future potential.

Use a mystical but grounded tone. Be empathetic and honest.
Write a detailed reading with 4-6 well-developed paragraphs that explores the deeper meanings and connections between the cards.
Provide actionable wisdom and guidance.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a mystical and empathetic tarot reader who provides detailed, insightful readings that offer deep wisdom and practical guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4o-mini",
      max_tokens: 1200,  // ADDED: Allows for longer responses
      temperature: 0.8,  // ADDED: Slightly creative
    });

    const interpretation = completion.choices[0].message.content;

    return new Response(JSON.stringify({ interpretation }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in interpretation function:", error);
    return new Response(JSON.stringify({ error: "Failed to generate interpretation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/.netlify/functions/interpret",
};
