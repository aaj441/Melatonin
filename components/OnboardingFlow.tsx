import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { MysticalCard } from './MysticalCard';
import { GlowingButton } from './GlowingButton';
import { Moon, Sparkles, Clock, Palette, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingFlowProps {
  userId: number;
  onComplete: () => void;
}

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

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const trpc = useTRPC();
  const [step, setStep] = useState(0);
  const [interpretationStyle, setInterpretationStyle] = useState<string>('mixed');
  const [preferredRituals, setPreferredRituals] = useState<string[]>([]);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepGoalHours, setSleepGoalHours] = useState(8);
  const [selectedTheme, setSelectedTheme] = useState('cosmic');
  
  const updatePreferences = useMutation(trpc.updateUserPreferences.mutationOptions());

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = async () => {
    try {
      await updatePreferences.mutateAsync({
        userId,
        interpretationStyle: interpretationStyle as any,
        preferredRituals,
        preferredWakeTime: wakeTime,
        sleepGoalHours,
        selectedThemeId: selectedTheme,
      });
      toast.success('Welcome to your dream journey! ✨');
      onComplete();
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };
  
  const handleSkip = () => {
    toast.success('You can set preferences anytime in settings');
    onComplete();
  };
  
  const toggleRitual = (category: string) => {
    setPreferredRituals(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-cosmic-darker/95 backdrop-blur-sm flex items-center justify-center p-4">
      <MysticalCard glow className="max-w-2xl w-full">
        <div className="p-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-12 rounded-full transition-all ${
                    i === step
                      ? 'bg-ethereal-purple'
                      : i < step
                      ? 'bg-cosmic-indigo'
                      : 'bg-cosmic-navy'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-cosmic-purple hover:text-ethereal-purple transition-colors"
            >
              Skip
            </button>
          </div>
          
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="relative">
                <Moon size={80} className="mx-auto text-ethereal-purple animate-float" />
                <div className="absolute inset-0 mx-auto w-20 h-20 bg-ethereal-purple/20 rounded-full blur-xl animate-pulse" />
              </div>
              <div>
                <h2 className="text-4xl font-mystical text-ethereal-purple mb-3">
                  Welcome to Melatonin
                </h2>
                <p className="text-ethereal-silver text-lg leading-relaxed">
                  Your personal dream journal and ritual engine
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <p className="text-cosmic-purple leading-relaxed">
                  Let's personalize your experience in just a few steps. This will help us provide better dream insights and ritual recommendations tailored to you.
                </p>
              </div>
            </div>
          )}
          
          {/* Step 1: Interpretation Style */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <Sparkles size={56} className="mx-auto text-ethereal-purple mb-4" />
                  <div className="absolute inset-0 bg-ethereal-purple/20 rounded-full blur-lg animate-pulse" />
                </div>
                <h2 className="text-3xl font-mystical text-ethereal-purple mb-3">
                  Choose Your Interpretation Style
                </h2>
                <p className="text-cosmic-purple max-w-md mx-auto">
                  How would you like your dreams to be analyzed?
                </p>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {interpretationStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setInterpretationStyle(style.value)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      interpretationStyle === style.value
                        ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow scale-[1.02]'
                        : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple hover:scale-[1.01]'
                    }`}
                  >
                    <div className="font-medium text-ethereal-purple mb-2 text-lg">
                      {style.label}
                    </div>
                    <div className="text-sm text-ethereal-silver/80 leading-relaxed">
                      {style.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Preferred Rituals */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <Sparkles size={56} className="mx-auto text-ethereal-purple mb-4" />
                  <div className="absolute inset-0 bg-ethereal-purple/20 rounded-full blur-lg animate-pulse" />
                </div>
                <h2 className="text-3xl font-mystical text-ethereal-purple mb-3">
                  Select Your Ritual Interests
                </h2>
                <p className="text-cosmic-purple max-w-md mx-auto">
                  Choose the types of rituals you'd like to explore
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {ritualCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleRitual(category)}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      preferredRituals.includes(category)
                        ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow scale-[1.02]'
                        : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple hover:scale-[1.01]'
                    }`}
                  >
                    <div className="font-medium text-ethereal-purple text-lg">
                      {category}
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-cosmic-purple text-center mt-4">
                Selected {preferredRituals.length} of {ritualCategories.length} • You can change these anytime
              </p>
            </div>
          )}
          
          {/* Step 3: Sleep Schedule */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <Clock size={56} className="mx-auto text-ethereal-purple mb-4" />
                  <div className="absolute inset-0 bg-ethereal-purple/20 rounded-full blur-lg animate-pulse" />
                </div>
                <h2 className="text-3xl font-mystical text-ethereal-purple mb-3">
                  Set Your Sleep Schedule
                </h2>
                <p className="text-cosmic-purple max-w-md mx-auto">
                  Help us optimize ritual timing for you
                </p>
              </div>
              
              <div className="space-y-6 max-w-md mx-auto">
                <div className="p-5 rounded-xl bg-cosmic-navy/30 border border-cosmic-purple/30">
                  <label className="block text-sm font-medium text-ethereal-silver mb-3">
                    Preferred Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                  />
                </div>
                
                <div className="p-5 rounded-xl bg-cosmic-navy/30 border border-cosmic-purple/30">
                  <label className="block text-sm font-medium text-ethereal-silver mb-3">
                    Sleep Goal: <span className="text-ethereal-purple text-lg">{sleepGoalHours}</span> hours
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="10"
                    value={sleepGoalHours}
                    onChange={(e) => setSleepGoalHours(Number(e.target.value))}
                    className="w-full h-3 bg-cosmic-navy/50 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6B21A8 0%, #6B21A8 ${((sleepGoalHours - 6) / 4) * 100}%, #16213E ${((sleepGoalHours - 6) / 4) * 100}%, #16213E 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-cosmic-purple mt-2">
                    <span>6 hours</span>
                    <span>10 hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Theme Selection */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <Palette size={56} className="mx-auto text-ethereal-purple mb-4" />
                  <div className="absolute inset-0 bg-ethereal-purple/20 rounded-full blur-lg animate-pulse" />
                </div>
                <h2 className="text-3xl font-mystical text-ethereal-purple mb-3">
                  Choose Your Theme
                </h2>
                <p className="text-cosmic-purple max-w-md mx-auto">
                  Select a visual style that resonates with you
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow scale-[1.02]'
                        : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple hover:scale-[1.01]'
                    }`}
                  >
                    <div className="font-medium text-ethereal-purple mb-2 text-lg">
                      {theme.name}
                    </div>
                    <div className="text-xs text-ethereal-silver/70">
                      {theme.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-cosmic-purple/20">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                step === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30'
              }`}
            >
              <ChevronLeft size={18} />
              Back
            </button>
            
            <GlowingButton
              onClick={handleNext}
              disabled={updatePreferences.isPending}
              className="flex items-center gap-2"
            >
              {step === 4 ? (
                updatePreferences.isPending ? 'Saving...' : 'Complete'
              ) : (
                <>
                  Next
                  <ChevronRight size={18} />
                </>
              )}
            </GlowingButton>
          </div>
        </div>
      </MysticalCard>
    </div>
  );
}
