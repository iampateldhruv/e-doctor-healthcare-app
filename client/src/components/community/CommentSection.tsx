import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Comment, User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface CommentSectionProps {
  blogId: string;
  currentUser?: User;
}

const CommentSection = ({ blogId, currentUser }: CommentSectionProps) => {
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/blogs/${blogId}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${blogId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: number }) => {
      if (!currentUser) throw new Error("You must be logged in to comment");
      
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: data.content,
          parentId: data.parentId
        }),
      });
      
      if (!response.ok) throw new Error("Failed to post comment");
      return response.json();
    },
    onSuccess: () => {
      setCommentContent("");
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: [`/api/blogs/${blogId}/comments`] });
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error("Failed to like comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blogs/${blogId}/comments`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    commentMutation.mutate({
      content: commentContent,
      parentId: replyingTo || undefined
    });
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
  };

  const handleLike = (commentId: number) => {
    likeMutation.mutate(commentId);
  };

  // Organize comments into parent comments and replies
  const organizedComments = comments?.reduce((acc: Record<string, Comment[]>, comment) => {
    if (!comment.parentId) {
      if (!acc.parents) acc.parents = [];
      acc.parents.push(comment);
    } else {
      if (!acc[`replies-${comment.parentId}`]) acc[`replies-${comment.parentId}`] = [];
      acc[`replies-${comment.parentId}`].push(comment);
    }
    return acc;
  }, {}) || {};

  const parentComments = organizedComments.parents || [];
  
  if (isLoading) {
    return (
      <section className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Comments</h3>
        
        <div className="mb-8 bg-gray-50 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-end">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="mt-3 flex space-x-4">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Comments ({comments?.length || 0})
      </h3>
      
      {/* Comment Form */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Leave a Comment</h4>
        <form onSubmit={handleSubmitComment}>
          <div className="mb-4">
            <Textarea 
              rows={4} 
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" 
              placeholder="Share your thoughts..." 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
              disabled={!commentContent.trim() || commentMutation.isPending}
            >
              Post Comment
            </Button>
          </div>
        </form>
      </div>
      
      {/* Comment List */}
      <div className="space-y-6">
        {parentComments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start">
              <img 
                className="h-10 w-10 rounded-full mr-3" 
                src={comment.user?.profileImage || "https://via.placeholder.com/40"} 
                alt={comment.user?.fullName || "Commenter"} 
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <h5 className="font-medium text-gray-900">{comment.user?.fullName}</h5>
                    {comment.user?.role === 'doctor' && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full">Doctor</Badge>
                    )}
                    {comment.user?.id === parseInt(blogId) && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full">Author</Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
                <div className="mt-3 flex space-x-4 text-sm">
                  <button 
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => handleLike(comment.id)}
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" /> {comment.likes}
                  </button>
                  <button 
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => handleReply(comment.id)}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" /> Reply
                  </button>
                </div>
                
                {/* Display Reply Form for this comment */}
                {replyingTo === comment.id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <Textarea 
                      className="w-full text-sm border-gray-300 rounded-md"
                      placeholder={`Reply to ${comment.user?.fullName}...`}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSubmitComment}
                        disabled={!commentContent.trim() || commentMutation.isPending}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Display Replies for this comment */}
                {organizedComments[`replies-${comment.id}`] && (
                  <div className="mt-4 space-y-4">
                    {organizedComments[`replies-${comment.id}`].map((reply: Comment) => (
                      <div key={reply.id} className="ml-6 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <img 
                            className="h-8 w-8 rounded-full mr-3" 
                            src={reply.user?.profileImage || "https://via.placeholder.com/32"} 
                            alt={reply.user?.fullName || "Commenter"} 
                          />
                          <div>
                            <div className="flex items-center mb-1">
                              <h5 className="font-medium text-gray-900">{reply.user?.fullName}</h5>
                              {reply.user?.role === 'doctor' && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full">Doctor</Badge>
                              )}
                              {reply.user?.id === parseInt(blogId) && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full">Author</Badge>
                              )}
                            </div>
                            <p className="text-gray-700">{reply.content}</p>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <button 
                                className="flex items-center text-gray-500 hover:text-gray-700"
                                onClick={() => handleLike(reply.id)}
                              >
                                <ThumbsUp className="mr-1 h-4 w-4" /> {reply.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {parentComments.length > 5 && (
          <div className="text-center mt-6">
            <Button variant="outline" className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Load More Comments
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
