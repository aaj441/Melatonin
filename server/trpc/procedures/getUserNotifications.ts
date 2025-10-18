import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getUserNotifications = baseProcedure
  .input(z.object({
    userId: z.number(),
    unreadOnly: z.boolean().optional().default(false),
  }))
  .query(async ({ input }) => {
    const notifications = await db.notification.findMany({
      where: {
        userId: input.userId,
        ...(input.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 notifications
    });
    
    return { notifications };
  });
