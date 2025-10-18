import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getActiveReminders = baseProcedure
  .input(z.object({
    userId: z.number(),
  }))
  .query(async ({ input }) => {
    const reminders = await db.ritualReminder.findMany({
      where: {
        userId: input.userId,
        isActive: true,
      },
      include: {
        ritual: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return { reminders };
  });
