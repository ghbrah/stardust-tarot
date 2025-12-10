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

    const prompt = `
      You are a mystical and wise Tarot Reader. 
      The user has asked: "${question}"
      
      Here are the three cards drawn:
      1. PAST: ${cards[0].name} (${cards[0].orientation}) - Keywords: ${cards[0].keywords.join(", ")}
      2. PRESENT: ${cards[1].name} (${cards[1].orientation}) - Keywords: ${cards[1].keywords.join(", ")}
      3. FUTURE: ${cards[2].name} (${cards[2].orientation}) - Keywords: ${cards[2].keywords.join(", ")}
      
      Weave a cohesive, mystical, and insightful story connecting these three cards to answer the user's question. 
      Be empathetic but honest. Use a slightly poetic and elevated tone. 
      Keep the response under 150 words. Focus on the narrative arc from past to future.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
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
