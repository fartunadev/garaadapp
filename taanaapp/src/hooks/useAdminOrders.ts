import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  subtotal: number;
  shipping_cost: number | null;
  tax: number | null;
  discount: number | null;
  total: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItem[];
  customer?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface AdminOrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  total: number;
  size: string | null;
  color: string | null;
}

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return (res.data?.data || res.data) as AdminOrder[];
    },
  });
};

export const useApproveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
      customerEmail?: string | null;
      customerName?: string | null;
      orderNumber?: string;
    }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { paymentStatus });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useCreatePaymentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_order: AdminOrder) => {
      // Payment records are handled server-side
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};
