import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { MysticalCard } from './MysticalCard';
import { DreamCard } from './DreamCard';
import { CircleInviteModal } from './CircleInviteModal';
import { GlowingButton } from './GlowingButton';
import { Users, Crown, User, ArrowLeft, Calendar, MessageCircle, Send, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface CircleViewProps {
  circleId: number;
  circleName: string;
  userId: number;
  onBack: () => void;
}

export function CircleView({ circleId, circleName, userId, onBack }: CircleViewProps) {
  const trpc = useTRPC();
  
  const [activeTab, setActiveTab] = useState<'dreams' | 'discussions' | 'members'>('dreams');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [commentContent, setCommentContent] = useState<Record<number, string>>({});
  
  const members = useQuery(
    trpc.getCircleMembers.queryOptions({ userId, circleId })
  );
  
  const dreams = useQuery(
    trpc.getCircleDreams.queryOptions({ userId, circleId })
  );
  
  const discussions = useQuery(
    trpc.getCirclePosts.queryOptions({ userId, circleId })
  );
  
  const createPost = useMutation(trpc.createCirclePost.mutationOptions());
  const addComment = useMutation(trpc.addCirclePostComment.mutationOptions());
  
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter post content');
      return;
    }
    
    try {
      await createPost.mutateAsync({
        userId,
        circleId,
        content: newPostContent,
        title: newPostTitle || undefined,
      });
      
      toast.success('Discussion post created!');
      setNewPostContent('');
      setNewPostTitle('');
      discussions.refetch();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };
  
  const handleAddComment = async (postId: number) => {
    const content = commentContent[postId];
    if (!content?.trim()) return;
    
    try {
      await addComment.mutateAsync({
        userId,
        postId,
        content,
      });
      
      toast.success('Comment added!');
      setCommentContent({ ...commentContent, [postId]: '' });
      discussions.refetch();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-cosmic-navy/30 border border-cosmic-purple/30 hover:border-cosmic-purple hover:bg-cosmic-navy/50 transition-colors"
        >
          <ArrowLeft size={20} className="text-ethereal-purple" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-mystical text-ethereal-purple">{circleName}</h2>
          <p className="text-sm text-cosmic-purple mt-1">
            {members.data?.members.length || 0} members • {dreams.data?.dreams.length || 0} shared dreams
          </p>
        </div>
        <GlowingButton
          onClick={() => setShowInviteModal(true)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Invite</span>
        </GlowingButton>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-cosmic-purple/20">
        {[
          { id: 'dreams' as const, label: 'Shared Dreams', icon: Calendar },
          { id: 'discussions' as const, label: 'Discussions', icon: MessageCircle },
          { id: 'members' as const, label: 'Members', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cosmic-indigo text-ethereal-purple'
                  : 'border-transparent text-cosmic-purple hover:text-ethereal-purple'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Create New Post */}
          <MysticalCard>
            <h3 className="text-lg font-mystical text-ethereal-purple mb-4">Start a Discussion</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-2 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
              />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts, questions, or insights..."
                rows={3}
                className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
              />
              <GlowingButton
                onClick={handleCreatePost}
                disabled={createPost.isPending || !newPostContent.trim()}
                className="flex items-center gap-2"
              >
                <Send size={18} />
                {createPost.isPending ? 'Posting...' : 'Post'}
              </GlowingButton>
            </div>
          </MysticalCard>
          
          {/* Discussion Posts */}
          {discussions.data?.posts.length === 0 ? (
            <MysticalCard className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-cosmic-purple mb-4 opacity-50" />
              <p className="text-ethereal-silver/70">No discussions yet</p>
              <p className="text-cosmic-purple text-sm mt-2">
                Start a conversation with your circle
              </p>
            </MysticalCard>
          ) : (
            <div className="space-y-4">
              {discussions.data?.posts.map((post) => (
                <MysticalCard key={post.id}>
                  <div className="flex items-start gap-3 mb-3">
                    <User size={16} className="text-cosmic-purple mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ethereal-purple">{post.user.username}</span>
                        <span className="text-xs text-cosmic-purple">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {post.title && (
                        <h4 className="text-lg font-mystical text-ethereal-purple mt-1">{post.title}</h4>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-ethereal-silver/90 mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 mb-3 pl-4 border-l-2 border-cosmic-purple/20">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <span className="font-medium text-cosmic-purple">{comment.user.username}:</span>
                          <span className="text-ethereal-silver/80 ml-2">{comment.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentContent[post.id] || ''}
                      onChange={(e) => setCommentContent({ ...commentContent, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-3 py-2 text-sm text-ethereal-silver placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={addComment.isPending || !commentContent[post.id]?.trim()}
                      className="px-3 py-2 rounded-lg bg-cosmic-indigo/30 hover:bg-cosmic-indigo/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} className="text-ethereal-purple" />
                    </button>
                  </div>
                </MysticalCard>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Members Tab */}
      {activeTab === 'members' && (
        <MysticalCard>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-ethereal-purple" />
            <h3 className="text-lg font-mystical text-ethereal-purple">Circle Members</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {members.data?.members.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-cosmic-indigo/20 border border-cosmic-purple/30"
              >
                {member.role === 'elder' ? (
                  <Crown size={14} className="text-ethereal-gold" />
                ) : member.role === 'mentor' ? (
                  <Users size={14} className="text-ethereal-purple" />
                ) : (
                  <User size={14} className="text-cosmic-purple" />
                )}
                <span className="text-sm text-ethereal-silver">{member.user.username}</span>
                {member.role !== 'member' && (
                  <span className="text-xs text-ethereal-gold capitalize">({member.role})</span>
                )}
              </div>
            ))}
          </div>
        </MysticalCard>
      )}
      
      {/* Shared Dreams Tab */}
      {activeTab === 'dreams' && (
        <div>
          <h3 className="text-xl font-mystical text-ethereal-purple mb-4">Shared Dreams</h3>
          
          {dreams.data?.dreams.length === 0 ? (
            <MysticalCard className="text-center py-12">
              <Calendar size={48} className="mx-auto text-cosmic-purple mb-4 opacity-50" />
              <p className="text-ethereal-silver/70">No dreams shared yet</p>
              <p className="text-cosmic-purple text-sm mt-2">
                Share your dreams with the circle to start the conversation
              </p>
            </MysticalCard>
          ) : (
            <div className="grid gap-6">
              {dreams.data?.dreams.map((dream) => (
                <div key={dream.id}>
                  <div className="flex items-center gap-2 mb-2 text-sm text-cosmic-purple">
                    <User size={14} />
                    <span>{dream.user.username}</span>
                    <span>•</span>
                    <span>Shared {new Date(dream.sharedAt).toLocaleDateString()}</span>
                  </div>
                  <DreamCard dream={dream} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Invite Modal */}
      {showInviteModal && (
        <CircleInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          circleId={circleId}
          circleName={circleName}
          userId={userId}
        />
      )}
    </div>
  );
}
