import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ShieldOff, User } from "lucide-react";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  isAdmin: boolean;
}

export function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map((r) => r.user_id) || []);

      const usersWithRoles: UserProfile[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        isAdmin: adminUserIds.has(profile.id),
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    setUpdating(userId);
    try {
      if (currentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;

        toast({
          title: "Role updated",
          description: "Admin access revoked",
        });
      } else {
        // Add admin role
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "admin",
        });

        if (error) throw error;

        toast({
          title: "Role updated",
          description: "Admin access granted",
        });
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isAdmin: !currentlyAdmin } : user
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl tracking-[0.1em] text-foreground mb-2">
          User Management
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      <div className="bg-card border border-primary/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3 text-left font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-right font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm text-foreground">
                        {user.full_name || "No name"}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-body text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 font-body text-xs ${
                      user.isAdmin
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.isAdmin ? (
                      <>
                        <Shield className="w-3 h-3" />
                        Admin
                      </>
                    ) : (
                      "User"
                    )}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    disabled={updating === user.id}
                    className={`inline-flex items-center gap-2 px-3 py-2 font-body text-xs transition-colors ${
                      user.isAdmin
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-primary hover:bg-primary/10"
                    } disabled:opacity-50`}
                  >
                    {updating === user.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : user.isAdmin ? (
                      <>
                        <ShieldOff className="w-3 h-3" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3" />
                        Make Admin
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
