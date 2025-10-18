import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const logRitualEntry = baseProcedure
  .input(
    z.object({
      userId: z.number(),
      ritualId: z.number(),
      effectivenessRating: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
      completedAt: z.date().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Verify ritual exists
    const ritual = await db.ritual.findUnique({
      where: { id: input.ritualId },
    });

    if (!ritual) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Ritual not found",
      });
    }

    // Create the ritual entry
    const entry = await db.ritualEntry.create({
      data: {
        userId: input.userId,
        ritualId: input.ritualId,
        completedAt: input.completedAt || new Date(),
        effectivenessRating: input.effectivenessRating,
        notes: input.notes,
      },
    });

    // Update ritual practice streak
    await updateStreakHelper(input.userId, "ritual_practice");

    return { entry };
  });

// Helper function to update streaks
async function updateStreakHelper(userId: number, type: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await db.streak.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (!streak) {
    await db.streak.create({
      data: {
        userId,
        type,
        currentLength: 1,
        maxLength: 1,
        lastUpdated: new Date(),
      },
    });
  } else {
    const lastUpdate = new Date(streak.lastUpdated);
    lastUpdate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Already logged today, no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      const newLength = streak.currentLength + 1;
      await db.streak.update({
        where: { id: streak.id },
        data: {
          currentLength: newLength,
          maxLength: Math.max(streak.maxLength, newLength),
          lastUpdated: new Date(),
        },
      });
    } else {
      // Streak broken
      await db.streak.update({
        where: { id: streak.id },
        data: {
          currentLength: 1,
          lastUpdated: new Date(),
        },
      });
    }
  }
}
