import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  subtotal: number;
  discount: number | null;
  tax: number | null;
  shipping_cost: number | null;
  total: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: CustomerOrderItem[];
}

export interface CustomerOrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  total: number;
  size: string | null;
  color: string | null;
}

export const useCustomerOrders = () => {
  return useQuery({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return [];
      const res = await api.get('/orders/my-orders');
      return (res.data?.data || res.data) as CustomerOrder[];
    },
  });
};
