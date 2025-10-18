import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const exportDreams = baseProcedure
  .input(z.object({
    userId: z.number(),
    format: z.enum(['json', 'csv']),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }))
  .query(async ({ input }) => {
    const dreams = await db.dream.findMany({
      where: {
        userId: input.userId,
        ...(input.startDate && { recordedAt: { gte: input.startDate } }),
        ...(input.endDate && { recordedAt: { lte: input.endDate } }),
      },
      include: {
        symbols: {
          include: {
            archetype: true,
          },
        },
        insights: true,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    if (input.format === 'json') {
      return {
        format: 'json' as const,
        data: dreams,
        exportDate: new Date(),
        totalDreams: dreams.length,
      };
    }

    // CSV format
    const csvRows = dreams.map(dream => ({
      date: dream.recordedAt.toISOString(),
      title: dream.title,
      content: dream.content,
      mood: dream.mood || '',
      energy: dream.energy || '',
      symbols: dream.symbols.map(s => s.symbolText).join('; '),
      archetypes: dream.symbols.map(s => s.archetype?.name || '').filter(Boolean).join('; '),
      insightCount: dream.insights.length,
    }));

    return {
      format: 'csv' as const,
      data: csvRows,
      exportDate: new Date(),
      totalDreams: dreams.length,
    };
  });
