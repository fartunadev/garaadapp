import { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useCreateReview } from '@/hooks/useCreateReview';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  product?: { name: string; image_url: string | null };
  profile?: { full_name: string | null; avatar_url: string | null };
}

const Reviews = () => {
  const { user } = useAuth();
  const { data: products } = useProducts();
  const createReview = useCreateReview();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  // Fetch approved reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews');
      return (res.data?.data || res.data || []) as Review[];
    },
  });

  const handleSubmitReview = async () => {
    if (!selectedProduct) {
      toast({
        title: 'Select a product',
        description: 'Please select a product to review',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReview.mutateAsync({
        productId: selectedProduct,
        rating,
        title: title || undefined,
        comment: comment || undefined,
      });

      toast({
        title: 'Review submitted!',
        description: 'Your review is pending approval and will be visible soon.',
      });

      setDialogOpen(false);
      setSelectedProduct('');
      setRating(5);
      setTitle('');
      setComment('');
    } catch (error: any) {
      toast({
        title: 'Failed to submit review',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Customer Reviews</h1>
            <p className="text-muted-foreground mt-1">See what our customers are saying</p>
          </div>
          
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Star className="w-4 h-4" />
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Product</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Review Title</label>
                    <Input
                      placeholder="Summarize your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Review</label>
                    <Textarea
                      placeholder="Share your thoughts about this product..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitReview} 
                    className="w-full"
                    disabled={createReview.isPending}
                  >
                    {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  {review.product?.image_url && (
                    <img 
                      src={review.product.image_url} 
                      alt={review.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {review.product?.name || 'Unknown Product'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.is_verified && (
                    <span className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full whitespace-nowrap">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                
                {review.title && (
                  <h3 className="font-semibold text-foreground mb-2">{review.title}</h3>
                )}
                
                {review.comment && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {review.comment}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{review.profile?.full_name || 'Anonymous'}</span>
                  <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h2>
            <p className="text-muted-foreground mb-6">Be the first to share your experience!</p>
            {user ? (
              <Button onClick={() => setDialogOpen(true)}>Write the First Review</Button>
            ) : (
              <Button asChild>
                <a href="/auth">Sign in to Write a Review</a>
              </Button>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Reviews;
