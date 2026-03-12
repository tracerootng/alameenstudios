import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Package {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  features: string[];
  popular: boolean;
  sort_order: number;
  description?: string;
  additional_features?: string[];
  delivery_time?: string;
  ideal_for?: string;
  image_url?: string;
  hidden?: boolean;
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("category")
        .order("sort_order");

      if (error) throw error;

      const parsed = data?.map((pkg) => ({
        ...pkg,
        features: Array.isArray(pkg.features)
          ? (pkg.features as string[])
          : JSON.parse(String(pkg.features) || "[]"),
        additional_features: Array.isArray(pkg.additional_features)
          ? (pkg.additional_features as string[])
          : JSON.parse(String(pkg.additional_features) || "[]"),
      })) || [];

      // Filter out hidden packages for public display
      setPackages(parsed.filter(p => !p.hidden));
    } catch (err: any) {
      console.error("Error fetching packages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getByCategory = (category: string) => 
    packages.filter((p) => p.category === category);

  const getBySlug = (slug: string) => 
    packages.find((p) => p.slug === slug);

  const formatPrice = (price: number) =>
    `N${new Intl.NumberFormat("en-NG").format(price)}`;

  return {
    packages,
    loading,
    error,
    getByCategory,
    getBySlug,
    formatPrice,
    refetch: fetchPackages,
  };
}
