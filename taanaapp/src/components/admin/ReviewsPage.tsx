import { Star, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useReviews, useUpdateReview } from '@/hooks/useAdminData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ReviewsPage = () => {
  const { data: reviews, isLoading } = useReviews();
  const updateReview = useUpdateReview();
  const { toast } = useToast();

  const handleApprove = async (id: string) => {
    try {
      await updateReview.mutateAsync({ id, is_approved: true });
      toast({
        title: 'Review approved',
        description: 'The review is now visible to customers.'
      });
    } catch (error) {
      toast({
        title: 'Failed to approve',
        description: 'Could not approve the review.',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateReview.mutateAsync({ id, is_approved: false });
      toast({
        title: 'Review rejected',
        description: 'The review has been rejected.'
      });
    } catch (error) {
      toast({
        title: 'Failed to reject',
        description: 'Could not reject the review.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border">
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="p-4 md:p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Product Reviews ({reviews?.length || 0})</h2>
      </div>
      
      {!reviews || reviews.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>No reviews found</p>
        </div>
      ) : (
        <div className="p-4 md:p-6 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{review.title || 'No title'}</span>
                    {review.is_verified && (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{review.comment || 'No comment'}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{review.product?.name || 'Unknown Product'}</span>
                    <span>•</span>
                    <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.is_approved 
                      ? 'bg-success/10 text-success border border-success/20' 
                      : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                  }`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!review.is_approved && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-success hover:text-success/80"
                    onClick={() => handleApprove(review.id)}
                    disabled={updateReview.isPending}
                  >
                    Approve
                  </Button>
                )}
                {review.is_approved && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleReject(review.id)}
                    disabled={updateReview.isPending}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
