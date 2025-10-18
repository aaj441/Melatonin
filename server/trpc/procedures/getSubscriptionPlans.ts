import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getSubscriptionPlans = baseProcedure.query(async () => {
  const plans = await db.subscriptionPlan.findMany({
    orderBy: {
      price: "asc",
    },
  });

  return { plans };
});
