import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  stock: number;
  rating: number | null;
  reviews_count: number | null;
  is_flash_deal: boolean;
  is_trending: boolean;
  discount_percent: number;
  sizes: string[];
  colors: string[];
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string };
  product_images?: ProductImage[];
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return (res.data?.data || res.data) as Product[];
    },
  });
};

export const useFlashDeals = () => {
  return useQuery({
    queryKey: ['flash-deals'],
    queryFn: async () => {
      const res = await api.get('/products/flash-deals');
      return (res.data?.data || res.data) as Product[];
    },
  });
};

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const res = await api.get('/products/trending');
      return (res.data?.data || res.data) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return (res.data?.data || res.data) as Product;
    },
    enabled: !!id,
  });
};

export const useProductImages = (productId: string) => {
  return useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      const res = await api.get(`/products/${productId}`);
      const product = (res.data?.data || res.data) as Product;
      return (product.product_images || []) as ProductImage[];
    },
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'subcategory' | 'product_images'>) => {
      const res = await api.post('/products', data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['flash-deals'] });
      queryClient.invalidateQueries({ queryKey: ['trending-products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'subcategory' | 'product_images'>>) => {
      const res = await api.put(`/products/${id}`, data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['flash-deals'] });
      queryClient.invalidateQueries({ queryKey: ['trending-products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['flash-deals'] });
      queryClient.invalidateQueries({ queryKey: ['trending-products'] });
    },
  });
};

export const useAddProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, imageUrl, sortOrder }: { productId: string; imageUrl: string; sortOrder: number }) => {
      const res = await api.post(`/products/${productId}/images`, { imageUrl, sortOrder });
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data?.url || res.data?.url || '';
};

export const uploadCategoryImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/categories/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data?.url || res.data?.url || '';
};
