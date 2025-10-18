import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const joinCircleByInvite = baseProcedure
  .input(z.object({
    userId: z.number(),
    inviteCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Find the invite
    const invite = await db.circleInvite.findUnique({
      where: { code: input.inviteCode },
      include: {
        circle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!invite) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid invitation code",
      });
    }
    
    // Check if expired
    if (invite.expiresAt < new Date()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This invitation has expired",
      });
    }
    
    // Check if max uses reached
    if (invite.maxUses && invite.currentUses >= invite.maxUses) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This invitation has reached its maximum number of uses",
      });
    }
    
    // Check if already a member
    const existingMembership = await db.dreamCircleMember.findUnique({
      where: {
        circleId_userId: {
          circleId: invite.circleId,
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
        circleId: invite.circleId,
        userId: input.userId,
        role: 'member',
      },
    });
    
    // Increment invite usage
    await db.circleInvite.update({
      where: { id: invite.id },
      data: { currentUses: { increment: 1 } },
    });
    
    return { 
      membershipId: membership.id,
      circleName: invite.circle.name,
      circleId: invite.circle.id,
    };
  });
