import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

export interface SiteSettings {
  siteName: string;
  siteEmail: string;
  siteDescription: string;
  bannerText: string;
  bannerEnabled: boolean;
  primaryColor: string;
  logoUrl: string;
  [key: string]: any;
}

const defaultSettings: SiteSettings = {
  siteName: "Taano",
  siteEmail: "admin@taanoshop.com",
  siteDescription: "Your trusted marketplace for quality products",
  bannerText: "Free shipping on orders over $10 • 90-day returns • Price match guarantee",
  bannerEnabled: true,
  primaryColor: "#0d9488",
  logoUrl: "",
};

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<SiteSettings> => {
      try {
        const res = await api.get('/settings');
        const remote = res.data?.data || {};
        return { ...defaultSettings, ...remote };
      } catch {
        return defaultSettings;
      }
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      await api.put('/settings', settings);
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    },
  });
};
