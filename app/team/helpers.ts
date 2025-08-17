import { createClient } from "@/utils/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";
import { compressImage, CompressionResult } from "@/utils/images/compression";
import { deleteProfileImage } from "@/utils/images/storage";

export type Person = Tables<"people"> & {
  role?: Tables<"roles">;
  team?: Tables<"teams">;
};

export type Role = Tables<"roles">;
export type Team = Tables<"teams">;

export type PersonInsert = TablesInsert<"people">;
export type PersonUpdate = TablesUpdate<"people">;

export interface uploadResponse {
  url: string | null;
  compressionInfo?: CompressionResult["compressionInfo"];
}

// Helper to upload profile images
export async function uploadProfileImage(file: File): Promise<uploadResponse> {
  const supabase = createClient();

  try {
    // Compress the image file and convert to WebP
    const compressionResult = await compressImage(file, {
      maxSizeMB: 0.5, // 500KB max for profile images
      maxWidthOrHeight: 600, // 600px max dimension for profile images
      quality: 0.85, // Good quality for profile images
    });

    // Generate a unique file name with WebP extension
    const fileExtension = ".webp";
    const fileName = `profile-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}${fileExtension}`;

    // Upload the compressed file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("profile_images")
      .upload(fileName, compressionResult.file, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading profile image:", error);
      return { url: null };
    }

    // Get the public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile_images").getPublicUrl(data.path);

    return {
      url: publicUrl,
      compressionInfo: compressionResult.compressionInfo,
    };
  } catch (error) {
    console.error("Error processing profile image:", error);
    return { url: null };
  }
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
  person: Person
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // If the person has a profile image, try to delete it from storage
    if (person.profile_image) {
      // Check if the image URL is from our profile_images bucket
      if (person.profile_image.includes("/profile_images/")) {
        const deleteSuccess = await deleteProfileImage(
          person.profile_image,
          "profile_images"
        );
        if (!deleteSuccess) {
          console.warn(
            "Failed to delete profile image, but continuing with person deletion"
          );
        }
      }
    }

    // Set the person as inactive
    const { error } = await supabase
      .from("people")
      .update({ is_active: false })
      .eq("id", person.id);

    if (error) {
      console.error("Error deleting person:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deletePerson:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
