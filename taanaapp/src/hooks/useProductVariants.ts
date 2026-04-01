import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock: number;
  sku: string | null;
  price_modifier: number;
  created_at: string;
  updated_at: string;
}

// Product variants — no dedicated backend endpoint yet, stubs return empty
export const useProductVariants = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async (): Promise<ProductVariant[]> => [],
    enabled: !!productId,
  });
};

export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variant: {
      product_id: string;
      size?: string | null;
      color?: string | null;
      stock: number;
      sku?: string | null;
      price_modifier?: number;
    }): Promise<ProductVariant> => {
      throw new Error('Variant management not yet available');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.product_id] });
    },
  });
};

export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: Partial<ProductVariant> & { id: string }): Promise<ProductVariant> => {
      throw new Error('Variant management not yet available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
};

export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string): Promise<void> => {
      throw new Error('Variant management not yet available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
};

export const useBulkCreateVariants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: {
      productId: string;
      variants: Array<{
        size?: string | null;
        color?: string | null;
        stock: number;
        sku?: string | null;
        price_modifier?: number;
      }>;
    }): Promise<ProductVariant[]> => {
      throw new Error('Variant management not yet available');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.productId] });
    },
  });
};
