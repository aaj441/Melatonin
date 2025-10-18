import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getUserSubscription = baseProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const subscription = await db.userSubscription.findFirst({
      where: {
        userId: input.userId,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return { subscription };
  });
