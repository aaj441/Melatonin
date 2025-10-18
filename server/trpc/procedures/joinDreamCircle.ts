import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const joinDreamCircle = baseProcedure
  .input(z.object({
    userId: z.number(),
    circleId: z.number(),
  }))
  .mutation(async ({ input }) => {
    // Verify circle exists
    const circle = await db.dreamCircle.findUnique({
      where: { id: input.circleId },
    });
    
    if (!circle) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Circle not found",
      });
    }
    
    // Check if already a member
    const existingMembership = await db.dreamCircleMember.findUnique({
      where: {
        circleId_userId: {
          circleId: input.circleId,
          userId: input.userId,
        },
      },
    });
    
    if (existingMembership) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are already a member of this circle",
      });
    }
    
    // Create membership
    const membership = await db.dreamCircleMember.create({
      data: {
        circleId: input.circleId,
        userId: input.userId,
        role: 'member',
      },
    });
    
    return { membershipId: membership.id };
  });
