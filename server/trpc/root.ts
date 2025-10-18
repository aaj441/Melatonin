import {
  createCallerFactory,
  createTRPCRouter,
} from "~/server/trpc/main";
import { getMinioBaseUrl } from "~/server/trpc/procedures/getMinioBaseUrl";
import { getPresignedUploadUrl } from "~/server/trpc/procedures/getPresignedUploadUrl";
import { createDream } from "~/server/trpc/procedures/createDream";
import { analyzeDreamSymbols } from "~/server/trpc/procedures/analyzeDreamSymbols";
import { getDreams } from "~/server/trpc/procedures/getDreams";
import { getArchetypes } from "~/server/trpc/procedures/getArchetypes";
import { getCulturalLenses } from "~/server/trpc/procedures/getCulturalLenses";
import { detectPatterns } from "~/server/trpc/procedures/detectPatterns";
import { getPatterns } from "~/server/trpc/procedures/getPatterns";
import { getOrCreateUser } from "~/server/trpc/procedures/getOrCreateUser";
import { createDreamCircle } from "~/server/trpc/procedures/createDreamCircle";
import { getUserCircles } from "~/server/trpc/procedures/getUserCircles";
import { joinDreamCircle } from "~/server/trpc/procedures/joinDreamCircle";
import { shareDreamToCircle } from "~/server/trpc/procedures/shareDreamToCircle";
import { getCircleDreams } from "~/server/trpc/procedures/getCircleDreams";
import { getCircleMembers } from "~/server/trpc/procedures/getCircleMembers";
import { createCircleInvite } from "~/server/trpc/procedures/createCircleInvite";
import { joinCircleByInvite } from "~/server/trpc/procedures/joinCircleByInvite";
import { getCircleInvites } from "~/server/trpc/procedures/getCircleInvites";
import { createCirclePost } from "~/server/trpc/procedures/createCirclePost";
import { getCirclePosts } from "~/server/trpc/procedures/getCirclePosts";
import { addCirclePostComment } from "~/server/trpc/procedures/addCirclePostComment";
import { getProducts } from "~/server/trpc/procedures/getProducts";
import { getSubscriptionPlans } from "~/server/trpc/procedures/getSubscriptionPlans";
import { createCheckoutSession } from "~/server/trpc/procedures/createCheckoutSession";
import { getUserSubscription } from "~/server/trpc/procedures/getUserSubscription";
import { createRitual } from "~/server/trpc/procedures/createRitual";
import { getRituals } from "~/server/trpc/procedures/getRituals";
import { logRitualEntry } from "~/server/trpc/procedures/logRitualEntry";
import { getStreaks } from "~/server/trpc/procedures/getStreaks";
import { getAchievements } from "~/server/trpc/procedures/getAchievements";
import { getQuests } from "~/server/trpc/procedures/getQuests";
import { addComment } from "~/server/trpc/procedures/addComment";
import { getDreamComments } from "~/server/trpc/procedures/getDreamComments";
import { transcribeAudio } from "~/server/trpc/procedures/transcribeAudio";
import { getUserPreferences } from "~/server/trpc/procedures/getUserPreferences";
import { updateUserPreferences } from "~/server/trpc/procedures/updateUserPreferences";
import { scheduleRitualReminder } from "~/server/trpc/procedures/scheduleRitualReminder";
import { getActiveReminders } from "~/server/trpc/procedures/getActiveReminders";
import { sendRitualNotification } from "~/server/trpc/procedures/sendRitualNotification";
import { getUserNotifications } from "~/server/trpc/procedures/getUserNotifications";
import { markNotificationRead } from "~/server/trpc/procedures/markNotificationRead";
import { exportDreams } from "~/server/trpc/procedures/exportDreams";
import { exportRituals } from "~/server/trpc/procedures/exportRituals";
import { exportAchievements } from "~/server/trpc/procedures/exportAchievements";

export const appRouter = createTRPCRouter({
  getMinioBaseUrl,
  getPresignedUploadUrl,
  createDream,
  analyzeDreamSymbols,
  getDreams,
  getArchetypes,
  getCulturalLenses,
  detectPatterns,
  getPatterns,
  getOrCreateUser,
  createDreamCircle,
  getUserCircles,
  joinDreamCircle,
  shareDreamToCircle,
  getCircleDreams,
  getCircleMembers,
  // Circle Invitations & Discussions
  createCircleInvite,
  joinCircleByInvite,
  getCircleInvites,
  createCirclePost,
  getCirclePosts,
  addCirclePostComment,
  // Monetization & Marketplace
  getProducts,
  getSubscriptionPlans,
  createCheckoutSession,
  getUserSubscription,
  // Rituals
  createRitual,
  getRituals,
  logRitualEntry,
  // Gamification
  getStreaks,
  getAchievements,
  getQuests,
  // Comments
  addComment,
  getDreamComments,
  // Voice & AI
  transcribeAudio,
  // User Preferences & Personalization
  getUserPreferences,
  updateUserPreferences,
  // Ritual Reminders & Notifications
  scheduleRitualReminder,
  getActiveReminders,
  sendRitualNotification,
  getUserNotifications,
  markNotificationRead,
  // Export
  exportDreams,
  exportRituals,
  exportAchievements,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
