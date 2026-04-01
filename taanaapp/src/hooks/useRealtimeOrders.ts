import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Realtime orders — Supabase realtime removed.
// Using polling via refetchInterval on admin-orders query instead.
export const useRealtimeOrders = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Poll every 30 seconds for new orders
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);
};

export const useRealtimeReviews = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Poll every 30 seconds for new reviews
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);
};
