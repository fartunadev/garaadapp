import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/client";

interface ShippingZone {
  id: string;
  zone_name: string;
  country_code: string;
  country_name: string;
  base_rate: number;
  per_kg_rate: number;
  price_multiplier: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

interface GeoLocation {
  country_code: string;
  country_name: string;
}

// Auto-detect user's country via free IP geolocation
const detectCountry = async (): Promise<GeoLocation | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return {
      country_code: data.country_code || "XX",
      country_name: data.country_name || "Unknown",
    };
  } catch {
    return null;
  }
};

export const useShippingZone = (overrideCountryCode?: string) => {
  const [detectedCountry, setDetectedCountry] = useState<GeoLocation | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // Auto-detect on mount
  useEffect(() => {
    detectCountry().then((geo) => {
      setDetectedCountry(geo);
      setIsDetecting(false);
    });
  }, []);

  const countryCode = overrideCountryCode || detectedCountry?.country_code || "XX";

  // Fetch all shipping zones
  const { data: allZones } = useQuery({
    queryKey: ["shipping-zones"],
    queryFn: async () => {
      const { data, error } = await Database
        .from("shipping_zones")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as ShippingZone[];
    },
  });

  // Find matching zone or fallback to XX
  const zone = allZones?.find((z) => z.country_code === countryCode)
    || allZones?.find((z) => z.country_code === "XX")
    || null;

  const calculateShipping = (weightKg: number = 1) => {
    if (!zone) return 0;
    return zone.base_rate + zone.per_kg_rate * weightKg;
  };

  const applyPriceMultiplier = (price: number) => {
    if (!zone) return price;
    return Math.round(price * zone.price_multiplier * 100) / 100;
  };

  return {
    zone,
    allZones,
    detectedCountry,
    isDetecting,
    countryCode,
    calculateShipping,
    applyPriceMultiplier,
  };
};
