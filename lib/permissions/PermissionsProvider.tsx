"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserIdByEmail, getPersonPermissions } from "@/app/manage-team/helpers";

// Module-based permissions
export const PERMISSIONS = {
    PHOTOS: 'photos',
    QUERIES: 'queries',
    TEAM: 'team',
    EVENTS: 'events',
} as const;

interface PermissionsContextType {
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    loading: boolean;
    user: {
        id: number | null;
        email: string | null;
        full_name: string | null;
    } | null;
    refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{
        id: number | null;
        email: string | null;
        full_name: string | null;
    } | null>(null);

    const supabase = createClient();

    const refreshPermissions = async () => {
        setLoading(true);

        try {
            // Get user ID and details
            const userId = await getCurrentUserIdByEmail();

            if (!userId) {
                setUser(null);
                setPermissions([]);
                setLoading(false);
                return;
            }

            // Get user details
            const { data: userData, error: userError } = await supabase
                .from("people")
                .select("id, email, full_name")
                .eq("id", userId)
                .single();

            if (userError) {
                console.error("Error fetching user data:", userError);
                setLoading(false);
                return;
            }

            setUser(userData);

            // Get user permissions
            const userPerms = await getPersonPermissions(userId);

            // Extract active permission keys
            const activePermissions = userPerms
                .filter(perm => {
                    // Check if permission is not expired
                    if (perm.expires_at && new Date(perm.expires_at) <= new Date()) {
                        return false;
                    }
                    return perm.permission?.key;
                })
                .map(perm => perm.permission!.key!)
                .filter(Boolean);

            setPermissions(activePermissions);
        } catch (err) {
            console.error("Error loading permissions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPermissions();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            refreshPermissions();
        });

        return () => subscription.unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const value: PermissionsContextType = {
        permissions,
        hasPermission,
        loading,
        user,
        refreshPermissions,
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions(): PermissionsContextType {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error("usePermissions must be used within a PermissionsProvider");
    }
    return context;
}
