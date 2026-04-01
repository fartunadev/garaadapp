import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await api.get(`/reviews/product/${productId}`);
      return (res.data?.data || res.data) as Review[];
    },
    enabled: !!productId,
  });
};
