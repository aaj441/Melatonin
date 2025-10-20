import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "~/server/env";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

/**
 * Interpret a single dream and return a structured JSON object.
 * The text content of fields should be written in the requested locale/language.
 */
export const interpretDream = baseProcedure
  .input(
    z.object({
      content: z.string().min(1, "Dream content is required"),
      locale: z.string().optional().default("en-US"),
    })
  )
  .mutation(async ({ input }) => {
    const interpretationSchema = z.object({
      mainThemes: z
        .array(z.string())
        .min(1)
        .max(5)
        .describe("Top themes present in the dream"),
      emotionalTone: z
        .string()
        .describe("Description of the emotional undertones in the dream"),
      symbols: z
        .array(
          z.object({
            symbol: z.string().describe("Symbol name or phrase"),
            meaning: z.string().describe("Meaning of the symbol in context"),
          })
        )
        .max(10)
        .describe("List of symbols with meanings"),
      personalInsight: z
        .string()
        .describe(
          "Personal, compassionate insight about what this dream might mean for the dreamer"
        ),
      guidance: z
        .string()
        .describe("Gentle guidance for reflection or action")
    });

    const systemPrompt = `You are a compassionate dream interpreter with expertise in psychology, symbolism, and emotional wellness. Analyze the user's dream and provide a thoughtful, supportive interpretation. Keep a gentle tone. Respond in the requested locale/language.`;

    const userPrompt = `Dream: "${input.content}"

Please respond in ${input.locale} with an object that follows the provided JSON schema.`;

    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o"),
      schema: interpretationSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return { interpretation: object };
  });
