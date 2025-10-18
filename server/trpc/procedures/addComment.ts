import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const addComment = baseProcedure
  .input(
    z.object({
      userId: z.number(),
      dreamId: z.number(),
      content: z.string().min(1),
      parentCommentId: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Verify dream exists and user has access
    const dream = await db.dream.findUnique({
      where: { id: input.dreamId },
      include: {
        sharedIn: {
          include: {
            circle: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!dream) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dream not found",
      });
    }

    // Check if user has permission to comment
    const canComment =
      dream.userId === input.userId ||
      dream.privacySetting === "PUBLIC" ||
      dream.sharedIn.some((share) =>
        share.circle.members.some((member) => member.userId === input.userId)
      );

    if (!canComment) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to comment on this dream",
      });
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        dreamId: input.dreamId,
        userId: input.userId,
        content: input.content,
        parentCommentId: input.parentCommentId,
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
