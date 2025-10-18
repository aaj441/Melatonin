import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getCircleInvites = baseProcedure
  .input(z.object({
    userId: z.number(),
    circleId: z.number(),
  }))
  .query(async ({ input }) => {
    // Verify user is a member of the circle
    const membership = await db.dreamCircleMember.findUnique({
      where: {
        circleId_userId: {
          circleId: input.circleId,
          userId: input.userId,
        },
      },
    });
    
    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this circle",
      });
    }
    
    // Fetch active invites (not expired)
    const invites = await db.circleInvite.findMany({
      where: {
        circleId: input.circleId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        createdBy: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return { invites };
  });
