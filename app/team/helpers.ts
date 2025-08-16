import { createClient } from "@/utils/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

export type Person = Tables<"people"> & {
  role?: Tables<"roles">;
  team?: Tables<"teams">;
};

export type Role = Tables<"roles">;
export type Team = Tables<"teams">;

export type PersonInsert = TablesInsert<"people">;
export type PersonUpdate = TablesUpdate<"people">;

// Helper to upload profile images
export async function uploadProfileImage(file: File): Promise<string | null> {
  const supabase = createClient();

  // Generate a unique file name
  const fileName = `profile-${Date.now()}-${file.name}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("profile_images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading profile image:", error);
    return null;
  }

  // Get the public URL for the uploaded image
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile_images").getPublicUrl(data.path);

  return publicUrl;
}

// Fetch all people with their roles and teams
export async function getPeople(): Promise<Person[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("people")
    .select(
      `
      *,
      role:roles(*),
      team:teams(*)
    `
    )
    .eq("is_active", true)
    .order("id");

  if (error) {
    console.error("Error fetching people:", error);
    return [];
  }

  return data || [];
}

// Fetch all roles
export async function getRoles(): Promise<Role[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  return data || [];
}

// Fetch all teams
export async function getTeams(): Promise<Team[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching teams:", error);
    return [];
  }

  return data || [];
}

// Create a new person
export async function createPerson(
  personData: PersonInsert
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from("people").insert([personData]);

  if (error) {
    console.error("Error creating person:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update a person
export async function updatePerson(
  id: number,
  personData: PersonUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("people")
    .update(personData)
    .eq("id", id);

  if (error) {
    console.error("Error updating person:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete a person (set inactive)
export async function deletePerson(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("people")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting person:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Create a new role
export async function createRole(
  roleData: TablesInsert<"roles">
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from("roles").insert([roleData]);

  if (error) {
    console.error("Error creating role:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Create a new team
export async function createTeam(
  teamData: TablesInsert<"teams">
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from("teams").insert([teamData]);

  if (error) {
    console.error("Error creating team:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
