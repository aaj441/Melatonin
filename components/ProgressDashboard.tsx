import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { MysticalCard } from "~/components/MysticalCard";
import { Flame, Trophy, Target, Star } from "lucide-react";

interface ProgressDashboardProps {
  userId: number;
}

export function ProgressDashboard({ userId }: ProgressDashboardProps) {
  const trpc = useTRPC();

  const streaksQuery = useQuery(
    trpc.getStreaks.queryOptions({ userId })
  );

  const achievementsQuery = useQuery(
    trpc.getAchievements.queryOptions({ userId })
  );

  const questsQuery = useQuery(
    trpc.getQuests.queryOptions({ userId })
  );

  const streaks = streaksQuery.data?.streaks || [];
  const achievements = achievementsQuery.data?.achievements || [];
  const quests = questsQuery.data?.quests || [];

  const dreamStreak = streaks.find((s) => s.type === "dream_logging");
  const ritualStreak = streaks.find((s) => s.type === "ritual_practice");
  const earnedAchievements = achievements.filter((a) => a.earned);
  const activeQuests = quests.filter((q) => q.userStatus === "ACTIVE" || !q.userStatus);

  return (
    <div className="space-y-6">
      {/* Streaks Section */}
      <MysticalCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-purple-100">Your Streaks</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dream Logging Streak */}
            <div className="bg-purple-900/30 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">Dream Logging</div>
              <div className="text-3xl font-bold text-purple-100 mb-1">
                {dreamStreak?.currentLength || 0} days
              </div>
              <div className="text-xs text-purple-400">
                Best: {dreamStreak?.maxLength || 0} days
              </div>
            </div>

            {/* Ritual Practice Streak */}
            <div className="bg-purple-900/30 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">Ritual Practice</div>
              <div className="text-3xl font-bold text-purple-100 mb-1">
                {ritualStreak?.currentLength || 0} days
              </div>
              <div className="text-xs text-purple-400">
                Best: {ritualStreak?.maxLength || 0} days
              </div>
            </div>
          </div>
        </div>
      </MysticalCard>

      {/* Achievements Section */}
      <MysticalCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-purple-100">Achievements</h3>
            <span className="ml-auto text-sm text-purple-300">
              {earnedAchievements.length} / {achievements.length}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg text-center transition-all ${
                  achievement.earned
                    ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                    : "bg-purple-900/20 border border-purple-700/30 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{achievement.iconUrl}</div>
                <div className="text-xs font-semibold text-purple-100 mb-1">
                  {achievement.name}
                </div>
                {achievement.earned && achievement.earnedAt && (
                  <div className="text-xs text-purple-400">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {achievements.length > 8 && (
            <div className="text-center mt-4">
              <button className="text-sm text-purple-300 hover:text-purple-100 transition-colors">
                View all {achievements.length} achievements →
              </button>
            </div>
          )}
        </div>
      </MysticalCard>

      {/* Active Quests Section */}
      {activeQuests.length > 0 && (
        <MysticalCard>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-purple-100">Active Quests</h3>
            </div>

            <div className="space-y-3">
              {activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-purple-900/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-purple-100">
                        {quest.name}
                      </h4>
                      <p className="text-sm text-purple-300 mt-1">
                        {quest.description}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-600/20 rounded text-xs text-blue-300">
                      {quest.type}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {quest.userProgress && typeof quest.userProgress === 'object' && 'current' in quest.userProgress && 'target' in quest.userProgress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-purple-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {quest.userProgress.current} / {quest.userProgress.target}
                        </span>
                      </div>
                      <div className="w-full bg-purple-900/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (quest.userProgress.current / quest.userProgress.target) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </MysticalCard>
      )}
    </div>
  );
}
