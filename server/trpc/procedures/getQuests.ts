import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getQuests = baseProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const now = new Date();

    // Get active quests
    const activeQuests = await db.quest.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    });

    // Get user's progress on these quests
    const userQuests = await db.userQuest.findMany({
      where: {
        userId: input.userId,
        questId: { in: activeQuests.map((q) => q.id) },
      },
      include: { quest: true },
    });

    // Combine data
    const questsWithProgress = activeQuests.map((quest) => {
      const userQuest = userQuests.find((uq) => uq.questId === quest.id);
      return {
        ...quest,
        userProgress: userQuest?.progress || null,
        userStatus: userQuest?.status || null,
        startedAt: userQuest?.startedAt || null,
        completedAt: userQuest?.completedAt || null,
      };
    });

    return { quests: questsWithProgress };
  });
