import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const addCirclePostComment = baseProcedure
  .input(z.object({
    userId: z.number(),
    postId: z.number(),
    content: z.string().min(1),
  }))
  .mutation(async ({ input }) => {
    // Get the post with circle info
    const post = await db.circlePost.findUnique({
      where: { id: input.postId },
      include: {
        circle: {
          include: {
            members: true,
          },
        },
      },
    });
    
    if (!post) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    }
    
    // Verify user is a member
    const isMember = post.circle.members.some(m => m.userId === input.userId);
    if (!isMember) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this circle",
      });
    }
    
    const comment = await db.circlePostComment.create({
      data: {
        postId: input.postId,
        userId: input.userId,
        content: input.content,
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
    
    return { comment };
  });
