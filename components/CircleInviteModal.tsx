import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { GlowingButton } from './GlowingButton';
import { MysticalCard } from './MysticalCard';
import { X, Link, Copy, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface CircleInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: number;
  circleName: string;
  userId: number;
}

export function CircleInviteModal({ isOpen, onClose, circleId, circleName, userId }: CircleInviteModalProps) {
  const trpc = useTRPC();
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [useMaxUses, setUseMaxUses] = useState(false);

  const invites = useQuery(
    trpc.getCircleInvites.queryOptions(
      { userId, circleId },
      { enabled: isOpen }
    )
  );
  
  const createInvite = useMutation(trpc.createCircleInvite.mutationOptions());

  const handleCreateInvite = async () => {
    try {
      const result = await createInvite.mutateAsync({
        userId,
        circleId,
        expiresInDays,
        maxUses: useMaxUses ? maxUses : undefined,
      });
      
      toast.success('Invitation created!');
      invites.refetch();
      
      // Copy to clipboard
      navigator.clipboard.writeText(result.inviteCode);
      toast.success('Invite code copied to clipboard!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create invitation');
    }
  };
  
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied!');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-cosmic-darker/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg">
          <MysticalCard glow>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link size={24} className="text-ethereal-purple" />
                <Dialog.Title className="text-xl font-mystical text-ethereal-purple">
                  Circle Invitations
                </Dialog.Title>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-cosmic-navy/50 transition-colors"
              >
                <X size={20} className="text-cosmic-purple" />
              </button>
            </div>
            
            <p className="text-sm text-ethereal-silver/80 mb-6">
              Share {circleName} with others
            </p>
            
            {/* Create New Invite */}
            <div className="mb-6 p-4 rounded-lg bg-cosmic-navy/30 border border-cosmic-purple/20">
              <h3 className="text-sm font-medium text-ethereal-purple mb-4">Create New Invitation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-ethereal-silver mb-2">
                    Expires in {expiresInDays} days
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="w-full h-2 bg-cosmic-navy/50 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-cosmic-purple mt-1">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-xs text-ethereal-silver mb-2">
                    <input
                      type="checkbox"
                      checked={useMaxUses}
                      onChange={(e) => setUseMaxUses(e.target.checked)}
                      className="rounded border-cosmic-purple/30 bg-cosmic-navy/50 text-cosmic-indigo focus:ring-cosmic-indigo/20"
                    />
                    Limit number of uses
                  </label>
                  {useMaxUses && (
                    <input
                      type="number"
                      min="1"
                      value={maxUses || 1}
                      onChange={(e) => setMaxUses(Number(e.target.value))}
                      className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-3 py-2 text-sm text-ethereal-silver focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                      placeholder="Max uses"
                    />
                  )}
                </div>
                
                <GlowingButton
                  onClick={handleCreateInvite}
                  disabled={createInvite.isPending}
                  className="w-full"
                >
                  {createInvite.isPending ? 'Creating...' : 'Generate Invite Code'}
                </GlowingButton>
              </div>
            </div>
            
            {/* Active Invites */}
            <div>
              <h3 className="text-sm font-medium text-ethereal-purple mb-3">Active Invitations</h3>
              
              {invites.data?.invites.length === 0 ? (
                <p className="text-sm text-cosmic-purple text-center py-4">
                  No active invitations
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {invites.data?.invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="p-3 rounded-lg bg-cosmic-navy/30 border border-cosmic-purple/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-ethereal-purple bg-cosmic-indigo/20 px-2 py-1 rounded">
                          {invite.code}
                        </code>
                        <button
                          onClick={() => copyInviteCode(invite.code)}
                          className="p-1.5 rounded hover:bg-cosmic-indigo/20 transition-colors"
                          title="Copy code"
                        >
                          <Copy size={14} className="text-cosmic-purple" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-cosmic-purple">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                        {invite.maxUses && (
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {invite.currentUses}/{invite.maxUses} uses
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-ethereal-silver/60 mt-1">
                        Created by {invite.createdBy.username}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </MysticalCard>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
