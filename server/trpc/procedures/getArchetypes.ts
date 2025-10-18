import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getArchetypes = baseProcedure
  .query(async () => {
    const archetypes = await db.archetype.findMany({
      orderBy: { name: 'asc' },
    });
    
    return { archetypes };
  });
