import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Users/Profiles
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async (): Promise<Profile[]> => {
      const res = await api.get('/auth/users');
      return (res.data?.data || []) as Profile[];
    },
  });
};

export const useProfilesWithRoles = () => {
  return useQuery({
    queryKey: ['profiles-with-roles'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      const users = res.data?.data || [];
      return users.map((u: any) => ({
        ...u,
        roles: [u.role || 'user'],
      })) as (Profile & { roles: string[] })[];
    },
  });
};

// Sellers
export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  rating: number;
  total_products: number;
  total_sales: number;
  commission_rate: number;
  is_verified: boolean;
  is_active: boolean;
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

export const useUpdateSeller = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Seller> & { id: string }) => {
      const res = await api.put(`/sellers/${id}`, data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};

// Orders with items
export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  seller_id: string | null;
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
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  total: number;
  size: string | null;
  color: string | null;
  created_at: string;
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return (res.data?.data || res.data) as Order[];
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: Partial<Order> & { id: string }) => {
      const res = await api.patch(`/orders/${id}/status`, { status });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Payments
export interface Payment {
  id: string;
  order_id: string;
  user_id: string | null;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<Payment[]> => {
      const res = await api.get('/payments');
      return (res.data?.data || res.data) as Payment[];
    },
  });
};

// Reviews
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
  product?: { id: string; name: string; image_url: string | null };
  profile?: Profile;
}

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews');
      return (res.data?.data || res.data) as Review[];
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_approved }: Partial<Review> & { id: string }) => {
      const endpoint = is_approved ? `/reviews/${id}/approve` : `/reviews/${id}/reject`;
      const res = await api.post(endpoint);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

// Messages — no backend endpoint yet
export interface Message {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  parent_id: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useMessages = () => {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async (): Promise<Message[]> => {
      const res = await api.get('/messages');
      return (res.data?.data || res.data) as Message[];
    },
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/payments/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.put(`/auth/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await api.put(`/auth/users/${id}/status`, { is_active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
    },
  });
};
