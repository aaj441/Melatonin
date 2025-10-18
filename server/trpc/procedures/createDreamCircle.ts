import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const createDreamCircle = baseProcedure
  .input(z.object({
    userId: z.number(),
    name: z.string().min(1).max(100),
  }))
  .mutation(async ({ input }) => {
    const circle = await db.dreamCircle.create({
      data: {
        name: input.name,
        members: {
          create: {
            userId: input.userId,
            role: 'elder', // Creator gets elder role
          },
        },
      },
      include: {
        members: true,
      },
    });
    
    return { circleId: circle.id };
  });
