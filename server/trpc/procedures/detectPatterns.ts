import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "~/server/env";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

export const detectPatterns = baseProcedure
  .input(z.object({ userId: z.number() }))
  .mutation(async ({ input }) => {
    // Get all user dreams with symbols
    const dreams = await db.dream.findMany({
      where: { userId: input.userId },
      include: {
        symbols: {
          include: {
            archetype: true,
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
      take: 20, // Analyze last 20 dreams
    });
    
    if (dreams.length < 2) {
      return { patterns: [] };
    }
    
    // Prepare dream summaries for AI
    const dreamSummaries = dreams.map(d => ({
      date: d.recordedAt.toISOString(),
      content: d.content.substring(0, 500),
      symbols: d.symbols.map(s => s.symbolText),
      archetypes: d.symbols.map(s => s.archetype?.name).filter(Boolean),
    }));
    
    const patternSchema = z.object({
      patterns: z.array(z.object({
        name: z.string().describe("Name of the recurring pattern"),
        frequency: z.number().describe("How many dreams show this pattern"),
        interpretation: z.string().describe("Deep psychological and spiritual interpretation of this pattern"),
        symbolsInvolved: z.array(z.string()).describe("List of symbols that make up this pattern"),
      })),
    });
    
    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o"),
      schema: patternSchema,
      prompt: `Analyze these dreams and detect recurring patterns, themes, and archetypal motifs.

Dreams: ${JSON.stringify(dreamSummaries, null, 2)}

Identify:
1. Recurring symbols or themes across multiple dreams
2. Archetypal patterns (Hero's journey, Shadow work, Anima/Animus encounters, etc.)
3. Emotional or spiritual themes that repeat
4. Transformational patterns showing growth or challenges

Provide deep, meaningful interpretations that honor both Jungian psychology and cross-cultural wisdom traditions.`,
    });
    
    // Save detected patterns
    const createdPatterns = [];
    
    for (const patternData of object.patterns) {
      // Find matching symbols across dreams
      const matchingSymbols = await db.symbol.findMany({
        where: {
          dreamId: { in: dreams.map(d => d.id) },
          symbolText: { in: patternData.symbolsInvolved },
        },
      });
      
      // Create pattern
      const pattern = await db.pattern.create({
        data: {
          userId: input.userId,
          name: patternData.name,
          frequency: patternData.frequency,
          interpretation: patternData.interpretation,
          aiGenerated: true,
        },
      });
      
      // Link symbols to pattern
      if (matchingSymbols.length > 0) {
        await db.patternSymbol.createMany({
          data: matchingSymbols.map(s => ({
            patternId: pattern.id,
            symbolId: s.id,
          })),
          skipDuplicates: true,
        });
      }
      
      createdPatterns.push(pattern);
    }
    
    return { patterns: createdPatterns };
  });
