import { MysticalCard } from './MysticalCard';
import { ArchetypeIcon } from './ArchetypeIcon';
import { Calendar, Sparkles, Volume2, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { ShareDreamModal } from './ShareDreamModal';

interface DreamCardProps {
  dream: {
    id: number;
    title: string;
    content: string;
    recordedAt: Date;
    mood?: string | null;
    energy?: number | null;
    voiceUrl?: string | null;
    symbols: Array<{
      id: number;
      symbolText: string;
      archetype?: {
        name: string;
        jungianType: string | null;
      } | null;
    }>;
    insights: Array<{
      id: number;
      content: string;
      culturalLens: string | null;
    }>;
  };
  userId?: number;
  onSelect?: () => void;
}

export function DreamCard({ dream, userId, onSelect }: DreamCardProps) {
  const [showInsights, setShowInsights] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dream.voiceUrl) {
      const audio = new Audio(dream.voiceUrl);
      setIsPlayingAudio(true);
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
    }
  };
  
  return (
    <>
      <MysticalCard onClick={onSelect} className="hover:scale-[1.01] transition-all duration-300 ease-smooth-out">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-mystical text-ethereal-purple mb-2 truncate">
                {dream.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-cosmic-purple">
                <span className="flex items-center gap-1.5 transition-colors hover:text-ethereal-purple">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {new Date(dream.recordedAt).toLocaleDateString()}
                  </span>
                </span>
                {dream.mood && (
                  <>
                    <span className="text-cosmic-purple/50">•</span>
                    <span className="capitalize">{dream.mood}</span>
                  </>
                )}
                {dream.energy && (
                  <>
                    <span className="text-cosmic-purple/50">•</span>
                    <span>Energy: {dream.energy}/10</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {dream.voiceUrl && (
                <button
                  onClick={handlePlayAudio}
                  className={`p-2.5 rounded-full bg-cosmic-indigo/30 hover:bg-cosmic-indigo/50 transition-all duration-300 ease-smooth-out hover:scale-110 active:scale-95 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                  title="Play audio recording"
                >
                  <Volume2 size={18} className="text-ethereal-purple" />
                </button>
              )}
              {userId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className="p-2.5 rounded-full bg-cosmic-indigo/30 hover:bg-cosmic-indigo/50 transition-all duration-300 ease-smooth-out hover:scale-110 active:scale-95"
                  title="Share to circle"
                >
                  <Share2 size={18} className="text-ethereal-purple" />
                </button>
              )}
            </div>
          </div>
          
          {/* Content Preview */}
          <p className="text-ethereal-silver/80 leading-relaxed line-clamp-3 transition-colors hover:text-ethereal-silver">
            {dream.content}
          </p>
          
          {/* Symbols */}
          {dream.symbols.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dream.symbols.slice(0, 5).map((symbol, index) => (
                <div
                  key={symbol.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cosmic-indigo/20 border border-cosmic-purple/30 transition-all duration-300 ease-smooth-out hover:bg-cosmic-indigo/30 hover:border-cosmic-indigo/50 hover:scale-105 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {symbol.archetype && (
                    <ArchetypeIcon archetypeName={symbol.archetype.name} size={16} />
                  )}
                  <span className="text-sm text-ethereal-purple font-medium">{symbol.symbolText}</span>
                </div>
              ))}
              {dream.symbols.length > 5 && (
                <span className="text-sm text-cosmic-purple flex items-center px-2 animate-fade-in-up opacity-0" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
                  +{dream.symbols.length - 5} more
                </span>
              )}
            </div>
          )}
          
          {/* Insights Toggle */}
          {dream.insights.length > 0 && (
            <div className="pt-2 border-t border-cosmic-purple/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInsights(!showInsights);
                }}
                className="flex items-center gap-2 text-sm font-medium text-ethereal-purple hover:text-ethereal-gold transition-all duration-300 ease-smooth-out group"
              >
                <Sparkles size={16} className="transition-transform duration-300 group-hover:rotate-12" />
                <span>{showInsights ? 'Hide' : 'Show'} {dream.insights.length} Insight{dream.insights.length > 1 ? 's' : ''}</span>
                {showInsights ? (
                  <ChevronUp size={16} className="transition-transform duration-300" />
                ) : (
                  <ChevronDown size={16} className="transition-transform duration-300" />
                )}
              </button>
              
              {showInsights && (
                <div className="mt-4 space-y-3 animate-fade-in-up">
                  {dream.insights.slice(0, 3).map((insight, index) => (
                    <div
                      key={insight.id}
                      className="p-4 rounded-lg glass border border-cosmic-purple/20 hover:border-cosmic-purple/40 transition-all duration-300 ease-smooth-out animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      {insight.culturalLens && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ethereal-gold/30 to-transparent" />
                          <span className="text-xs text-ethereal-gold font-semibold uppercase tracking-wider">
                            {insight.culturalLens}
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ethereal-gold/30 to-transparent" />
                        </div>
                      )}
                      <p className="text-sm text-ethereal-silver/90 leading-relaxed">{insight.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </MysticalCard>
      
      {userId && (
        <ShareDreamModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          dreamId={dream.id}
          dreamTitle={dream.title}
          userId={userId}
        />
      )}
    </>
  );
}
