import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const exportAchievements = baseProcedure
  .input(z.object({
    userId: z.number(),
    format: z.enum(['json', 'csv']),
  }))
  .query(async ({ input }) => {
    const [achievements, streaks] = await Promise.all([
      db.userAchievement.findMany({
        where: { userId: input.userId },
        include: {
          achievement: true,
        },
        orderBy: {
          earnedAt: 'desc',
        },
      }),
      db.streak.findMany({
        where: { userId: input.userId },
      }),
    ]);

    if (input.format === 'json') {
      return {
        format: 'json' as const,
        data: {
          achievements,
          streaks,
        },
        exportDate: new Date(),
        totalAchievements: achievements.length,
      };
    }

    // CSV format - combine achievements and streaks
    const achievementRows = achievements.map(ua => ({
      type: 'achievement',
      name: ua.achievement.name,
      description: ua.achievement.description,
      category: ua.achievement.category || '',
      earnedAt: ua.earnedAt.toISOString(),
    }));

    const streakRows = streaks.map(streak => ({
      type: 'streak',
      name: `${streak.type} Streak`,
      description: `Current: ${streak.currentLength} days, Max: ${streak.maxLength} days`,
      category: 'streak',
      earnedAt: streak.lastUpdated.toISOString(),
    }));

    return {
      format: 'csv' as const,
      data: [...achievementRows, ...streakRows],
      exportDate: new Date(),
      totalAchievements: achievements.length,
      totalStreaks: streaks.length,
    };
  });
