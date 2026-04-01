import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface CreateReviewParams {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
}

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, orderId, rating, title, comment }: CreateReviewParams) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('You must be logged in to submit a review');
      }

      const res = await api.post('/reviews', {
        productId,
        orderId: orderId || null,
        rating,
        title: title || null,
        comment: comment || null,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
