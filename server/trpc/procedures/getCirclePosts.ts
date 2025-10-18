import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getCirclePosts = baseProcedure
  .input(z.object({
    userId: z.number(),
    circleId: z.number(),
  }))
  .query(async ({ input }) => {
    // Verify user is a member
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
    
    const posts = await db.circlePost.findMany({
      where: {
        circleId: input.circleId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return { posts };
  });
