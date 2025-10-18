import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const markNotificationRead = baseProcedure
  .input(z.object({
    notificationId: z.number(),
    userId: z.number(),
  }))
  .mutation(async ({ input }) => {
    await db.notification.updateMany({
      where: {
        id: input.notificationId,
        userId: input.userId, // Ensure user owns the notification
      },
      data: {
        isRead: true,
      },
    });
    
    return { success: true };
  });
