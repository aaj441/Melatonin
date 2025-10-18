import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const exportRituals = baseProcedure
  .input(z.object({
    userId: z.number(),
    format: z.enum(['json', 'csv']),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }))
  .query(async ({ input }) => {
    const ritualEntries = await db.ritualEntry.findMany({
      where: {
        userId: input.userId,
        ...(input.startDate && { completedAt: { gte: input.startDate } }),
        ...(input.endDate && { completedAt: { lte: input.endDate } }),
      },
      include: {
        ritual: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (input.format === 'json') {
      return {
        format: 'json' as const,
        data: ritualEntries,
        exportDate: new Date(),
        totalRituals: ritualEntries.length,
      };
    }

    // CSV format
    const csvRows = ritualEntries.map(entry => ({
      date: entry.completedAt.toISOString(),
      ritualName: entry.ritual.name,
      category: entry.ritual.category || '',
      effectivenessRating: entry.effectivenessRating || '',
      notes: entry.notes || '',
    }));

    return {
      format: 'csv' as const,
      data: csvRows,
      exportDate: new Date(),
      totalRituals: ritualEntries.length,
    };
  });
