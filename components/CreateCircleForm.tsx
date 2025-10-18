import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { GlowingButton } from './GlowingButton';
import { MysticalCard } from './MysticalCard';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface CircleFormData {
  name: string;
}

interface CreateCircleFormProps {
  userId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCircleForm({ userId, onSuccess, onCancel }: CreateCircleFormProps) {
  const trpc = useTRPC();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CircleFormData>();
  
  const createCircle = useMutation(trpc.createDreamCircle.mutationOptions());
  
  const onSubmit = async (data: CircleFormData) => {
    try {
      await createCircle.mutateAsync({
        userId,
        name: data.name,
      });
      
      toast.success('Dream circle created!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create circle');
    }
  };
  
  return (
    <MysticalCard glow>
      <div className="flex items-center gap-3 mb-6">
        <Users size={24} className="text-ethereal-purple" />
        <h3 className="text-xl font-mystical text-ethereal-purple">Create Dream Circle</h3>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="circleName" className="block text-sm font-medium text-ethereal-silver mb-2">
            Circle Name
          </label>
          <input
            id="circleName"
            type="text"
            {...register('name', { 
              required: 'Circle name is required',
              minLength: { value: 1, message: 'Name must be at least 1 character' },
              maxLength: { value: 100, message: 'Name must be less than 100 characters' }
            })}
            className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
            placeholder="e.g., Morning Dreamers, Family Circle, Study Group..."
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>
        
        <p className="text-sm text-ethereal-silver/70">
          Create a private space to share and interpret dreams with trusted friends, family, or study groups.
        </p>
        
        <div className="flex gap-3">
          <GlowingButton
            type="submit"
            disabled={createCircle.isPending}
            className="flex-1"
          >
            {createCircle.isPending ? 'Creating...' : 'Create Circle'}
          </GlowingButton>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-cosmic-purple/30 text-cosmic-purple hover:border-cosmic-purple hover:text-ethereal-purple transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </MysticalCard>
  );
}
