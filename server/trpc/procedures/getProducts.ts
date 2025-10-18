import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getProducts = baseProcedure
  .input(
    z.object({
      type: z.enum([
        "DREAM_ANALYSIS",
        "RITUAL_KIT",
        "GUIDED_SESSION",
        "RITUAL_PACK",
        "INTERPRETATION_TEMPLATE",
        "DIGITAL_CONTENT",
        "PHYSICAL_KIT",
      ]).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const products = await db.product.findMany({
      where: input.type ? { type: input.type } : undefined,
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: [
        { popularityScore: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    let nextCursor: number | undefined = undefined;
    if (products.length > input.limit) {
      const nextItem = products.pop();
      nextCursor = nextItem!.id;
    }

    return {
      products: products.map((product) => ({
        ...product,
        reviewCount: product.reviews.length,
      })),
      nextCursor,
    };
  });
