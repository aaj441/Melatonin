import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const updateUserPreferences = baseProcedure
  .input(z.object({
    userId: z.number(),
    interpretationStyle: z.enum(['jungian', 'spiritual', 'psychological', 'cultural', 'mixed']).optional(),
    preferredRituals: z.array(z.string()).optional(),
    selectedThemeId: z.string().optional(),
    customThemePreferences: z.record(z.any()).optional(),
    preferredWakeTime: z.string().optional(), // HH:MM format
    sleepGoalHours: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const { userId, ...preferences } = input;

    // Get existing profile or create new one
    const existingProfile = await db.userProfile.findUnique({
      where: { userId },
    });

    const sleepPatternData = existingProfile?.sleepPatternData as any || {};
    
    if (input.sleepGoalHours !== undefined) {
      sleepPatternData.goalHours = input.sleepGoalHours;
    }

    const profile = await db.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        selectedThemeId: preferences.selectedThemeId,
        customThemePreferences: {
          ...preferences.customThemePreferences,
          interpretationStyle: preferences.interpretationStyle,
          preferredRituals: preferences.preferredRituals,
        },
        preferredWakeTime: preferences.preferredWakeTime,
        sleepPatternData,
      },
      update: {
        ...(preferences.selectedThemeId && { selectedThemeId: preferences.selectedThemeId }),
        ...(preferences.preferredWakeTime && { preferredWakeTime: preferences.preferredWakeTime }),
        customThemePreferences: {
          ...(existingProfile?.customThemePreferences as any || {}),
          ...preferences.customThemePreferences,
          interpretationStyle: preferences.interpretationStyle || (existingProfile?.customThemePreferences as any)?.interpretationStyle,
          preferredRituals: preferences.preferredRituals || (existingProfile?.customThemePreferences as any)?.preferredRituals,
        },
        sleepPatternData,
      },
    });

    return { success: true, profile };
  });
