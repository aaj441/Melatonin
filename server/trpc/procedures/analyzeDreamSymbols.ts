import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "~/server/env";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

export const analyzeDreamSymbols = baseProcedure
  .input(z.object({
    dreamId: z.number(),
    content: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Get all archetypes and cultural lenses for context
    const archetypes = await db.archetype.findMany();
    const culturalLenses = await db.culturalLens.findMany();
    
    // Use AI to extract symbols and match them to archetypes
    const symbolSchema = z.object({
      symbols: z.array(z.object({
        text: z.string().describe("The symbol found in the dream"),
        archetypeName: z.string().describe("The most relevant Jungian archetype name from the provided list"),
        culturalInterpretations: z.object({
          jungian: z.string().describe("Jungian psychological interpretation"),
          yoruba: z.string().describe("Yoruba spiritual interpretation"),
          chinese: z.string().describe("Chinese cultural interpretation"),
          hindu: z.string().describe("Hindu spiritual interpretation"),
          native_american: z.string().describe("Native American spiritual interpretation"),
          aboriginal: z.string().describe("Aboriginal Dreamtime interpretation"),
        }),
      })),
    });
    
    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o"),
      schema: symbolSchema,
      prompt: `Analyze this dream and extract significant symbols, matching them to Jungian archetypes and providing multi-cultural interpretations.

Dream content: "${input.content}"

Available archetypes: ${archetypes.map(a => `${a.name} (${a.jungianType}): ${a.description}`).join('\n')}

For each symbol found:
1. Identify the symbol text
2. Match it to the most relevant archetype
3. Provide interpretations from multiple cultural traditions (Jungian, Yoruba, Chinese, Hindu, Native American, Aboriginal)

Focus on universal symbols like: water, fire, animals, people, death, birth, journeys, houses, nature elements, colors, numbers.`,
    });
    
    // Save symbols and create insights
    const createdSymbols = [];
    const insights = [];
    
    for (const symbolData of object.symbols) {
      // Find matching archetype
      const archetype = archetypes.find(a => 
        a.name.toLowerCase() === symbolData.archetypeName.toLowerCase()
      );
      
      // Create symbol
      const symbol = await db.symbol.create({
        data: {
          dreamId: input.dreamId,
          symbolText: symbolData.text,
          archetypeId: archetype?.id,
          culturalTags: Object.keys(symbolData.culturalInterpretations),
        },
      });
      
      createdSymbols.push(symbol);
      
      // Create insights for each cultural interpretation
      for (const [tradition, interpretation] of Object.entries(symbolData.culturalInterpretations)) {
        if (interpretation) {
          insights.push({
            dreamId: input.dreamId,
            aiGenerated: true,
            content: interpretation,
            culturalLens: tradition,
          });
        }
      }
    }
    
    // Batch create insights
    if (insights.length > 0) {
      await db.insight.createMany({
        data: insights,
      });
    }
    
    return {
      symbolsFound: createdSymbols.length,
      symbols: createdSymbols,
    };
  });
