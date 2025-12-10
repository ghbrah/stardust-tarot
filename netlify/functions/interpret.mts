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
The seeker has asked: "${question}".

The three cards drawn are:
- PAST: ${cards.past.name} (${cards.past.orientation}) - ${cards.past.keywords.join(', ')}
- PRESENT: ${cards.present.name} (${cards.present.orientation}) - ${cards.present.keywords.join(', ')}
- FUTURE: ${cards.future.name} (${cards.future.orientation}) - ${cards.future.keywords.join(', ')}

Provide a DETAILED tarot reading with the following structure:

**Paragraph 1:** Introduce the reading and the overall theme/energy.

**Paragraph 2:** Deeply explore the PAST card - what foundations, lessons, or experiences does it reveal? How has this shaped the seeker's current situation?

**Paragraph 3:** Thoroughly examine the PRESENT card - what is happening now? What choices or energies are at play? What should the seeker be aware of?

**Paragraph 4:** Fully interpret the FUTURE card - what potential outcomes or paths are emerging? What guidance can you offer?

**Paragraph 5:** Weave all three cards together into a cohesive narrative that directly answers their question. Provide actionable wisdom.

Write in a mystical yet grounded tone. Be specific, insightful, and helpful. Each paragraph should be 3-5 sentences long.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert tarot reader who provides comprehensive, detailed readings. You always write at least 5 substantial paragraphs for every reading."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0.85,
      presence_penalty: 0.6,  // Encourages more diverse content
      frequency_penalty: 0.3,  // Reduces repetition
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
