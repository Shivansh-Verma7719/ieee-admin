import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/database.types";

export type Permission = Tables<"permissions">;
export type PersonPermission = Tables<"people_permissions">;

export interface PersonPermissionWithDetails extends PersonPermission {
  permission?: Permission;
  granted_by_person?: Tables<"people">;
}

// Get current user ID by email
export async function getCurrentUserIdByEmail(): Promise<number | null> {
  const supabase = createClient();

  try {
    // Get claims from current session
    const { data: claims } = await supabase.auth.getClaims();

    if (!claims?.claims?.email) {
      console.error("No email found in claims");
      return null;
    }

    // Find the person with this email
    const { data, error } = await supabase
      .from("people")
      .select("id")
      .eq("email", claims.claims.email)
      .single();

    if (error) {
      console.error("Error fetching current user:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

// Get all permissions
export async function getAllPermissions(): Promise<Permission[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("key");

    if (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }
}

// Get permissions for a specific person
export async function getPersonPermissions(
  personId: number
): Promise<PersonPermissionWithDetails[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("people_permissions")
      .select(
        `
                *,
                permission:permissions(*),
                granted_by_person:people!people_permissions_granted_by_fkey(*)
            `
      )
      .eq("person_id", personId);

    if (error) {
      console.error("Error fetching person permissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching person permissions:", error);
    return [];
  }
}

// Update permissions for a person
export async function updatePersonPermissions(
  personId: number,
  permissions: { permission_id: string; expires_at: string | null }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // Get current user ID
    const currentUserId = await getCurrentUserIdByEmail();

    // First, delete all existing permissions for this person
    const { error: deleteError } = await supabase
      .from("people_permissions")
      .delete()
      .eq("person_id", personId);

    if (deleteError) {
      console.error("Error deleting existing permissions:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // If no permissions to add, return success
    if (permissions.length === 0) {
      return { success: true };
    }

    // Insert new permissions
    const permissionsToInsert = permissions.map((perm) => ({
      person_id: personId,
      permission_id: perm.permission_id,
      expires_at: perm.expires_at,
      granted_at: new Date().toISOString(),
      granted_by: currentUserId,
    }));

    const { error: insertError } = await supabase
      .from("people_permissions")
      .insert(permissionsToInsert);

    if (insertError) {
      console.error("Error inserting permissions:", insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating person permissions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Grant a specific permission to a person
export async function grantPermission(
  personId: number,
  permissionId: string,
  expiresAt?: string,
  grantedBy?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase.from("people_permissions").insert({
      person_id: personId,
      permission_id: permissionId,
      expires_at: expiresAt || null,
      granted_at: new Date().toISOString(),
      granted_by: grantedBy || null,
    });

    if (error) {
      console.error("Error granting permission:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error granting permission:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Revoke a specific permission from a person
export async function revokePermission(
  personId: number,
  permissionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("people_permissions")
      .delete()
      .eq("person_id", personId)
      .eq("permission_id", permissionId);

    if (error) {
      console.error("Error revoking permission:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error revoking permission:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Check if a person has a specific permission
export async function hasPermission(
  personId: number,
  permissionKey: string
): Promise<boolean> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("people_permissions")
      .select(
        `
                expires_at,
                permission:permissions!inner(key)
            `
      )
      .eq("person_id", personId)
      .eq("permissions.key", permissionKey)
      .single();

    if (error || !data) {
      return false;
    }

    // Check if permission has expired
    if (data.expires_at && new Date(data.expires_at) <= new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

// Get all people with their permissions count
export async function getPeopleWithPermissionsCounts(): Promise<
  (Tables<"people"> & {
    role?: Tables<"roles">;
    team?: Tables<"teams">;
    activePermissionsCount: number;
  })[]
> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from("people").select(`
                *,
                role:roles(*),
                team:teams(*),
                people_permissions(
                    id,
                    expires_at,
                    permission:permissions(*)
                )
            `);

    if (error) {
      console.error("Error fetching people with permissions:", error);
      return [];
    }

    return (data || []).map((person) => ({
      ...person,
      activePermissionsCount:
        person.people_permissions?.filter(
          (pp: PersonPermission) =>
            !pp.expires_at || new Date(pp.expires_at) > new Date()
        ).length || 0,
    }));
  } catch (error) {
    console.error("Error fetching people with permissions:", error);
    return [];
  }
}
