import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return (res.data?.data || res.data) as Category[];
    },
  });
};

export const useSubcategories = (categoryId?: string) => {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      if (categoryId) {
        const res = await api.get(`/categories/${categoryId}/subcategories`);
        return (res.data?.data || res.data) as Subcategory[];
      }
      // Fetch all categories and collect all subcategories, attaching parent category
      const res = await api.get('/categories');
      const categories = (res.data?.data || res.data) as Category[];
      return categories.flatMap((c) =>
        (c.subcategories || []).map((sub) => ({
          ...sub,
          category: { id: c.id, name: c.name, slug: c.slug },
        }))
      ) as Subcategory[];
    },
  });
};

export const useSubcategoriesByCategorySlug = (categorySlug: string) => {
  return useQuery({
    queryKey: ['subcategories-by-slug', categorySlug],
    queryFn: async () => {
      const res = await api.get(`/categories/slug/${categorySlug}`);
      const category = (res.data?.data || res.data) as Category;
      return (category.subcategories || []) as Subcategory[];
    },
    enabled: !!categorySlug,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug: string; image_url?: string }) => {
      const res = await api.post('/categories', { name: data.name, slug: data.slug, imageUrl: data.image_url });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; slug?: string; image_url?: string }) => {
      const res = await api.put(`/categories/${id}`, { name: data.name, slug: data.slug, imageUrl: data.image_url });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug: string; category_id: string; image_url?: string }) => {
      const res = await api.post(`/categories/${data.category_id}/subcategories`, {
        name: data.name,
        slug: data.slug,
        imageUrl: data.image_url,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; slug?: string; image_url?: string }) => {
      const res = await api.put(`/categories/subcategories/${id}`, { name: data.name, slug: data.slug, imageUrl: data.image_url });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/subcategories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
