import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getCulturalLenses = baseProcedure
  .query(async () => {
    const lenses = await db.culturalLens.findMany({
      orderBy: { tradition: 'asc' },
    });
    
    return { lenses };
  });
