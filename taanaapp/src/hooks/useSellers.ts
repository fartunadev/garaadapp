import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  commission_rate: number | null;
  total_sales: number | null;
  total_products: number | null;
  rating: number | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useSellers = () => {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const res = await api.get('/sellers');
      return (res.data?.data || res.data) as Seller[];
    },
  });
};

export const useCurrentSeller = () => {
  return useQuery({
    queryKey: ['current-seller'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      try {
        const res = await api.get('/sellers/me');
        return (res.data?.data || res.data) as Seller;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
};

export const useSellerOrders = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-orders', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const res = await api.get('/orders', { params: { sellerId } });
      return (res.data?.data || res.data) as any[];
    },
    enabled: !!sellerId,
  });
};

export const useSellerProducts = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-products', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const res = await api.get('/products', { params: { sellerId } });
      return (res.data?.data || res.data) as any[];
    },
    enabled: !!sellerId,
  });
};

export const useSellerPayouts = (_sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-payouts', _sellerId],
    queryFn: async () => {
      // For sellers the backend returns only their payouts based on the auth token.
      // _sellerId is used only to enable the query when seller context is known.
      const res = await api.get('/payouts');
      return (res.data?.data || res.data) as any[];
    },
    enabled: !!_sellerId,
  });
};
