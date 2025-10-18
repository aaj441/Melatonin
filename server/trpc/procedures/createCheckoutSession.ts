import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

// Note: Stripe SDK would be imported here when actually integrated
// import Stripe from 'stripe';
// const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export const createCheckoutSession = baseProcedure
  .input(
    z.object({
      userId: z.number(),
      items: z.array(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })
      ).optional(),
      subscriptionPlanId: z.number().optional(),
      promoCode: z.string().optional(),
      successUrl: z.string(),
      cancelUrl: z.string(),
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

    // Handle subscription checkout
    if (input.subscriptionPlanId) {
      const plan = await db.subscriptionPlan.findUnique({
        where: { id: input.subscriptionPlanId },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }

      // In production, create Stripe checkout session here
      // const session = await stripe.checkout.sessions.create({...});
      
      return {
        checkoutUrl: `/checkout/subscription/${plan.id}`, // Placeholder
        sessionId: `session_${Date.now()}`, // Placeholder
      };
    }

    // Handle product purchase checkout
    if (input.items && input.items.length > 0) {
      // Fetch all products
      const productIds = input.items.map((item) => item.productId);
      const products = await db.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== input.items.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more products not found",
        });
      }

      // Calculate total
      let total = 0;
      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          total += Number(product.price) * item.quantity;
        }
      }

      // Apply promo code if provided
      if (input.promoCode) {
        const promo = await db.promoCode.findUnique({
          where: { code: input.promoCode, isActive: true },
        });

        if (promo && (!promo.expirationDate || promo.expirationDate > new Date())) {
          if (promo.discountType === "percentage") {
            total = total * (1 - Number(promo.discountValue) / 100);
          } else {
            total = Math.max(0, total - Number(promo.discountValue));
          }

          // Update usage count
          await db.promoCode.update({
            where: { id: promo.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }

      // Create order
      const order = await db.order.create({
        data: {
          userId: input.userId,
          status: "PENDING",
          total,
          items: {
            create: input.items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
      });

      // In production, create Stripe checkout session here
      // const session = await stripe.checkout.sessions.create({...});

      return {
        checkoutUrl: `/checkout/order/${order.id}`, // Placeholder
        sessionId: `session_${Date.now()}`, // Placeholder
        orderId: order.id,
      };
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Must provide either items or subscriptionPlanId",
    });
  });
