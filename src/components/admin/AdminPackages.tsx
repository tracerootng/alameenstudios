import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Edit2, Save, X, Star, Upload, Loader2, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  features: string[];
  popular: boolean;
  sort_order: number;
  description: string;
  additional_features: string[];
  delivery_time: string;
  ideal_for: string;
  image_url: string;
  hidden: boolean;
}

export function AdminPackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Package>>({});
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      const parsed = data?.map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) 
          ? (pkg.features as string[]) 
          : JSON.parse(String(pkg.features) || "[]"),
        additional_features: Array.isArray(pkg.additional_features) 
          ? (pkg.additional_features as string[]) 
          : JSON.parse(String(pkg.additional_features) || "[]"),
        description: pkg.description || "",
        delivery_time: pkg.delivery_time || "",
        ideal_for: pkg.ideal_for || "",
        image_url: pkg.image_url || "",
        hidden: pkg.hidden || false,
      })) || [];
      
      setPackages(parsed);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (pkg: Package) => {
    setEditingId(pkg.id);
    setEditData({
      name: pkg.name,
      subtitle: pkg.subtitle,
      price: pkg.price,
      features: pkg.features,
      popular: pkg.popular,
      description: pkg.description,
      additional_features: pkg.additional_features,
      delivery_time: pkg.delivery_time,
      ideal_for: pkg.ideal_for,
      image_url: pkg.image_url,
      hidden: pkg.hidden,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `packages/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("event-photos")
        .getPublicUrl(fileName);

      setEditData({ ...editData, image_url: urlData.publicUrl });
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const savePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from("packages")
        .update({
          name: editData.name,
          subtitle: editData.subtitle,
          price: editData.price,
          features: editData.features,
          popular: editData.popular,
          description: editData.description,
          additional_features: editData.additional_features,
          delivery_time: editData.delivery_time,
          ideal_for: editData.ideal_for,
          image_url: editData.image_url,
          hidden: editData.hidden,
        })
        .eq("id", id);

      if (error) throw error;

      setPackages(prev =>
        prev.map(pkg =>
          pkg.id === id
            ? { ...pkg, ...editData } as Package
            : pkg
        )
      );

      toast({ title: "Saved", description: "Package updated successfully" });
      cancelEditing();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save package", variant: "destructive" });
    }
  };

  const toggleHidden = async (pkg: Package) => {
    try {
      const { error } = await supabase
        .from("packages")
        .update({ hidden: !pkg.hidden })
        .eq("id", pkg.id);

      if (error) throw error;

      setPackages(prev =>
        prev.map(p => p.id === pkg.id ? { ...p, hidden: !p.hidden } : p)
      );

      toast({ title: pkg.hidden ? "Package visible" : "Package hidden" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const groupedPackages = packages.reduce((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = [];
    acc[pkg.category].push(pkg);
    return acc;
  }, {} as Record<string, Package[]>);

  const categoryLabels: Record<string, string> = {
    wedding: "Wedding Packages",
    prewedding: "Pre-Wedding Sessions",
    studio: "Studio Sessions",
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-[0.1em] text-foreground mb-2">Packages</h1>
        <p className="text-muted-foreground text-sm">Edit pricing, features, and all package details</p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {Object.entries(groupedPackages).map(([category, pkgs]) => (
        <div key={category} className="space-y-4">
          <h2 className="font-display text-lg text-primary tracking-wider">
            {categoryLabels[category] || category}
          </h2>

          <div className="space-y-4">
            {pkgs.map((pkg) => (
              <motion.div
                key={pkg.id}
                layout
                className={`bg-card border p-6 ${
                  pkg.popular ? "border-primary" : "border-primary/10"
                } ${pkg.hidden ? "opacity-60" : ""}`}
              >
                {editingId === pkg.id ? (
                  // Edit Mode - Full form
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display text-lg text-foreground">Editing: {pkg.name}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => savePackage(pkg.id)} className="flex items-center gap-1 text-green-500 hover:bg-green-500/10 px-3 py-1 text-sm">
                          <Save className="w-4 h-4" /> Save
                        </button>
                        <button onClick={cancelEditing} className="flex items-center gap-1 text-red-500 hover:bg-red-500/10 px-3 py-1 text-sm">
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Package Name</label>
                          <input
                            type="text"
                            value={editData.name || ""}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full bg-transparent border border-primary/20 px-3 py-2 text-foreground outline-none focus:border-primary/60"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
                          <input
                            type="text"
                            value={editData.subtitle || ""}
                            onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                            className="w-full bg-transparent border border-primary/20 px-3 py-2 text-foreground outline-none focus:border-primary/60"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Price (NGN)</label>
                          <input
                            type="number"
                            value={editData.price || 0}
                            onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })}
                            className="w-full bg-transparent border border-primary/20 px-3 py-2 text-foreground outline-none focus:border-primary/60"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Delivery Time</label>
                          <input
                            type="text"
                            value={editData.delivery_time || ""}
                            onChange={(e) => setEditData({ ...editData, delivery_time: e.target.value })}
                            placeholder="e.g., 4-6 weeks"
                            className="w-full bg-transparent border border-primary/20 px-3 py-2 text-foreground outline-none focus:border-primary/60"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Ideal For</label>
                          <input
                            type="text"
                            value={editData.ideal_for || ""}
                            onChange={(e) => setEditData({ ...editData, ideal_for: e.target.value })}
                            placeholder="e.g., Intimate ceremonies"
                            className="w-full bg-transparent border border-primary/20 px-3 py-2 text-foreground outline-none focus:border-primary/60"
                          />
                        </div>

                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editData.popular || false}
                              onChange={(e) => setEditData({ ...editData, popular: e.target.checked })}
                              className="accent-primary"
                            />
                            <span className="text-sm text-muted-foreground">Popular badge</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editData.hidden || false}
                              onChange={(e) => setEditData({ ...editData, hidden: e.target.checked })}
                              className="accent-primary"
                            />
                            <span className="text-sm text-muted-foreground">Hidden</span>
                          </label>
                        </div>
                      </div>

                      {/* Feature Image */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Feature Image</label>
                          {editData.image_url ? (
                            <div className="relative aspect-video bg-muted">
                              <img
                                src={editData.image_url}
                                alt="Package"
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => setEditData({ ...editData, image_url: "" })}
                                className="absolute top-2 right-2 p-1 bg-background/80 text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full aspect-video border border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                            >
                              {uploading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6" />
                                  <span className="text-xs">Upload image</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Full Description</label>
                      <textarea
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                        className="w-full bg-transparent border border-primary/20 px-3 py-2 text-foreground outline-none focus:border-primary/60 resize-none"
                        placeholder="Detailed package description shown in the modal..."
                      />
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Package Includes (one per line)</label>
                        <textarea
                          value={(editData.features || []).join("\n")}
                          onChange={(e) => setEditData({ ...editData, features: e.target.value.split("\n").filter(f => f.trim()) })}
                          rows={6}
                          className="w-full bg-transparent border border-primary/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Additional Benefits (one per line)</label>
                        <textarea
                          value={(editData.additional_features || []).join("\n")}
                          onChange={(e) => setEditData({ ...editData, additional_features: e.target.value.split("\n").filter(f => f.trim()) })}
                          rows={6}
                          className="w-full bg-transparent border border-primary/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode - Compact with expand option
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {pkg.popular && (
                            <div className="flex items-center gap-1 text-primary text-xs">
                              <Star className="w-3 h-3 fill-primary" />
                              Popular
                            </div>
                          )}
                          {pkg.hidden && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </div>
                          )}
                        </div>
                        <h3 className="font-display text-lg text-foreground">{pkg.name}</h3>
                        <p className="text-xs text-muted-foreground">{pkg.subtitle}</p>
                        <p className="font-display text-xl text-primary mt-2">{formatPrice(pkg.price)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleHidden(pkg)}
                          className="p-2 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                          title={pkg.hidden ? "Show package" : "Hide package"}
                        >
                          {pkg.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => startEditing(pkg)}
                          className="text-primary hover:bg-primary/10 p-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
                          className="p-2 hover:bg-muted/50 transition-colors text-muted-foreground"
                        >
                          {expandedId === pkg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === pkg.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-primary/10 space-y-4"
                      >
                        {pkg.image_url && (
                          <div className="aspect-video max-w-xs">
                            <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover" />
                          </div>
                        )}

                        {pkg.description && (
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs text-primary mb-2">Package Includes</h4>
                            <ul className="space-y-1">
                              {pkg.features.map((f, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-xs text-primary mb-2">Additional Benefits</h4>
                            <ul className="space-y-1">
                              {pkg.additional_features.map((f, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex gap-6 text-xs text-muted-foreground">
                          {pkg.delivery_time && <span>Delivery: {pkg.delivery_time}</span>}
                          {pkg.ideal_for && <span>Ideal for: {pkg.ideal_for}</span>}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
