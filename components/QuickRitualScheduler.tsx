import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { MysticalCard } from './MysticalCard';
import { GlowingButton } from './GlowingButton';
import { Clock, Sparkles, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickRitualSchedulerProps {
  userId: number;
  dreamMood?: string;
  dreamEnergy?: number;
  onClose: () => void;
}

export function QuickRitualScheduler({ userId, dreamMood, dreamEnergy, onClose }: QuickRitualSchedulerProps) {
  const trpc = useTRPC();
  const [selectedRitualId, setSelectedRitualId] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0); // Default to 8 PM tomorrow
    return tomorrow.toISOString().slice(0, 16);
  });
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly'>('once');
  
  const ritualsQuery = useQuery(
    trpc.getRituals.queryOptions({
      userId,
      includePublic: true,
      limit: 5,
    })
  );
  
  const scheduleReminder = useMutation(trpc.scheduleRitualReminder.mutationOptions());
  
  const rituals = ritualsQuery.data?.rituals || [];
  
  // Filter rituals based on dream mood/energy if available
  const recommendedRituals = rituals.filter(ritual => {
    if (!dreamMood && !dreamEnergy) return true;
    
    const recommendedMoods = ritual.recommendedMoods as string[] | null;
    const energyRange = ritual.energyRange as { min: number; max: number } | null;
    
    if (dreamMood && recommendedMoods && recommendedMoods.includes(dreamMood)) {
      return true;
    }
    
    if (dreamEnergy && energyRange) {
      return dreamEnergy >= energyRange.min && dreamEnergy <= energyRange.max;
    }
    
    return true;
  });
  
  const handleSchedule = async () => {
    if (!selectedRitualId) {
      toast.error('Please select a ritual');
      return;
    }
    
    try {
      await scheduleReminder.mutateAsync({
        userId,
        ritualId: selectedRitualId,
        scheduledTime: new Date(scheduledTime),
        frequency,
      });
      
      toast.success('Ritual scheduled! ✨');
      onClose();
    } catch (error) {
      toast.error('Failed to schedule ritual');
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <MysticalCard glow className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-mystical text-ethereal-purple mb-1">
                Schedule a Ritual
              </h2>
              <p className="text-sm text-cosmic-purple">
                Continue your dream work with a ritual practice
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-cosmic-purple hover:text-ethereal-purple transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Recommended Rituals */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-ethereal-silver mb-3">
              {dreamMood || dreamEnergy ? 'Recommended for You' : 'Available Rituals'}
            </h3>
            <div className="space-y-3">
              {recommendedRituals.slice(0, 5).map((ritual) => (
                <button
                  key={ritual.id}
                  onClick={() => setSelectedRitualId(ritual.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedRitualId === ritual.id
                      ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow'
                      : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-ethereal-purple mb-1">
                        {ritual.name}
                      </div>
                      <div className="text-sm text-ethereal-silver/70 line-clamp-2">
                        {ritual.description}
                      </div>
                      {ritual.category && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-cosmic-purple/20 rounded text-xs text-cosmic-purple">
                            {ritual.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <Sparkles
                      size={20}
                      className={`ml-3 flex-shrink-0 ${
                        selectedRitualId === ritual.id
                          ? 'text-ethereal-purple'
                          : 'text-cosmic-purple'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Scheduling Options */}
          {selectedRitualId && (
            <div className="space-y-4 mb-6 p-4 bg-cosmic-navy/30 rounded-lg border border-cosmic-purple/20">
              <div>
                <label className="block text-sm font-medium text-ethereal-silver mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Schedule Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-2 text-ethereal-silver focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ethereal-silver mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Frequency
                </label>
                <div className="flex gap-2">
                  {(['once', 'daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-all capitalize ${
                        frequency === freq
                          ? 'bg-cosmic-indigo/30 border-cosmic-indigo text-ethereal-purple'
                          : 'bg-cosmic-navy/30 border-cosmic-purple/30 text-cosmic-purple hover:border-cosmic-purple'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-cosmic-navy/30 hover:bg-cosmic-navy/50 rounded-lg transition-colors text-cosmic-purple"
            >
              Maybe Later
            </button>
            <GlowingButton
              onClick={handleSchedule}
              disabled={!selectedRitualId || scheduleReminder.isPending}
              className="flex-1"
            >
              {scheduleReminder.isPending ? 'Scheduling...' : 'Schedule Ritual'}
            </GlowingButton>
          </div>
        </div>
      </MysticalCard>
    </div>
  );
}
