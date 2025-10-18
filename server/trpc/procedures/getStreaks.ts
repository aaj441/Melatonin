import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getStreaks = baseProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const streaks = await db.streak.findMany({
      where: { userId: input.userId },
    });

    return { streaks };
  });
