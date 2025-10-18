import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/store/userStore';
import { CosmicBackground } from '~/components/CosmicBackground';
import { MysticalCard } from '~/components/MysticalCard';
import { GlowingButton } from '~/components/GlowingButton';
import { ExportModal } from '~/components/ExportModal';
import { Settings, Moon, Palette, Clock, Sparkles, Bell, Download, ChevronLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import toast from 'react-hot-toast';

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
});

const interpretationStyles = [
  { value: 'jungian', label: 'Jungian Psychology', description: 'Focus on archetypes and the collective unconscious' },
  { value: 'spiritual', label: 'Spiritual', description: 'Emphasize mystical and spiritual meanings' },
  { value: 'psychological', label: 'Psychological', description: 'Modern psychological interpretations' },
  { value: 'cultural', label: 'Multi-Cultural', description: 'Draw from diverse cultural traditions' },
  { value: 'mixed', label: 'Mixed Approach', description: 'Blend all perspectives for rich insights' },
];

const ritualCategories = ['Preparation', 'Capture', 'Lunar', 'Integration', 'Circle'];

const themes = [
  { id: 'cosmic', name: 'Cosmic Night', description: 'Deep purples and cosmic blues' },
  { id: 'lunar', name: 'Lunar Silver', description: 'Silver moonlight and gentle grays' },
  { id: 'sunset', name: 'Sunset Dreams', description: 'Warm oranges and pinks' },
  { id: 'forest', name: 'Forest Mystique', description: 'Deep greens and earthy tones' },
];

