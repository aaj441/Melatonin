import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { randomBytes } from "crypto";

export const createCircleInvite = baseProcedure
  .input(z.object({
    userId: z.number(),
    circleId: z.number(),
    expiresInDays: z.number().optional().default(7),
    maxUses: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    // Verify user is elder or mentor of the circle
    const membership = await db.dreamCircleMember.findUnique({
      where: {
        circleId_userId: {
          circleId: input.circleId,
          userId: input.userId,
        },
      },
    });
    
    if (!membership || (membership.role !== 'elder' && membership.role !== 'mentor')) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only elders and mentors can create invitations",
      });
    }
    
    // Generate a unique invite code
    const code = randomBytes(8).toString('hex').toUpperCase();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
    
    const invite = await db.circleInvite.create({
      data: {
        code,
        circleId: input.circleId,
        createdById: input.userId,
        expiresAt,
        maxUses: input.maxUses,
        currentUses: 0,
      },
      include: {
        circle: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return { 
      inviteCode: invite.code,
      circleName: invite.circle.name,
      expiresAt: invite.expiresAt,
    };
  });
