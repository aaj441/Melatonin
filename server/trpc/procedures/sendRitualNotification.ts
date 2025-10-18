import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const sendRitualNotification = baseProcedure
  .input(z.object({
    userId: z.number(),
    ritualId: z.number(),
    message: z.string(),
  }))
  .mutation(async ({ input }) => {
    const ritual = await db.ritual.findUnique({
      where: { id: input.ritualId },
      select: { name: true },
    });
    
    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        type: 'REMINDER',
        message: input.message,
        metadata: {
          ritualId: input.ritualId,
          ritualName: ritual?.name,
        },
      },
    });
    
    // TODO: In production, integrate with email service (SendGrid, AWS SES, etc.)
    // or push notification service (Firebase Cloud Messaging, OneSignal, etc.)
    
    return { notificationId: notification.id };
  });
