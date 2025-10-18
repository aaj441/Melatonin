import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getOrCreateUser = baseProcedure
  .input(z.object({ username: z.string() }))
  .query(async ({ input }) => {
    let user = await db.user.findUnique({
      where: { username: input.username },
    });
    
    if (!user) {
      user = await db.user.create({
        data: { username: input.username },
      });
    }
    
    return { userId: user.id, username: user.username };
  });
