import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getCircleDreams = baseProcedure
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
    
    // Get all dreams shared to this circle
    const shares = await db.dreamCircleShare.findMany({
      where: { circleId: input.circleId },
      include: {
        dream: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            symbols: {
              include: {
                archetype: true,
              },
            },
            insights: true,
          },
        },
      },
      orderBy: {
        sharedAt: 'desc',
      },
    });
    
    const dreams = shares.map(share => ({
      ...share.dream,
      sharedAt: share.sharedAt,
    }));
    
    return { dreams };
  });
