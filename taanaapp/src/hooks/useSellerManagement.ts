import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useVerifySeller = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      if (is_verified) {
        await api.post(`/sellers/${id}/verify`);
      } else {
        await api.put(`/sellers/${id}`, { isVerified: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};

export const useToggleSellerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (is_active) {
        await api.post(`/sellers/${id}/approve`);
      } else {
        await api.post(`/sellers/${id}/deactivate`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};

export const useUpdateSellerCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, commission_rate }: { id: string; commission_rate: number }) => {
      await api.put(`/sellers/${id}`, { commissionRate: commission_rate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};

export const useDeleteSeller = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sellers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};
