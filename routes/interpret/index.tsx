import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { MysticalCard } from "~/components/MysticalCard";
import { GlowingButton } from "~/components/GlowingButton";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/interpret/")({
  component: InterpretPage,
});

function getPreferredLocale(): string {
  if (typeof navigator !== 'undefined') {
    const browserLocale = (navigator.languages && navigator.languages[0]) || navigator.language;
    if (browserLocale) return browserLocale;
  }
  return 'en-US';
}

function extractJsonFromText(text: unknown): any | null {
  if (typeof text !== 'string') return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  try { return JSON.parse(candidate); } catch {}
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(candidate.slice(start, end + 1)); } catch {}
  }
  return null;
}

function InterpretPage() {
  const trpc = useTRPC();
  const [dreamText, setDreamText] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const locale = useMemo(() => getPreferredLocale(), []);

  const interpretMutation = useMutation(trpc.interpretDream.mutationOptions());

  useEffect(() => {
    if (result) {
      setIsAnimating(true);
      const id = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(id);
    }
  }, [result]);

  const interpret = useCallback(async () => {
    if (!dreamText.trim()) return;
    try {
      const { interpretation } = await interpretMutation.mutateAsync({ content: dreamText, locale });
      setResult(interpretation);
    } catch (err: any) {
      // Some providers may return text; attempt salvage parse if available
      const parsed = extractJsonFromText(err?.message || "");
      if (parsed) {
        setResult(parsed);
      }
    }
  }, [dreamText, locale, interpretMutation]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      interpret();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-mystical text-ethereal-purple mb-2">Dream Interpreter</h1>
          <p className="text-cosmic-purple">Share your dream, discover its meaning ✨</p>
        </div>

        <MysticalCard glow>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-ethereal-silver">Tell me about your dream...</label>
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={8}
              placeholder="Describe your dream in as much detail as you can remember..."
              className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
            />
            <GlowingButton onClick={interpret} disabled={interpretMutation.isPending || !dreamText.trim()} className="w-full flex items-center justify-center gap-2">
              {interpretMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Interpreting your dream...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Interpret Dream
                </>
              )}
            </GlowingButton>
          </div>
        </MysticalCard>

        {result && (
          <div className={`mt-8 space-y-6 ${isAnimating ? 'animate-fade-in-up' : ''}`}>
            <MysticalCard>
              <h2 className="text-xl font-mystical text-ethereal-purple mb-3">Main Themes</h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(result.mainThemes) && result.mainThemes.map((t: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-cosmic-indigo/20 border border-cosmic-purple/30 text-ethereal-purple text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </MysticalCard>

            <MysticalCard>
              <h2 className="text-xl font-mystical text-ethereal-purple mb-3">Emotional Atmosphere</h2>
              <p className="text-ethereal-silver/90">{result?.emotionalTone || ''}</p>
            </MysticalCard>

            <MysticalCard>
              <h2 className="text-xl font-mystical text-ethereal-purple mb-3">Dream Symbols</h2>
              <div className="space-y-3">
                {Array.isArray(result?.symbols) && result.symbols.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg glass border border-cosmic-purple/20">
                    <div className="text-ethereal-gold font-semibold">{s.symbol}</div>
                    <div className="text-ethereal-silver/90">{s.meaning}</div>
                  </div>
                ))}
              </div>
            </MysticalCard>

            <MysticalCard>
              <h2 className="text-xl font-mystical text-ethereal-purple mb-3">Personal Insight</h2>
              <p className="text-ethereal-silver/90 leading-relaxed">{result?.personalInsight || ''}</p>
            </MysticalCard>

            <MysticalCard>
              <h2 className="text-xl font-mystical text-ethereal-purple mb-3">Guidance for Reflection</h2>
              <p className="text-ethereal-silver/90">{result?.guidance || ''}</p>
            </MysticalCard>
          </div>
        )}
      </div>
    </div>
  );
}
