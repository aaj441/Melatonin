import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { GlowingButton } from './GlowingButton';
import { MysticalCard } from './MysticalCard';
import { QuickRitualScheduler } from './QuickRitualScheduler';
import { Mic, Moon, Sun, CloudRain, Zap, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface DreamFormData {
  title: string;
  content: string;
  mood?: string;
  energy?: number;
}

interface DreamEntryFormProps {
  userId: number;
  onSuccess?: () => void;
}

const moods = [
  { name: 'Peaceful', icon: Moon, color: 'text-blue-400' },
  { name: 'Joyful', icon: Sun, color: 'text-yellow-400' },
  { name: 'Mysterious', icon: CloudRain, color: 'text-purple-400' },
  { name: 'Intense', icon: Zap, color: 'text-red-400' },
  { name: 'Loving', icon: Heart, color: 'text-pink-400' },
];

export function DreamEntryForm({ userId, onSuccess }: DreamEntryFormProps) {
  const trpc = useTRPC();
  const [selectedMood, setSelectedMood] = useState<string>();
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedVoiceUrl, setUploadedVoiceUrl] = useState<string>();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showQuickRitual, setShowQuickRitual] = useState(false);
  const [lastDreamData, setLastDreamData] = useState<{ mood?: string; energy?: number } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DreamFormData>();
  
  const getMinioBaseUrl = useQuery(trpc.getMinioBaseUrl.queryOptions());
  const getPresignedUrl = useMutation(trpc.getPresignedUploadUrl.mutationOptions());
  const createDream = useMutation(trpc.createDream.mutationOptions());
  const analyzeDream = useMutation(trpc.analyzeDreamSymbols.mutationOptions());
  const transcribeAudioMutation = useMutation(trpc.transcribeAudio.mutationOptions());
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };
  
  const transcribeRecording = async (voiceUrl: string) => {
    if (!voiceUrl) return;
    
    try {
      setIsTranscribing(true);
      toast.loading('Transcribing audio...');
      
      const result = await transcribeAudioMutation.mutateAsync({ voiceUrl });
      setTranscribedText(result.text);
      
      toast.dismiss();
      toast.success('Audio transcribed! Check the content field.');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const uploadAudio = async () => {
    if (!audioBlob) return null;
    
    const fileName = `dream-${Date.now()}.webm`;
    const presignedData = await getPresignedUrl.mutateAsync({
      fileName,
      contentType: 'audio/webm',
    });
    
    await fetch(presignedData.uploadUrl, {
      method: 'PUT',
      body: audioBlob,
      headers: { 'Content-Type': 'audio/webm' },
    });
    
    const voiceUrl = `${getMinioBaseUrl.data?.minioBaseUrl}/${presignedData.bucketName}/${presignedData.objectName}`;
    setUploadedVoiceUrl(voiceUrl);
    
    // Automatically transcribe the audio
    await transcribeRecording(voiceUrl);
    
    return voiceUrl;
  };
  
  const onSubmit = async (data: DreamFormData) => {
    try {
      let voiceUrl = uploadedVoiceUrl;
      
      if (audioBlob && !uploadedVoiceUrl) {
        toast.loading('Uploading voice recording...');
        voiceUrl = await uploadAudio() || undefined;
        toast.dismiss();
      }
      
      // Use transcribed text if content is empty and we have a transcription
      const finalContent = data.content || transcribedText;
      
      if (!finalContent) {
        toast.error('Please provide dream content');
        return;
      }
      
      const result = await createDream.mutateAsync({
        userId,
        title: data.title,
        content: finalContent,
        mood: selectedMood,
        energy: energyLevel,
        voiceUrl,
        recordedAt: new Date(),
      });
      
      toast.success('Dream saved! Analyzing symbols...');
      
      // Store dream data for quick ritual
      setLastDreamData({ mood: selectedMood, energy: energyLevel });
      
      // Analyze dream symbols with AI
      await analyzeDream.mutateAsync({
        dreamId: result.dreamId,
        content: finalContent,
      });
      
      toast.success('Dream analyzed! Check your insights.');
      
      // Show quick ritual scheduler
      setShowQuickRitual(true);
      
      reset();
      setSelectedMood(undefined);
      setEnergyLevel(5);
      setAudioBlob(null);
      setUploadedVoiceUrl(undefined);
      setTranscribedText('');
    } catch (error) {
      toast.error('Failed to save dream');
    }
  };
  
  return (
    <>
      <MysticalCard glow className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-mystical text-ethereal-purple mb-6">Record Your Dream</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ethereal-silver mb-2">
              Dream Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
              placeholder="A mystical journey through..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>
          
          {/* Voice Recording */}
          <div className="p-4 rounded-xl bg-cosmic-navy/30 border border-cosmic-purple/30">
            <label className="block text-sm font-medium text-ethereal-silver mb-3">
              Voice Recording (Optional)
            </label>
            
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <GlowingButton
                  type="button"
                  variant={isRecording ? "secondary" : "primary"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`flex items-center gap-2 ${isRecording ? 'animate-pulse' : ''}`}
                >
                  <Mic size={18} className={isRecording ? 'text-red-400' : ''} />
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </GlowingButton>
                
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-red-400 animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    Recording...
                  </div>
                )}
                
                {audioBlob && !isTranscribing && !isRecording && (
                  <div className="flex items-center gap-2 text-sm text-ethereal-purple">
                    <div className="w-2 h-2 rounded-full bg-ethereal-purple" />
                    Recording saved
                  </div>
                )}
                
                {isTranscribing && (
                  <div className="flex items-center gap-2 text-sm text-cosmic-purple animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-cosmic-purple animate-ping" />
                    Transcribing...
                  </div>
                )}
              </div>
              
              {transcribedText && (
                <div className="p-3 bg-cosmic-indigo/10 border border-cosmic-indigo/30 rounded-lg animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-cosmic-purple font-medium">Transcription:</p>
                    <button
                      type="button"
                      onClick={() => {
                        const currentContent = (document.getElementById('content') as HTMLTextAreaElement)?.value || '';
                        (document.getElementById('content') as HTMLTextAreaElement).value = 
                          currentContent ? `${currentContent}\n\n${transcribedText}` : transcribedText;
                        toast.success('Transcription inserted!');
                      }}
                      className="text-xs text-ethereal-purple hover:text-cosmic-indigo transition-colors"
                    >
                      Insert Below
                    </button>
                  </div>
                  <p className="text-sm text-ethereal-silver leading-relaxed">{transcribedText}</p>
                </div>
              )}
              
              <p className="text-xs text-cosmic-purple">
                Record your dream verbally and we'll transcribe it for you
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-ethereal-silver">
                Dream Content
              </label>
            </div>
            <textarea
              id="content"
              {...register('content', { required: !transcribedText })}
              rows={8}
              className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
              placeholder={transcribedText || "Describe your dream in detail... What did you see? How did you feel? What symbols appeared?"}
            />
            {transcribedText && (
              <p className="mt-1 text-xs text-ethereal-purple">
                ✓ Transcription available - content will be auto-filled if left empty
              </p>
            )}
            {errors.content && !transcribedText && (
              <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
            )}
          </div>
          
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-ethereal-silver mb-3">
              Dream Mood (Optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.name}
                    type="button"
                    onClick={() => setSelectedMood(mood.name)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedMood === mood.name
                        ? 'bg-cosmic-indigo/30 border-cosmic-indigo shadow-glow scale-[1.02]'
                        : 'bg-cosmic-navy/30 border-cosmic-purple/30 hover:border-cosmic-purple hover:scale-[1.01]'
                    }`}
                  >
                    <Icon size={18} className={mood.color} />
                    <span className="text-sm font-medium">{mood.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Energy Level */}
          <div className="p-4 rounded-xl bg-cosmic-navy/30 border border-cosmic-purple/30">
            <label className="block text-sm font-medium text-ethereal-silver mb-3">
              Energy Level: <span className="text-ethereal-purple text-lg font-mystical">{energyLevel}</span>/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-3 bg-cosmic-navy/50 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6B21A8 0%, #6B21A8 ${energyLevel * 10}%, #16213E ${energyLevel * 10}%, #16213E 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-cosmic-purple mt-2">
              <span>Low Energy</span>
              <span>High Energy</span>
            </div>
          </div>
          
          {/* Submit */}
          <GlowingButton
            type="submit"
            disabled={createDream.isPending || analyzeDream.isPending}
            className="w-full"
          >
            {createDream.isPending || analyzeDream.isPending ? 'Saving & Analyzing...' : 'Save Dream'}
          </GlowingButton>
        </form>
      </MysticalCard>
      
      {/* Quick Ritual Scheduler */}
      {showQuickRitual && lastDreamData && (
        <QuickRitualScheduler
          userId={userId}
          dreamMood={lastDreamData.mood}
          dreamEnergy={lastDreamData.energy}
          onClose={() => {
            setShowQuickRitual(false);
            setLastDreamData(null);
            onSuccess?.();
          }}
        />
      )}
    </>
  );
}
