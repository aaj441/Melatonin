import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getPatterns = baseProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const patterns = await db.pattern.findMany({
      where: { userId: input.userId },
      include: {
        symbols: {
          include: {
            symbol: {
              include: {
                archetype: true,
              },
            },
          },
        },
      },
      orderBy: { frequency: 'desc' },
    });
    
    return { patterns };
  });
