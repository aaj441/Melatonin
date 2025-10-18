import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getUserPreferences = baseProcedure
  .input(z.object({
    userId: z.number(),
  }))
  .query(async ({ input }) => {
    const profile = await db.userProfile.findUnique({
      where: { userId: input.userId },
    });

    if (!profile) {
      return {
        interpretationStyle: 'mixed',
        preferredRituals: [],
        selectedThemeId: 'default',
        customThemePreferences: {},
        preferredWakeTime: null,
        sleepGoalHours: 8,
      };
    }

    const customPrefs = profile.customThemePreferences as any || {};
    const sleepData = profile.sleepPatternData as any || {};

    return {
      interpretationStyle: customPrefs.interpretationStyle || 'mixed',
      preferredRituals: customPrefs.preferredRituals || [],
      selectedThemeId: profile.selectedThemeId || 'default',
      customThemePreferences: profile.customThemePreferences,
      preferredWakeTime: profile.preferredWakeTime,
      sleepGoalHours: sleepData.goalHours || 8,
      externalIntegrations: profile.externalIntegrations,
    };
  });
