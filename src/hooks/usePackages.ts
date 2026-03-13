import { useState, useEffect } from "react";
import { businessData } from "@/data/studioData";

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
    // Map local static data to the Package format
    try {
      const p: Package[] = [];
      let sortOrder = 0;

      const addPkg = (cat: string, slugPrefix: string, key: string, data: any, sub: string = "") => {
        sortOrder++;
        const nameMap: Record<string, string> = {
          standard: "Standard",
          super_vip: "Super VIP",
          silver: "Silver",
          super: "Super",
          basic: "Basic",
          ultra: "Ultra",
          ultra_plus: "Ultra Plus",
          single: "Single",
          group: "Group",
          family_group: "Family Group",
          platinum: "Platinum",
          premium_family: "Premium Family",
          gold: "Gold"
        };
        
        let features: string[] = [];
        
        if (data.outfits) features.push(`${data.outfits} Outfit${data.outfits > 1 ? 's' : ''}`);
        if (data.edited_soft_copies) features.push(`${data.edited_soft_copies} Edited Soft Copies`);
        if (data.extras) features.push(...data.extras);
        if (data.photos) features.push(data.photos);
        if (data.deliverables) features.push(...data.deliverables);
        if (data.rule) features.push(data.rule);
        if (data.type) features.push(data.type);

        p.push({
          id: `${slugPrefix}-${key}`,
          slug: `${slugPrefix}-${key}`,
          name: nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
          subtitle: sub,
          category: cat,
          price: data.price,
          features,
          popular: key === "super" || key === "gold",
          sort_order: sortOrder,
          additional_features: []
        });
      };

      // Map wedding
      Object.entries(businessData.packages.weddings_jan_to_sept).filter(([k]) => k !== "add_ons").forEach(([k, v]) => addPkg("wedding", "wedding", k, v, "Wedding Collection"));

      // Map prewedding
      Object.entries(businessData.packages.pre_wedding_studio).forEach(([k, v]) => addPkg("prewedding", "prewedding-studio", k, v, "Pre-Wedding Studio"));
      Object.entries(businessData.packages.couple_portrait_outdoor).forEach(([k, v]) => addPkg("prewedding", "couple-outdoor", k, v, "Couple Portrait Outdoor"));

      // Map studio (All other sessions)
      Object.entries(businessData.packages.studio_package_solo).forEach(([k, v]) => addPkg("studio", "studio-solo", k, v, "Studio Solo"));
      Object.entries(businessData.packages.outdoor_package_solo).forEach(([k, v]) => addPkg("studio", "outdoor-solo", k, v, "Outdoor Solo"));
      Object.entries(businessData.packages.maternity_outdoor).forEach(([k, v]) => addPkg("studio", "maternity", k, v, "Maternity Outdoor"));
      Object.entries(businessData.packages.corporate_head_shoot_studio).forEach(([k, v]) => addPkg("studio", "corporate", k, v, "Corporate Head Shoot"));
      Object.entries(businessData.packages.family_and_friends_outdoor).forEach(([k, v]) => addPkg("studio", "family", k, v, "Family & Friends Outdoor"));
      Object.entries(businessData.packages.convocation_graduation).filter(([k]) => k !== "extra_image_cost" && k !== "specific_frames").forEach(([k, v]) => addPkg("studio", "convocation", k, v, "Convocation/Graduation"));
      Object.entries(businessData.packages.call_to_bar).filter(([k]) => k !== "extra_image_cost" && k !== "specific_frames").forEach(([k, v]) => addPkg("studio", "call-to-bar", k, v, "Call to Bar"));
      
      setPackages(p);
    } catch (err: any) {
      console.error("Error formatting static packages:", err);
      setError("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, []);

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
    refetch: () => {},
  };
}