function SettingsPage() {
  const trpc = useTRPC();
  const { userId } = useUserStore();
  const [showExportModal, setShowExportModal] = useState(false);
  
  const preferencesQuery = useQuery(
    trpc.getUserPreferences.queryOptions(
      { userId: userId! },
      { enabled: !!userId }
    )
  );
  
  const remindersQuery = useQuery(
    trpc.getActiveReminders.queryOptions(
      { userId: userId! },
      { enabled: !!userId }
    )
  );
  
  const updatePreferences = useMutation(trpc.updateUserPreferences.mutationOptions());
  
  const [interpretationStyle, setInterpretationStyle] = useState<string>('mixed');
  const [preferredRituals, setPreferredRituals] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('cosmic');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepGoalHours, setSleepGoalHours] = useState(8);
  
  // Initialize state from query data
  useEffect(() => {
    if (preferencesQuery.data) {
      setInterpretationStyle(preferencesQuery.data.interpretationStyle);
      setPreferredRituals(preferencesQuery.data.preferredRituals);
      setSelectedTheme(preferencesQuery.data.selectedThemeId);
      setWakeTime(preferencesQuery.data.preferredWakeTime || '07:00');
      setSleepGoalHours(preferencesQuery.data.sleepGoalHours);
    }
  }, [preferencesQuery.data]);
  
  const handleSavePreferences = async () => {
    if (!userId) return;
    
    try {
      await updatePreferences.mutateAsync({
        userId,
        interpretationStyle: interpretationStyle as any,
        preferredRituals,
        selectedThemeId: selectedTheme,
        preferredWakeTime: wakeTime,
        sleepGoalHours,
      });
      toast.success('Preferences saved!');
      preferencesQuery.refetch();
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };
  
  const toggleRitual = (category: string) => {
    setPreferredRituals(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ethereal-silver">Please log in to access settings</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cosmic-purple/30 bg-cosmic-darker/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-cosmic-purple hover:text-ethereal-purple transition-colors"
              >
                <ChevronLeft size={24} />
              </Link>
              <Settings size={32} className="text-ethereal-purple" />
              <h1 className="text-2xl font-mystical text-ethereal-purple">Settings</h1>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Interpretation Style */}
          <MysticalCard>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="text-ethereal-purple" />
              <h2 className="text-xl font-mystical text-ethereal-purple">
                Dream Interpretation Style
              </h2>
            </div>
            <p className="text-sm text-cosmic-purple mb-4">
              Choose how you'd like your dreams to be analyzed by AI
            </p>
            
            <div className="space-y-3">
              {interpretationStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setInterpretationStyle(style.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    interpretationStyle === style.value
                      ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow'
                      : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple'
                  }`}
                >
                  <div className="font-medium text-ethereal-purple mb-1">
                    {style.label}
                  </div>
                  <div className="text-sm text-ethereal-silver/70">
                    {style.description}
                  </div>
                </button>
              ))}
            </div>
          </MysticalCard>
          
          {/* Preferred Rituals */}
          <MysticalCard>
            <div className="flex items-center gap-3 mb-4">
              <Moon size={24} className="text-ethereal-purple" />
              <h2 className="text-xl font-mystical text-ethereal-purple">
                Preferred Ritual Categories
              </h2>
            </div>
            <p className="text-sm text-cosmic-purple mb-4">
              Select the types of rituals you're most interested in
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ritualCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleRitual(category)}
                  className={`p-4 rounded-lg border transition-all ${
                    preferredRituals.includes(category)
                      ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow'
                      : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple'
                  }`}
                >
                  <div className="font-medium text-ethereal-purple">
                    {category}
                  </div>
                </button>
              ))}
            </div>
          </MysticalCard>
          
          {/* Sleep Schedule */}
          <MysticalCard>
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} className="text-ethereal-purple" />
              <h2 className="text-xl font-mystical text-ethereal-purple">
                Sleep Schedule
              </h2>
            </div>
            <p className="text-sm text-cosmic-purple mb-4">
              Help us optimize ritual timing and reminders
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ethereal-silver mb-2">
                  Preferred Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ethereal-silver mb-2">
                  Sleep Goal: {sleepGoalHours} hours
                </label>
                <input
                  type="range"
                  min="6"
                  max="10"
                  value={sleepGoalHours}
                  onChange={(e) => setSleepGoalHours(Number(e.target.value))}
                  className="w-full h-2 bg-cosmic-navy/50 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6B21A8 0%, #6B21A8 ${((sleepGoalHours - 6) / 4) * 100}%, #16213E ${((sleepGoalHours - 6) / 4) * 100}%, #16213E 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-cosmic-purple mt-1">
                  <span>6h</span>
                  <span>10h</span>
                </div>
              </div>
            </div>
          </MysticalCard>
          
          {/* Visual Theme */}
          <MysticalCard>
            <div className="flex items-center gap-3 mb-4">
              <Palette size={24} className="text-ethereal-purple" />
              <h2 className="text-xl font-mystical text-ethereal-purple">
                Visual Theme
              </h2>
            </div>
            <p className="text-sm text-cosmic-purple mb-4">
              Choose a visual style that resonates with you
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedTheme === theme.id
                      ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow'
                      : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple'
                  }`}
                >
                  <div className="font-medium text-ethereal-purple mb-1">
                    {theme.name}
                  </div>
                  <div className="text-xs text-ethereal-silver/70">
                    {theme.description}
                  </div>
                </button>
              ))}
            </div>
          </MysticalCard>
          
          {/* Active Reminders */}
          <MysticalCard>
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} className="text-ethereal-purple" />
              <h2 className="text-xl font-mystical text-ethereal-purple">
                Active Ritual Reminders
              </h2>
            </div>
            
            {remindersQuery.data?.reminders.length === 0 ? (
              <p className="text-sm text-cosmic-purple">
                No active reminders. Schedule a ritual to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {remindersQuery.data?.reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-4 bg-cosmic-navy/30 border border-cosmic-purple/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-ethereal-purple mb-1">
                          {reminder.ritual.name}
                        </h3>
                        <p className="text-sm text-cosmic-purple">
                          {new Date(reminder.scheduledTime).toLocaleString()}
                        </p>
                        {reminder.frequency && reminder.frequency !== 'once' && (
                          <p className="text-xs text-ethereal-silver/60 mt-1 capitalize">
                            Repeats: {reminder.frequency}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MysticalCard>
          
          {/* Export Data */}
          <MysticalCard>
            <div className="flex items-center gap-3 mb-4">
              <Download size={24} className="text-ethereal-purple" />
              <h2 className="text-xl font-mystical text-ethereal-purple">
                Export Your Data
              </h2>
            </div>
            <p className="text-sm text-cosmic-purple mb-4">
              Download your dreams, rituals, and achievements
            </p>
            
            <GlowingButton
              onClick={() => setShowExportModal(true)}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Download size={18} className="mr-2" />
              Export Data
            </GlowingButton>
          </MysticalCard>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <GlowingButton
              onClick={handleSavePreferences}
              disabled={updatePreferences.isPending}
              className="px-8"
            >
              {updatePreferences.isPending ? 'Saving...' : 'Save All Preferences'}
            </GlowingButton>
          </div>
        </main>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          userId={userId}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
