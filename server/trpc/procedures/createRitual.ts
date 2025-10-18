import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const createRitual = baseProcedure
  .input(
    z.object({
      userId: z.number(),
      name: z.string().min(1).max(200),
      description: z.string().min(1),
      steps: z.array(z.string()),
      category: z.string().optional(),
      recommendedMoods: z.array(z.string()).optional(),
      energyRange: z.object({
        min: z.number().min(1).max(10),
        max: z.number().min(1).max(10),
      }).optional(),
      isPublic: z.boolean().default(false),
      templateId: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // If making public, verify user is a contributor
    if (input.isPublic && !user.isContributor) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only contributors can create public rituals",
      });
    }

    // Create the ritual
    const ritual = await db.ritual.create({
      data: {
        name: input.name,
        description: input.description,
        steps: input.steps,
        category: input.category,
        recommendedMoods: input.recommendedMoods || [],
        energyRange: input.energyRange,
        isPublic: input.isPublic,
        authorId: input.userId,
        templateId: input.templateId,
      },
    });

    // Automatically add to user's rituals
    await db.userRitual.create({
      data: {
        userId: input.userId,
        ritualId: ritual.id,
        isFavorite: true,
      },
    });

    return { ritual };
  });
