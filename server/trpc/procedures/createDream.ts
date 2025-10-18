import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const createDream = baseProcedure
  .input(z.object({
    userId: z.number(),
    title: z.string(),
    content: z.string(),
    voiceUrl: z.string().optional(),
    mood: z.string().optional(),
    energy: z.number().min(1).max(10).optional(),
    recordedAt: z.date(),
    privacySetting: z.enum(["PUBLIC", "PRIVATE", "ANONYMOUS", "CIRCLE_ONLY"]).optional(),
  }))
  .mutation(async ({ input }) => {
    const dream = await db.dream.create({
      data: {
        userId: input.userId,
        title: input.title,
        content: input.content,
        voiceUrl: input.voiceUrl,
        mood: input.mood,
        energy: input.energy,
        recordedAt: input.recordedAt,
        privacySetting: input.privacySetting || "PRIVATE",
      },
    });
    
    // Update dream logging streak
    await updateStreakHelper(input.userId, "dream_logging");
    
    return { dreamId: dream.id };
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
