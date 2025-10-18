import { 
  Moon, 
  Sparkles, 
  Flame, 
  Eye, 
  Heart, 
  Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const archetypeIcons: Record<string, LucideIcon> = {
  'Shadow': Moon,
  'Anima/Animus': Heart,
  'Hero': Flame,
  'Wise Old Man': Eye,
  'Great Mother': Sparkles,
  'Trickster': Zap,
};

interface ArchetypeIconProps {
  archetypeName: string;
  size?: number;
  className?: string;
}

export function ArchetypeIcon({ archetypeName, size = 24, className = '' }: ArchetypeIconProps) {
  const Icon = archetypeIcons[archetypeName] || Sparkles;
  
  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-cosmic-indigo/30 p-2 ${className}`}>
      <Icon size={size} className="text-ethereal-purple" />
    </div>
  );
}
