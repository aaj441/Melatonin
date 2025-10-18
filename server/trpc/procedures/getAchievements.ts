import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getAchievements = baseProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const [allAchievements, userAchievements] = await Promise.all([
      db.achievement.findMany({
        orderBy: { category: "asc" },
      }),
      db.userAchievement.findMany({
        where: { userId: input.userId },
        include: { achievement: true },
      }),
    ]);

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return {
      achievements: allAchievements.map((achievement) => ({
        ...achievement,
        earned: earnedIds.has(achievement.id),
        earnedAt: userAchievements.find((ua) => ua.achievementId === achievement.id)?.earnedAt,
      })),
    };
  });
