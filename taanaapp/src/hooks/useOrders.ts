import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CartItem } from '@/contexts/CartContext';

interface CreateOrderParams {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  paymentMethod?: string;
  notes?: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      const res = await api.post('/orders', {
        items: params.items.map((item) => ({
          productId: typeof item.productId === 'string' ? item.productId : null,
          quantity: item.quantity,
          color: item.color || null,
          size: item.size || null,
        })),
        shippingAddress: params.shippingAddress,
        shippingCity: params.shippingCity,
        shippingCountry: params.shippingCountry,
        shippingPhone: params.shippingPhone,
        paymentMethod: params.paymentMethod || 'Cash on Delivery',
        notes: params.notes,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });
};
