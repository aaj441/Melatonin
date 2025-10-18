import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const createCirclePost = baseProcedure
  .input(z.object({
    userId: z.number(),
    circleId: z.number(),
    content: z.string().min(1),
    title: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
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
    
    const post = await db.circlePost.create({
      data: {
        circleId: input.circleId,
        userId: input.userId,
        content: input.content,
        title: input.title,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    
    return { post };
  });
