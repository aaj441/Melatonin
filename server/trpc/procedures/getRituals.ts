import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getRituals = baseProcedure
  .input(
    z.object({
      userId: z.number(),
      includePublic: z.boolean().default(true),
      category: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const where: any = {
      OR: [
        { authorId: input.userId },
        ...(input.includePublic ? [{ isPublic: true }] : []),
      ],
    };

    if (input.category) {
      where.category = input.category;
    }

    const rituals = await db.ritual.findMany({
      where,
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        userRituals: {
          where: { userId: input.userId },
          select: { isFavorite: true, customNotes: true },
        },
      },
    });

    let nextCursor: number | undefined = undefined;
    if (rituals.length > input.limit) {
      const nextItem = rituals.pop();
      nextCursor = nextItem!.id;
    }

    return {
      rituals: rituals.map((ritual) => ({
        ...ritual,
        isFavorite: ritual.userRituals[0]?.isFavorite || false,
        customNotes: ritual.userRituals[0]?.customNotes,
      })),
      nextCursor,
    };
  });
