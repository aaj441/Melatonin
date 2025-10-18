import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const shareDreamToCircle = baseProcedure
  .input(z.object({
    userId: z.number(),
    dreamId: z.number(),
    circleId: z.number(),
  }))
  .mutation(async ({ input }) => {
    // Verify the dream belongs to the user
    const dream = await db.dream.findFirst({
      where: {
        id: input.dreamId,
        userId: input.userId,
      },
    });
    
    if (!dream) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dream not found or you don't have permission to share it",
      });
    }
    
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
    
    // Check if already shared
    const existingShare = await db.dreamCircleShare.findUnique({
      where: {
        circleId_dreamId: {
          circleId: input.circleId,
          dreamId: input.dreamId,
        },
      },
    });
    
    if (existingShare) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Dream already shared to this circle",
      });
    }
    
    // Create the share
    const share = await db.dreamCircleShare.create({
      data: {
        circleId: input.circleId,
        dreamId: input.dreamId,
      },
    });
    
    return { shareId: share.id };
  });
