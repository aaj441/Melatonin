import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getDreamComments = baseProcedure
  .input(z.object({ dreamId: z.number() }))
  .query(async ({ input }) => {
    const comments = await db.comment.findMany({
      where: { dreamId: input.dreamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter to only top-level comments (no parent)
    const topLevelComments = comments.filter((c) => !c.parentCommentId);

    return { comments: topLevelComments };
  });
