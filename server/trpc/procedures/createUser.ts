import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const createUser = baseProcedure
  .input(z.object({ username: z.string() }))
  .mutation(async ({ input }) => {
    const user = await db.user.create({
      data: {
        username: input.username,
      },
    });
    
    return { userId: user.id, username: user.username };
  });
