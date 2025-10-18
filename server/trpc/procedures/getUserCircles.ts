import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getUserCircles = baseProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const memberships = await db.dreamCircleMember.findMany({
      where: { userId: input.userId },
      include: {
        circle: {
          include: {
            _count: {
              select: {
                members: true,
                dreams: true,
              },
            },
          },
        },
      },
      orderBy: {
        circle: {
          createdAt: 'desc',
        },
      },
    });
    
    const circles = memberships.map(m => ({
      id: m.circle.id,
      name: m.circle.name,
      createdAt: m.circle.createdAt,
      role: m.role,
      memberCount: m.circle._count.members,
      dreamCount: m.circle._count.dreams,
    }));
    
    return { circles };
  });
