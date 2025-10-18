import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { GlowingButton } from './GlowingButton';
import { MysticalCard } from './MysticalCard';
import { X, Users, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  dreamId: number;
  dreamTitle: string;
  userId: number;
}

export function ShareDreamModal({ isOpen, onClose, dreamId, dreamTitle, userId }: ShareDreamModalProps) {
  const trpc = useTRPC();
  const [selectedCircles, setSelectedCircles] = useState<number[]>([]);
  
  const circles = useQuery(
    trpc.getUserCircles.queryOptions(
      { userId },
      { enabled: isOpen }
    )
  );
  
  const shareDream = useMutation(trpc.shareDreamToCircle.mutationOptions());
  
  const handleShare = async () => {
    if (selectedCircles.length === 0) {
      toast.error('Please select at least one circle');
      return;
    }
    
    try {
      const promises = selectedCircles.map(circleId =>
        shareDream.mutateAsync({
          userId,
          dreamId,
          circleId,
        })
      );
      
      await Promise.all(promises);
      toast.success(`Dream shared to ${selectedCircles.length} circle${selectedCircles.length > 1 ? 's' : ''}!`);
      setSelectedCircles([]);
      onClose();
    } catch (error: any) {
      if (error?.message?.includes('already shared')) {
        toast.error('Dream already shared to one or more selected circles');
      } else {
        toast.error('Failed to share dream');
      }
    }
  };
  
  const toggleCircle = (circleId: number) => {
    setSelectedCircles(prev =>
      prev.includes(circleId)
        ? prev.filter(id => id !== circleId)
        : [...prev, circleId]
    );
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-cosmic-darker/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md">
          <MysticalCard glow>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Share2 size={24} className="text-ethereal-purple" />
                <Dialog.Title className="text-xl font-mystical text-ethereal-purple">
                  Share Dream
                </Dialog.Title>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-cosmic-navy/50 transition-colors"
              >
                <X size={20} className="text-cosmic-purple" />
              </button>
            </div>
            
            <p className="text-sm text-ethereal-silver/80 mb-4">
              "{dreamTitle}"
            </p>
            
            {circles.data?.circles.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-cosmic-purple mb-3 opacity-50" />
                <p className="text-ethereal-silver/70 text-sm">
                  You're not in any circles yet
                </p>
                <p className="text-cosmic-purple text-xs mt-2">
                  Create or join a circle to share dreams
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                  {circles.data?.circles.map(circle => (
                    <label
                      key={circle.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-cosmic-navy/30 border border-cosmic-purple/20 hover:border-cosmic-purple/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCircles.includes(circle.id)}
                        onChange={() => toggleCircle(circle.id)}
                        className="w-4 h-4 rounded border-cosmic-purple/30 bg-cosmic-navy/50 text-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-ethereal-purple" />
                          <span className="text-sm font-medium text-ethereal-silver">
                            {circle.name}
                          </span>
                        </div>
                        <p className="text-xs text-cosmic-purple mt-0.5">
                          {circle.memberCount} members • {circle.dreamCount} dreams
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <GlowingButton
                    onClick={handleShare}
                    disabled={shareDream.isPending || selectedCircles.length === 0}
                    className="flex-1"
                  >
                    {shareDream.isPending ? 'Sharing...' : `Share to ${selectedCircles.length || ''} Circle${selectedCircles.length !== 1 ? 's' : ''}`}
                  </GlowingButton>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-cosmic-purple/30 text-cosmic-purple hover:border-cosmic-purple hover:text-ethereal-purple transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </MysticalCard>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
