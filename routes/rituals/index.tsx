import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUserStore } from "~/store/userStore";
import { CosmicBackground } from "~/components/CosmicBackground";
import { GlowingButton } from "~/components/GlowingButton";
import { MysticalCard } from "~/components/MysticalCard";
import { Sparkles, Moon, Sun, Heart, CheckCircle, Star } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/rituals/")({
  component: RitualsPage,
});

function RitualsPage() {
  const { userId } = useUserStore();
  const trpc = useTRPC();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedRitual, setSelectedRitual] = useState<number | null>(null);

  const ritualsQuery = useQuery(
    trpc.getRituals.queryOptions({
      userId: userId!,
      includePublic: true,
      category: selectedCategory,
      limit: 20,
    })
  );

  const logRitualMutation = useMutation(
    trpc.logRitualEntry.mutationOptions()
  );

  const rituals = ritualsQuery.data?.rituals || [];

  const categories = [
    { value: undefined, label: "All Rituals", icon: Sparkles },
    { value: "Preparation", label: "Preparation", icon: Moon },
    { value: "Capture", label: "Capture", icon: Sun },
    { value: "Lunar", label: "Lunar", icon: Moon },
    { value: "Integration", label: "Integration", icon: Heart },
    { value: "Circle", label: "Circle", icon: Sparkles },
  ];

  const handleCompleteRitual = async (ritualId: number) => {
    if (!userId) return;

    try {
      await logRitualMutation.mutateAsync({
        userId,
        ritualId,
        completedAt: new Date(),
      });
      toast.success("Ritual completed! ✨");
      ritualsQuery.refetch();
    } catch (error) {
      toast.error("Failed to log ritual");
    }
  };

  const selectedRitualData = rituals.find((r) => r.id === selectedRitual);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 text-white">
      <CosmicBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
            Sacred Dream Rituals
          </h1>
          <p className="text-xl text-purple-200">
            Deepen your practice with intentional rituals
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value || "all"}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                  selectedCategory === category.value
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-purple-900/30 text-purple-200 hover:bg-purple-800/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Rituals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rituals.map((ritual) => (
            <MysticalCard key={ritual.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-100">
                    {ritual.name}
                  </h3>
                  {ritual.isFavorite && (
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  )}
                </div>

                <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                  {ritual.description}
                </p>

                {ritual.category && (
                  <span className="inline-block px-3 py-1 bg-purple-700/30 rounded-full text-xs text-purple-300 mb-4">
                    {ritual.category}
                  </span>
                )}

                <div className="flex gap-2">
                  <GlowingButton
                    onClick={() => setSelectedRitual(ritual.id)}
                    className="flex-1"
                  >
                    View Details
                  </GlowingButton>
                  <button
                    onClick={() => handleCompleteRitual(ritual.id)}
                    className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </button>
                </div>
              </div>
            </MysticalCard>
          ))}
        </div>

        {rituals.length === 0 && !ritualsQuery.isLoading && (
          <div className="text-center py-12">
            <p className="text-purple-300 text-lg">
              No rituals found in this category
            </p>
          </div>
        )}

        {/* Ritual Detail Modal */}
        {selectedRitualData && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRitual(null)}
          >
            <MysticalCard
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-3xl font-bold text-purple-100 mb-4">
                  {selectedRitualData.name}
                </h2>

                <p className="text-purple-200 mb-6">
                  {selectedRitualData.description}
                </p>

                {selectedRitualData.recommendedMoods &&
                  Array.isArray(selectedRitualData.recommendedMoods) &&
                  selectedRitualData.recommendedMoods.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-purple-100 mb-2">
                        Recommended Moods
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRitualData.recommendedMoods.map((mood) => (
                          <span
                            key={mood}
                            className="px-3 py-1 bg-purple-700/30 rounded-full text-sm text-purple-300"
                          >
                            {mood}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-100 mb-3">
                    Ritual Steps
                  </h3>
                  <ol className="space-y-3">
                    {Array.isArray(selectedRitualData.steps) &&
                      selectedRitualData.steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-purple-200 pt-1">{step}</span>
                        </li>
                      ))}
                  </ol>
                </div>

                <div className="flex gap-3">
                  <GlowingButton
                    onClick={() => {
                      handleCompleteRitual(selectedRitualData.id);
                      setSelectedRitual(null);
                    }}
                    className="flex-1"
                  >
                    Complete Ritual
                  </GlowingButton>
                  <button
                    onClick={() => setSelectedRitual(null)}
                    className="px-6 py-2 bg-purple-900/30 hover:bg-purple-800/40 rounded-lg transition-colors text-purple-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </MysticalCard>
          </div>
        )}
      </div>
    </div>
  );
}
