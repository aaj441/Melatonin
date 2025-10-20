import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/store/userStore';
import { CosmicBackground } from '~/components/CosmicBackground';
import { GlowingButton } from '~/components/GlowingButton';
import { MysticalCard } from '~/components/MysticalCard';
import { DreamEntryForm } from '~/components/DreamEntryForm';
import { DreamCard } from '~/components/DreamCard';
import { ArchetypeIcon } from '~/components/ArchetypeIcon';
import { CreateCircleForm } from '~/components/CreateCircleForm';
import { CircleView } from '~/components/CircleView';
import { ProgressDashboard } from '~/components/ProgressDashboard';
import { OnboardingFlow } from '~/components/OnboardingFlow';
import { ExportModal } from '~/components/ExportModal';
import { NotificationBell } from '~/components/NotificationBell';
import { BookOpen, Sparkles, TrendingUp, Users, Moon, Search, Trophy, ShoppingBag, Flame, Download, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export const Route = createFileRoute("/")({
  component: Home,
});

type Tab = 'journal' | 'new-dream' | 'encyclopedia' | 'patterns' | 'circles' | 'progress';

function Home() {
  const trpc = useTRPC();
  const { userId, username, setUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedLens, setSelectedLens] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Queries
  const getOrCreateUser = useQuery(
    trpc.getOrCreateUser.queryOptions(
      { username: usernameInput },
      { enabled: false }
    )
  );
  
  const dreams = useQuery(
    trpc.getDreams.queryOptions(
      { userId: userId! },
      { enabled: !!userId }
    )
  );
  
  const archetypes = useQuery(trpc.getArchetypes.queryOptions());
  const culturalLenses = useQuery(trpc.getCulturalLenses.queryOptions());
  const patterns = useQuery(
    trpc.getPatterns.queryOptions(
      { userId: userId! },
      { enabled: !!userId }
    )
  );
  
  const circles = useQuery(
    trpc.getUserCircles.queryOptions(
      { userId: userId! },
      { enabled: !!userId }
    )
  );
  
  const userProfileQuery = useQuery(
    trpc.getUserPreferences.queryOptions(
      { userId: userId! },
      { enabled: !!userId }
    )
  );
  
  const detectPatternsMutation = useMutation(trpc.detectPatterns.mutationOptions());
  const joinCircleByInviteMutation = useMutation(trpc.joinCircleByInvite.mutationOptions());
  
  // Check if user needs onboarding
  useEffect(() => {
    if (userId && userProfileQuery.data) {
      // Show onboarding if user has default preferences (new user)
      const needsOnboarding = 
        userProfileQuery.data.interpretationStyle === 'mixed' &&
        userProfileQuery.data.preferredRituals.length === 0 &&
        !userProfileQuery.data.preferredWakeTime;
      
      if (needsOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [userId, userProfileQuery.data]);
  
  const handleLogin = async () => {
    if (!usernameInput) {
      toast.error('Please enter a username');
      return;
    }
    
    const result = await getOrCreateUser.refetch();
    if (result.data) {
      setUser(result.data.userId, result.data.username);
      toast.success(`Welcome, ${result.data.username}!`);
    }
  };
  
  const handleDetectPatterns = async () => {
    if (!userId) return;
    
    try {
      toast.loading('Analyzing your dreams for patterns...');
      await detectPatternsMutation.mutateAsync({ userId });
      await patterns.refetch();
      toast.success('Patterns detected!');
    } catch (error) {
      toast.error('Failed to detect patterns');
    }
  };
  
  const handleJoinCircle = async () => {
    if (!userId || !joinInviteCode) {
      toast.error('Please enter an invite code');
      return;
    }
    
    try {
      const result = await joinCircleByInviteMutation.mutateAsync({
        userId,
        inviteCode: joinInviteCode.toUpperCase().trim(),
      });
      await circles.refetch();
      setJoinInviteCode('');
      toast.success(`Joined ${result.circleName}!`);
    } catch (error: any) {
      if (error?.message?.includes('Invalid')) {
        toast.error('Invalid invitation code');
      } else if (error?.message?.includes('expired')) {
        toast.error('This invitation has expired');
      } else if (error?.message?.includes('already a member')) {
        toast.error('You are already a member of this circle');
      } else {
        toast.error('Failed to join circle');
      }
    }
  };
  
  // Login screen
  if (!userId) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CosmicBackground />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <MysticalCard glow className="max-w-md w-full text-center animate-scale-in">
            <div className="mb-6">
              <Moon size={64} className="mx-auto text-ethereal-purple animate-float-smooth" />
            </div>
            
            <h1 className="text-4xl font-mystical text-ethereal-purple mb-2 animate-fade-in-up">
              Dream Journal
            </h1>
            <p className="text-ethereal-silver/70 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0 }}>
              A mystical sanctuary for your subconscious
            </p>
            
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your name to begin..."
                className="w-full glass border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus-glow transition-all duration-300 ease-smooth-out"
              />
              
              <GlowingButton onClick={handleLogin} className="w-full">
                Enter the Dreamscape
              </GlowingButton>
            </div>
            
            <p className="text-xs text-cosmic-purple mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
              Drawing from Jungian archetypes, indigenous wisdom, and the collective unconscious
            </p>
          </MysticalCard>
        </div>
      </div>
    );
  }
  
  // Main application
  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cosmic-purple/30 glass sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={32} className="text-ethereal-purple" />
              <div>
                <h1 className="text-2xl font-mystical text-ethereal-purple">Dream Journal</h1>
                <p className="text-sm text-cosmic-purple">Welcome, {username}</p>
              </div>
            </div>
            
            <nav className="flex gap-2 items-center">
              {[
                { id: 'journal' as Tab, icon: BookOpen, label: 'Journal' },
                { id: 'new-dream' as Tab, icon: Moon, label: 'New Dream' },
                { id: 'progress' as Tab, icon: Trophy, label: 'Progress' },
                { id: 'encyclopedia' as Tab, icon: Sparkles, label: 'Encyclopedia' },
                { id: 'patterns' as Tab, icon: TrendingUp, label: 'Patterns' },
                { id: 'circles' as Tab, icon: Users, label: 'Circles' },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ease-smooth-out ${
                      activeTab === tab.id
                        ? 'bg-cosmic-indigo/30 text-ethereal-purple shadow-glow'
                        : 'text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
              
              <div className="h-6 w-px bg-cosmic-purple/30 mx-2" />
              
              {/* Notification Bell */}
              <NotificationBell userId={userId} />
              
              <Link
                to="/interpret"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30"
              >
                <Sparkles size={18} />
                <span className="hidden sm:inline">Interpret</span>
              </Link>

              <Link
                to="/rituals"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30"
              >
                <Flame size={18} />
                <span className="hidden sm:inline">Rituals</span>
              </Link>
              
              <Link
                to="/marketplace"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30"
              >
                <ShoppingBag size={18} />
                <span className="hidden sm:inline">Marketplace</span>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </nav>
          </div>
        </header>
        
        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'new-dream' && (
            <div className="animate-scale-in">
              <DreamEntryForm
                userId={userId}
                onSuccess={() => {
                  dreams.refetch();
                  setActiveTab('journal');
                }}
              />
            </div>
          )}
          
          {activeTab === 'journal' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-mystical text-ethereal-purple">Your Dreams</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cosmic-navy/30 hover:bg-cosmic-navy/50 rounded-lg transition-colors text-cosmic-purple hover:text-ethereal-purple border border-cosmic-purple/30"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <GlowingButton onClick={() => setActiveTab('new-dream')}>
                    Record New Dream
                  </GlowingButton>
                </div>
              </div>
              
              {dreams.data?.dreams.length === 0 ? (
                <MysticalCard className="text-center py-12 animate-scale-in">
                  <Moon size={48} className="mx-auto text-cosmic-purple mb-4 opacity-50 animate-pulse-glow" />
                  <p className="text-ethereal-silver/70">No dreams recorded yet</p>
                  <p className="text-cosmic-purple text-sm mt-2">Begin your journey into the unconscious</p>
                </MysticalCard>
              ) : (
                <div className="grid gap-6">
                  {dreams.data?.dreams.map((dream, index) => (
                    <div key={dream.id} className={`animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 8)}`} style={{ animationFillMode: 'forwards' }}>
                      <DreamCard dream={dream} userId={userId} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'encyclopedia' && (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h2 className="text-3xl font-mystical text-ethereal-purple mb-4">Symbol Encyclopedia</h2>
                <p className="text-ethereal-silver/70 mb-6">
                  Explore universal archetypes and their meanings across cultures
                </p>
                
                {/* Cultural Lens Filter */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setSelectedLens('all')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedLens === 'all'
                        ? 'bg-cosmic-indigo/30 text-ethereal-purple border border-cosmic-indigo'
                        : 'bg-cosmic-navy/30 text-cosmic-purple border border-cosmic-purple/30 hover:border-cosmic-purple'
                    }`}
                  >
                    All Traditions
                  </button>
                  {culturalLenses.data?.lenses.map((lens) => (
                    <button
                      key={lens.id}
                      onClick={() => setSelectedLens(lens.tradition)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedLens === lens.tradition
                          ? 'bg-cosmic-indigo/30 text-ethereal-purple border border-cosmic-indigo'
                          : 'bg-cosmic-navy/30 text-cosmic-purple border border-cosmic-purple/30 hover:border-cosmic-purple'
                      }`}
                    >
                      {lens.tradition}
                    </button>
                  ))}
                </div>
                
                {/* Search */}
                <div className="relative mb-6">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmic-purple" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search archetypes..."
                    className="w-full glass border border-cosmic-purple/30 rounded-lg pl-12 pr-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus-glow transition-all duration-300 ease-smooth-out"
                  />
                </div>
              </div>
              
              {/* Archetypes Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archetypes.data?.archetypes
                  .filter(a => 
                    searchQuery === '' || 
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((archetype, index) => (
                    <MysticalCard key={archetype.id} className={`hover:scale-105 transition-all duration-300 ease-smooth-out animate-fade-in-up opacity-0 stagger-${Math.min(index % 8 + 1, 8)}`} style={{ animationFillMode: 'forwards' }}>
                      <div className="flex items-start gap-4">
                        <ArchetypeIcon archetypeName={archetype.name} size={24} />
                        <div className="flex-1">
                          <h3 className="text-lg font-mystical text-ethereal-purple mb-1">
                            {archetype.name}
                          </h3>
                          {archetype.jungianType && (
                            <p className="text-xs text-ethereal-gold mb-2">{archetype.jungianType}</p>
                          )}
                          <p className="text-sm text-ethereal-silver/80 mb-3">
                            {archetype.description}
                          </p>
                          
                          {/* Cultural Variants */}
                          {(selectedLens === 'all' || 
                            (archetype.culturalVariants as any)[selectedLens.toLowerCase()]) && (
                            <div className="mt-3 pt-3 border-t border-cosmic-purple/20">
                              <p className="text-xs text-cosmic-purple font-semibold mb-2">
                                Cultural Perspectives:
                              </p>
                              {selectedLens === 'all' ? (
                                <div className="space-y-1 text-xs text-ethereal-silver/70">
                                  {Object.entries(archetype.culturalVariants as Record<string, string>).map(([culture, meaning]) => (
                                    <div key={culture}>
                                      <span className="text-ethereal-gold capitalize">{culture}:</span> {meaning}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-ethereal-silver/70">
                                  {(archetype.culturalVariants as any)[selectedLens.toLowerCase()]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </MysticalCard>
                  ))}
              </div>
            </div>
          )}
          
          {activeTab === 'patterns' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-mystical text-ethereal-purple mb-2">Dream Patterns</h2>
                  <p className="text-ethereal-silver/70">
                    Recurring themes and archetypal motifs in your dreams
                  </p>
                </div>
                <GlowingButton
                  onClick={handleDetectPatterns}
                  disabled={detectPatternsMutation.isPending || (dreams.data?.dreams.length || 0) < 2}
                >
                  {detectPatternsMutation.isPending ? 'Analyzing...' : 'Detect Patterns'}
                </GlowingButton>
              </div>
              
              {patterns.data?.patterns.length === 0 ? (
                <MysticalCard className="text-center py-12 animate-scale-in">
                  <TrendingUp size={48} className="mx-auto text-cosmic-purple mb-4 opacity-50 animate-pulse-glow" />
                  <p className="text-ethereal-silver/70">No patterns detected yet</p>
                  <p className="text-cosmic-purple text-sm mt-2">
                    Record at least 2 dreams and click "Detect Patterns"
                  </p>
                </MysticalCard>
              ) : (
                <div className="grid gap-6">
                  {patterns.data?.patterns.map((pattern, index) => (
                    <MysticalCard key={pattern.id} glow className={`animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 8)}`} style={{ animationFillMode: 'forwards' }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-mystical text-ethereal-purple mb-1">
                            {pattern.name}
                          </h3>
                          <p className="text-sm text-ethereal-gold">
                            Appears in {pattern.frequency} dream{pattern.frequency > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Sparkles size={24} className="text-ethereal-purple animate-pulse" />
                      </div>
                      
                      <p className="text-ethereal-silver/90 mb-4">
                        {pattern.interpretation}
                      </p>
                      
                      {pattern.symbols.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pattern.symbols.map((ps) => (
                            <div
                              key={ps.id}
                              className="flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-indigo/20 border border-cosmic-purple/30"
                            >
                              {ps.symbol.archetype && (
                                <ArchetypeIcon archetypeName={ps.symbol.archetype.name} size={14} />
                              )}
                              <span className="text-sm text-ethereal-purple">{ps.symbol.symbolText}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </MysticalCard>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'circles' && (
            <div className="animate-fade-in-up">
              {selectedCircleId && circles.data ? (
                <CircleView
                  circleId={selectedCircleId}
                  circleName={circles.data.circles.find(c => c.id === selectedCircleId)?.name || ''}
                  userId={userId}
                  onBack={() => setSelectedCircleId(null)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-mystical text-ethereal-purple mb-2">Dream Circles</h2>
                      <p className="text-ethereal-silver/70">
                        Share and interpret dreams with your community
                      </p>
                    </div>
                    <GlowingButton onClick={() => setShowCreateCircle(!showCreateCircle)}>
                      {showCreateCircle ? 'Cancel' : 'Create Circle'}
                    </GlowingButton>
                  </div>
                  
                  {showCreateCircle && (
                    <CreateCircleForm
                      userId={userId}
                      onSuccess={() => {
                        setShowCreateCircle(false);
                        circles.refetch();
                      }}
                      onCancel={() => setShowCreateCircle(false)}
                    />
                  )}
                  
                  {/* Join Circle */}
                  <MysticalCard>
                    <h3 className="text-lg font-mystical text-ethereal-purple mb-4">Join a Circle</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={joinInviteCode}
                        onChange={(e) => setJoinInviteCode(e.target.value)}
                        placeholder="Enter invite code..."
                        className="flex-1 bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20 uppercase"
                        maxLength={16}
                      />
                      <GlowingButton
                        onClick={handleJoinCircle}
                        disabled={joinCircleByInviteMutation.isPending || !joinInviteCode}
                        variant="secondary"
                      >
                        {joinCircleByInviteMutation.isPending ? 'Joining...' : 'Join'}
                      </GlowingButton>
                    </div>
                    <p className="text-xs text-cosmic-purple mt-2">
                      Ask a circle member for their invite code to join
                    </p>
                  </MysticalCard>
                  
                  {/* My Circles */}
                  <div>
                    <h3 className="text-xl font-mystical text-ethereal-purple mb-4">Your Circles</h3>
                    
                    {circles.data?.circles.length === 0 ? (
                    <MysticalCard className="text-center py-12 animate-scale-in">
                        <Users size={64} className="mx-auto text-cosmic-purple mb-4 opacity-50 animate-pulse-glow" />
                        <p className="text-ethereal-silver/70 mb-2">You're not in any circles yet</p>
                        <p className="text-cosmic-purple text-sm">
                          Create a circle or join one to start sharing dreams
                        </p>
                      </MysticalCard>
                    ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                    {circles.data?.circles.map((circle, index) => (
                          <MysticalCard
                          key={circle.id}
                          className={`hover:scale-105 transition-all duration-300 ease-smooth-out cursor-pointer animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 8)}`}
                              style={{ animationFillMode: 'forwards' }}
                            onClick={() => setSelectedCircleId(circle.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users size={20} className="text-ethereal-purple" />
                                <h4 className="text-lg font-mystical text-ethereal-purple">
                                  {circle.name}
                                </h4>
                              </div>
                              {circle.role === 'elder' && (
                                <span className="px-2 py-1 rounded-full bg-ethereal-gold/20 border border-ethereal-gold/30 text-xs text-ethereal-gold">
                                  Elder
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-cosmic-purple">
                              <span>{circle.memberCount} members</span>
                              <span>•</span>
                              <span>{circle.dreamCount} dreams</span>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-cosmic-purple/20">
                              <p className="text-xs text-ethereal-silver/60">
                                Circle ID: {circle.id}
                              </p>
                            </div>
                          </MysticalCard>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h2 className="text-3xl font-mystical text-ethereal-purple mb-2">Your Progress</h2>
                <p className="text-ethereal-silver/70">
                  Track your journey through streaks, achievements, and quests
                </p>
              </div>
              
              <ProgressDashboard userId={userId} />
            </div>
          )}
        </main>
      </div>
      
      {/* Onboarding Flow */}
      {showOnboarding && userId && (
        <OnboardingFlow
          userId={userId}
          onComplete={() => {
            setShowOnboarding(false);
            userProfileQuery.refetch();
          }}
        />
      )}
      
      {/* Export Modal */}
      {showExportModal && userId && (
        <ExportModal
          userId={userId}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
