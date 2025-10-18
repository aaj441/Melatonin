import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const scheduleRitualReminder = baseProcedure
  .input(z.object({
    userId: z.number(),
    ritualId: z.number(),
    scheduledTime: z.date(),
    frequency: z.enum(['once', 'daily', 'weekly', 'custom']).optional(),
    triggerCondition: z.record(z.any()).optional(), // e.g., { moonPhase: 'full', weather: 'clear' }
  }))
  .mutation(async ({ input }) => {
    const reminder = await db.ritualReminder.create({
      data: {
        userId: input.userId,
        ritualId: input.ritualId,
        scheduledTime: input.scheduledTime,
        frequency: input.frequency || 'once',
        triggerCondition: input.triggerCondition,
        isActive: true,
      },
    });

    return { reminderId: reminder.id };
  });
