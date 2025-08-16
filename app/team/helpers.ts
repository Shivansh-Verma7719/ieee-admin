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

// Fetch all people with their roles and teams, ordered by team and then by display_order within team
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
    .order("team_id", { ascending: true, nullsFirst: false })
    .order("display_order", { ascending: true });

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
    .order("display_order", { ascending: true })
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

// Update team data
export async function updateTeam(
  id: number,
  teamData: TablesUpdate<"teams">
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from("teams").update(teamData).eq("id", id);

  if (error) {
    console.error("Error updating team:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete team
export async function deleteTeam(
  teamId: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // First check if there are any people associated with this team
  const { data: people, error: checkError } = await supabase
    .from("people")
    .select("id")
    .eq("team_id", teamId)
    .eq("is_active", true);

  if (checkError) {
    console.error("Error checking team dependencies:", checkError);
    return { success: false, error: checkError.message };
  }

  if (people && people.length > 0) {
    return {
      success: false,
      error:
        "Cannot delete team with active members. Please remove or reassign members first.",
    };
  }

  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) {
    console.error("Error deleting team:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update person display order within a team
export async function updatePersonOrder(
  updates: { id: number; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    for (const update of updates) {
      const { error } = await supabase
        .from("people")
        .update({ display_order: update.display_order })
        .eq("id", update.id);

      if (error) {
        console.error("Error updating person order:", error);
        throw error;
      }
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update team display order
export async function updateTeamOrder(
  updates: { id: number; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    for (const update of updates) {
      const { error } = await supabase
        .from("teams")
        .update({ display_order: update.display_order })
        .eq("id", update.id);

      if (error) {
        console.error("Error updating team order:", error);
        throw error;
      }
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
